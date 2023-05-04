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

describe("Find ambiguous nodes in queries", () => {
  it("Unambiguous queries are validated", () => {
    expect(getFirstAmbigiousNode("foo OR bar")).toBeNull();
    expect(getFirstAmbigiousNode("(foo OR bar) hello")).toBeNull();
    expect(getFirstAmbigiousNode("foo OR (bar hello)")).toBeNull();
    expect(
      getFirstAmbigiousNode("foo* OR (bar hello) -(fudge shoot) lvl:up")
    ).toBeNull();
  });

  it("mismatched AND and OR", () => {
    checkAmbiguousNodeExists("foo OR bar AND hello", [1, 12], [1, 16]);
    checkAmbiguousNodeExists("foo OR bar hello", [1, 12], [1, 12]);
    checkAmbiguousNodeExists("foo bar hello world OR xyz", [1, 21], [1, 24]);

    // multi-line example
    checkAmbiguousNodeExists(
      `
A OR (
  B OR C OR D E
)`,
      [3, 15],
      [3, 15]
    );
  });
});
