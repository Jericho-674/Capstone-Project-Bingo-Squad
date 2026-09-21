const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const controllerPath = path.join(__dirname, "../controllers/reflectionController.js");
const controllerSource = readFileSync(controllerPath, "utf8");

// Load the real controller with a fake database: no live MySQL connection, user
// data deletion, or third-party test dependencies are needed.
function createHandler(query) {
  const controllerModule = { exports: {} };
  vm.runInNewContext(controllerSource, {
    module: controllerModule,
    require(request) {
      assert.equal(request, "../config/db");
      return { query };
    },
    console: { error() {} }
  }, { filename: controllerPath });
  return controllerModule.exports.deleteReflection;
}

function invoke(handler, id) {
  const response = { statusCode: 200, body: undefined, sends: 0 };
  handler({ params: { id } }, {
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },
    json(body) {
      response.body = body;
      response.sends += 1;
      return this;
    }
  });
  assert.equal(response.sends, 1, "respond exactly once");
  return response;
}

function assertGuardedDelete(sql, parameters) {
  assert.equal(sql, "DELETE FROM reflections WHERE id = ? AND status = 'draft'");
  assert.deepEqual(Array.from(parameters), [7]);
}

test("deletes a draft with one parameterized, status-guarded query", () => {
  let queries = 0;
  const handler = createHandler((sql, parameters, callback) => {
    queries += 1;
    assertGuardedDelete(sql, parameters);
    callback(null, { affectedRows: 1 });
  });
  const response = invoke(handler, "7");
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, "Draft deleted successfully");
  assert.equal(queries, 1);
});

for (const status of ["submitted", "assessed", "reviewed", "", null]) {
  test(`protects reflection status ${JSON.stringify(status)}`, () => {
    let queries = 0;
    const reflection = { id: 7, status };
    const handler = createHandler((sql, parameters, callback) => {
      queries += 1;
      if (queries === 1) {
        assertGuardedDelete(sql, parameters);
        callback(null, { affectedRows: reflection.status === "draft" ? 1 : 0 });
      } else {
        assert.equal(queries, 2, "must not retry deletion after a status lookup");
        assert.equal(sql, "SELECT id FROM reflections WHERE id = ?");
        assert.deepEqual(Array.from(parameters), [7]);
        callback(null, [{ id: reflection.id }]);
      }
    });
    const response = invoke(handler, "7");
    assert.equal(response.statusCode, 409);
    assert.equal(response.body.message, "Only draft reflections can be deleted");
    assert.equal(queries, 2);
  });
}

test("returns 404 for a missing or already-deleted reflection", () => {
  let queries = 0;
  const handler = createHandler((sql, parameters, callback) => {
    queries += 1;
    if (queries === 1) {
      assertGuardedDelete(sql, parameters);
      callback(null, { affectedRows: 0 });
    } else {
      assert.equal(sql, "SELECT id FROM reflections WHERE id = ?");
      callback(null, []);
    }
  });
  const response = invoke(handler, "7");
  assert.equal(response.statusCode, 404);
  assert.equal(response.body.message, "Reflection not found");
  assert.equal(queries, 2);
});

test("a draft submitted before the DELETE executes survives a stale delete request", () => {
  const reflection = { id: 7, status: "draft" };
  let deleted = false;
  let queries = 0;
  const handler = createHandler((sql, parameters, callback) => {
    queries += 1;
    if (queries === 1) {
      // A separate submit request reaches MySQL before the pending DELETE.
      reflection.status = "submitted";
      assertGuardedDelete(sql, parameters);
      deleted = reflection.status === "draft";
      callback(null, { affectedRows: deleted ? 1 : 0 });
    } else {
      assert.equal(queries, 2);
      assert.equal(sql, "SELECT id FROM reflections WHERE id = ?");
      callback(null, [{ id: reflection.id }]);
    }
  });
  const response = invoke(handler, "7");
  assert.equal(response.statusCode, 409);
  assert.equal(deleted, false);
  assert.equal(reflection.status, "submitted");
});

test("never retries DELETE if a non-draft changes back to draft during lookup", () => {
  let queries = 0;
  const reflection = { id: 7, status: "submitted" };
  const handler = createHandler((sql, parameters, callback) => {
    queries += 1;
    if (queries === 1) {
      assertGuardedDelete(sql, parameters);
      callback(null, { affectedRows: 0 });
    } else {
      assert.equal(queries, 2);
      assert.equal(sql, "SELECT id FROM reflections WHERE id = ?");
      reflection.status = "draft";
      callback(null, [reflection]);
    }
  });
  const response = invoke(handler, "7");
  assert.equal(response.statusCode, 409);
  assert.equal(queries, 2);
});

for (const id of [undefined, null, "", "0", "-1", "1.5", "1e2", "7abc", " 7", "01", "9007199254740992", "7 OR 1=1", 7]) {
  test(`rejects invalid reflection ID ${JSON.stringify(id)} without a database query`, () => {
    const handler = createHandler(() => assert.fail("invalid IDs must not reach MySQL"));
    const response = invoke(handler, id);
    assert.equal(response.statusCode, 400);
    assert.equal(response.body.message, "Reflection ID must be a positive integer");
  });
}

test("returns a generic 500 on DELETE failure without attempting a lookup", () => {
  let queries = 0;
  const handler = createHandler((sql, parameters, callback) => {
    queries += 1;
    assertGuardedDelete(sql, parameters);
    callback(new Error("Private database error"));
  });
  const response = invoke(handler, "7");
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, "Failed to delete draft");
  assert.equal(queries, 1);
});

test("returns a generic 500 on lookup failure", () => {
  let queries = 0;
  const handler = createHandler((sql, parameters, callback) => {
    queries += 1;
    if (queries === 1) {
      assertGuardedDelete(sql, parameters);
      callback(null, { affectedRows: 0 });
    } else {
      assert.equal(sql, "SELECT id FROM reflections WHERE id = ?");
      callback(new Error("Private database error"));
    }
  });
  const response = invoke(handler, "7");
  assert.equal(response.statusCode, 500);
  assert.equal(response.body.message, "Failed to delete draft");
  assert.equal(queries, 2);
});

test("registers DELETE /:id with the draft deletion controller", () => {
  const calls = [];
  const deleteReflection = () => {};
  const router = Object.fromEntries(["get", "post", "put", "delete"].map(method => [
    method, (route, handler) => calls.push({ method, route, handler })
  ]));
  const routePath = path.join(__dirname, "../routes/reflectionRoutes.js");
  const routeModule = { exports: {} };
  vm.runInNewContext(readFileSync(routePath, "utf8"), {
    module: routeModule,
    require(request) {
      if (request === "express") return { Router: () => router };
      assert.equal(request, "../controllers/reflectionController");
      return { deleteReflection };
    }
  }, { filename: routePath });
  assert.equal(routeModule.exports, router);
  assert.deepEqual(calls.filter(call => call.method === "delete"), [
    { method: "delete", route: "/:id", handler: deleteReflection }
  ]);
});
