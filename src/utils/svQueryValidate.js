import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export default function validate(model) {
  const markers = [];

  // Count open and close parenthesis to make sure they match
  const parenthesisStack = [];
  // Keep track of when we are in an exact match or not
  let isInStringFlag = false;

  for (let lineIdx = 1; lineIdx < model.getLineCount() + 1; lineIdx++) {
    const range = {
      startLineNumber: lineIdx,
      startColumn: 1,
      endLineNumber: lineIdx,
      endColumn: model.getLineLength(lineIdx) + 1,
    };
    let line = model.getValueInRange(range).trim();

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      const orGroup = line.substr(charIdx - 1, 4); // substring used to detect mispelled "OR"s

      if (char === '"') {
        isInStringFlag = !isInStringFlag;
      } else if (!isInStringFlag) {
        if (char === "(") {
          parenthesisStack.push({ line: lineIdx, col: charIdx });
        } else if (char === ")") {
          if (parenthesisStack.length > 0) {
            parenthesisStack.pop();
          } else {
            markers.push({
              message: `Unmatched closed parenthesis`,
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineIdx,
              startColumn: charIdx + 1,
              endLineNumber: lineIdx,
              endColumn: charIdx + 2,
            });
          }
        } else if (orGroup.match(/\s[oip]r\s/i) && orGroup !== " OR ") {
          markers.push({
            message: "Mistyped 'OR'",
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineIdx,
            startColumn: charIdx + 1,
            endLineNumber: lineIdx,
            endColumn: charIdx + 3,
          });
        }
      }
    }
  }

  // Mark any remaining open parenthesis
  parenthesisStack.forEach(({ line, col }) =>
    markers.push({
      message: "Unmatched open parenthesis",
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: line,
      startColumn: col + 1,
      endLineNumber: line,
      endColumn: col + 2,
    })
  );

  monaco.editor.setModelMarkers(model, "owner", markers);
}
