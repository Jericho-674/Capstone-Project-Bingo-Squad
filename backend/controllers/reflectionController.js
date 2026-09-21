const db = require("../config/db");

// GET all reflections
const getAllReflections = (req, res) => {
  const sql = "SELECT * FROM reflections ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching reflections:", err);

      return res.status(500).json({
        message: "Failed to fetch reflections"
      });
    }

    res.json(results);
  });
};

// GET one reflection by ID
const getReflectionById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM reflections WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching reflection:", err);

      return res.status(500).json({
        message: "Failed to fetch reflection"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Reflection not found"
      });
    }

    res.json(results[0]);
  });
};

// CREATE a new reflection
const createReflection = (req, res) => {
  const {
    user_id,
    title,
    project_group,
    reflection_date,
    worked_on,
    challenges,
    learned,
    improvement,
    other_reflection,
    status
  } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  const sql = `
    INSERT INTO reflections
    (
      user_id,
      title,
      project_group,
      reflection_date,
      worked_on,
      challenges,
      learned,
      improvement,
      other_reflection,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id,
      title,
      project_group,
      reflection_date,
      worked_on,
      challenges,
      learned,
      improvement,
      other_reflection || null,
      status || "draft"
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating reflection:", err);

        return res.status(500).json({
          message: "Failed to create reflection"
        });
      }

      res.status(201).json({
        message: "Reflection created successfully",
        reflectionId: result.insertId
      });
    }
  );
};

// UPDATE an existing reflection
const updateReflection = (req, res) => {
  const { id } = req.params;

  const {
    user_id,
    title,
    project_group,
    reflection_date,
    worked_on,
    challenges,
    learned,
    improvement,
    other_reflection,
    status
  } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Title is required"
    });
  }

  const sql = `
    UPDATE reflections
    SET
      user_id = ?,
      title = ?,
      project_group = ?,
      reflection_date = ?,
      worked_on = ?,
      challenges = ?,
      learned = ?,
      improvement = ?,
      other_reflection = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      user_id,
      title,
      project_group,
      reflection_date,
      worked_on,
      challenges,
      learned,
      improvement,
      other_reflection || null,
      status || "draft",
      id
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating reflection:", err);

        return res.status(500).json({
          message: "Failed to update reflection"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Reflection not found"
        });
      }

      res.json({
        message: "Reflection updated successfully"
      });
    }
  );
};

// SUBMIT a reflection
const submitReflection = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE reflections
    SET status = 'submitted'
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error submitting reflection:", err);

      return res.status(500).json({
        message: "Failed to submit reflection"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Reflection not found"
      });
    }

    res.json({
      message: "Reflection submitted successfully"
    });
  });
};

// DELETE a draft. Keep the status guard in the DELETE itself so a reflection
// submitted after the client loaded it cannot be deleted by a stale request.
const deleteReflection = (req, res) => {
  const { id } = req.params;

  if (
    typeof id !== "string" ||
    !/^[1-9]\d*$/.test(id) ||
    !Number.isSafeInteger(Number(id))
  ) {
    return res.status(400).json({
      message: "Reflection ID must be a positive integer"
    });
  }

  const reflectionId = Number(id);
  const sql = "DELETE FROM reflections WHERE id = ? AND status = 'draft'";

  // Related database rows are removed by the schema's ON DELETE CASCADE rules.
  // Uploaded files are retained; file URLs must not be treated as trusted paths.
  db.query(sql, [reflectionId], (err, result) => {
    if (err) {
      console.error("Error deleting draft:", err);
      return res.status(500).json({ message: "Failed to delete draft" });
    }

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Draft deleted successfully" });
    }

    // This lookup explains why no row was deleted; it never authorizes another
    // DELETE, even if a concurrent request changes the status during the lookup.
    db.query(
      "SELECT id FROM reflections WHERE id = ?",
      [reflectionId],
      (lookupError, rows) => {
        if (lookupError) {
          console.error("Error checking draft deletion:", lookupError);
          return res.status(500).json({ message: "Failed to delete draft" });
        }

        if (rows.length === 0) {
          return res.status(404).json({ message: "Reflection not found" });
        }

        return res.status(409).json({
          message: "Only draft reflections can be deleted"
        });
      }
    );
  });
};

// Export controller functions
module.exports = {
  getAllReflections,
  getReflectionById,
  createReflection,
  updateReflection,
  submitReflection,
  deleteReflection
};
