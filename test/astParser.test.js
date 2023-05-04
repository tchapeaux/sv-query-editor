import { describe, expect, it } from "vitest";

import { getFirstAmbigiousNode } from "../src/utils/astParser";

function checkAmbiguousNodeExists(
  query,
  [startLine, startCol],
  [endLine, endCol]
) {
  const nodeLocation = getFirstAmbigiousNode(query);
  expect(nodeLocation).not.toBeNull();
  expect(nodeLocation.start.line).toBe(startLine);
  expect(nodeLocation.start.column).toBe(startCol);
  expect(nodeLocation.end.line).toBe(endLine);
  expect(nodeLocation.end.column).toBe(endCol);
}

describe("Simple unambiguous queries", () => {
  it("Sanity check", () => {
    expect(getFirstAmbigiousNode("foo OR bar")).toBeNull();
  });
  it("Simple parenthesis", () => {
    expect(getFirstAmbigiousNode("(foo OR bar) hello")).toBeNull();
    expect(getFirstAmbigiousNode("foo OR (bar hello)")).toBeNull();
  });
  it("Complete valid example", () => {
    expect(
      getFirstAmbigiousNode("foo* OR (bar hello) -(fudge shoot) lvl:up")
    ).toBeNull();
  });
});

describe("Mismatched AND and OR", () => {
  it("Explicit AND", () => {
    checkAmbiguousNodeExists("foo OR bar AND hello", [1, 12], [1, 16]);
  });
  it("Implicit AND", () => {
    checkAmbiguousNodeExists("foo OR bar hello", [1, 12], [1, 12]);
  });
  it("OR within ANDs", () => {
    checkAmbiguousNodeExists("foo bar hello world OR xyz", [1, 21], [1, 24]);
  });
  it("Multi-line", () => {
    checkAmbiguousNodeExists(
      `
A OR (
  B OR C OR D E
)`,
      [3, 15],
      [3, 15]
    );
  });
  it("Filters ambiguity is also detected", () => {
    expect(getFirstAmbigiousNode("foo OR bar lvl:National")).not.toBeNull();
  });
});
