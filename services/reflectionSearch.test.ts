import { describe, expect, it } from "vitest";

import {
    rankReflections,
    scoreReflection,
} from "./reflectionSearch";

const reflections = [
  {
    id: "1",
    title: "Sprint planning",
    status: "Submitted",
    challenges: "Our group had poor communication.",
    learned: "I learned how to collaborate with team members.",
  },
  {
    id: "2",
    title: "Backend setup",
    status: "Submitted",
    workedOn: "Implemented Express API endpoints and MySQL storage.",
    challenges: "Debugging a server connection error.",
  },
  {
    id: "3",
    title: "UI design",
    status: "Draft",
    workedOn: "Designed the reflection history screen.",
  },
];

describe("scoreReflection", () => {
  it("matches an exact title keyword", () => {
    const score = scoreReflection(reflections[1], "backend");

    expect(score).toBeGreaterThan(0);
  });

  it("matches related teamwork words", () => {
    const score = scoreReflection(reflections[0], "teamwork");

    expect(score).toBeGreaterThan(0);
  });

  it("matches problem with debugging and error content", () => {
    const score = scoreReflection(reflections[1], "problem");

    expect(score).toBeGreaterThan(0);
  });

  it("returns zero for an unrelated query", () => {
    const score = scoreReflection(reflections[2], "database");

    expect(score).toBe(0);
  });
});

describe("rankReflections", () => {
  it("removes unrelated reflections", () => {
    const results = rankReflections(reflections, "database");

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("2");
  });

  it("places the most relevant reflection first", () => {
    const results = rankReflections(reflections, "backend API");

    expect(results[0].id).toBe("2");
  });

  it("keeps the original list when the query is empty", () => {
    const results = rankReflections(reflections, "");

    expect(results).toEqual(reflections);
  });
});