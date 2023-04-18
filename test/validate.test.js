import { describe, expect, it } from "vitest";

import validate from "../src/utils/svQueryValidate";

function checkHasMarker(query, markerRow, markerCol) {
  const marker = getFirstMarker(query);

  expect(marker.startColumn).toBe(markerCol);
  expect(marker.startLineNumber).toBe(markerRow);
}

function checkIsValidated(query) {
  const markers = validate(query);
  return markers.length === 0;
}

function getFirstMarker(query) {
  const markers = validate(query);
  expect(markers).toHaveLength(1);
  return markers[0];
}

describe("Validate query", () => {
  it("Detect wrong open parenthesis", () => {
    checkHasMarker("(", 1, 1);
    checkHasMarker("(foo) OR (bar", 1, 10);
  });

  it("Detect wrong closed parenthesis", () => {
    checkHasMarker(")", 1, 1);
    checkHasMarker("(foo) OR bar)", 1, 13);
  });

  it("Detect OR typos", () => {
    checkHasMarker(" or ", 1, 2);
    checkHasMarker(" Or ", 1, 2);
    checkHasMarker(" oR ", 1, 2);
    checkHasMarker(" PR ", 1, 2);
    checkHasMarker(" pr ", 1, 2);
    checkHasMarker(" IR ", 1, 2);
    checkHasMarker(" ir ", 1, 2);
    checkHasMarker(" ro ", 1, 2);
    checkHasMarker(" RO ", 1, 2);

    checkHasMarker("aa OR bb OR cc RO dd", 1, 16);
  });

  it("Check valid queries are validated", () => {
    checkIsValidated("(foo) OR (bar)");
    checkIsValidated("aa OR bb -(cc OR dd) stakeholder:National");
    checkIsValidated('"foo bar baz" @foobar #barfoo');
  });
});
