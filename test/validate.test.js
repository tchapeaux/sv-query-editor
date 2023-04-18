import { describe, expect, it } from "vitest";

import validate from "../src/utils/svQueryValidate";

function checkHasMarker(query, markerRow, markerCol) {
  const markers = validate(query);
  return markers.some(
    (m) => m.startColumn === markerCol && m.startLineNumber === markerRow
  );
}

function checkIsValidated(query) {
  const markers = validate(query);
  return markers.length === 0;
}

describe("Validate query", () => {
  it("Check open parenthesis", () => {
    expect(checkHasMarker("(", 1, 1)).toBeTruthy();
    expect(checkHasMarker("(foo) OR (bar", 1, 10)).toBeTruthy();
  });

  it("Check closed parenthesis", () => {
    expect(checkHasMarker(")", 1, 1)).toBeTruthy();
    expect(checkHasMarker("(foo) OR bar)", 1, 13)).toBeTruthy();
  });

  it("Check OR typos", () => {
    expect(checkHasMarker(" or ", 1, 2)).toBeTruthy();
    expect(checkHasMarker(" Or ", 1, 2)).toBeTruthy();
    expect(checkHasMarker(" oR ", 1, 2)).toBeTruthy();
    expect(checkHasMarker(" PR ", 1, 2)).toBeTruthy();
    expect(checkHasMarker(" pr ", 1, 2)).toBeTruthy();
    expect(checkHasMarker(" IR ", 1, 2)).toBeTruthy();
    expect(checkHasMarker(" ir ", 1, 2)).toBeTruthy();
  });

  it("Valid queries", () => {
    expect(checkIsValidated("(foo) OR (bar)")).toBeTruthy();
  });
});
