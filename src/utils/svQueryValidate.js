import validFilters from "./validFilters";

export default function validate(query) {
  const markers = [];

  // Count open and close parenthesis to make sure they match
  const parenthesisStack = [];
  // Keep track of when we are in an exact match or not
  let isInStringFlag = false;

  const queryPerLines = query.split("\n");
  queryPerLines.forEach((line, lineIdx) => {
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];

      if (char === '"') {
        isInStringFlag = !isInStringFlag;
      } else if (!isInStringFlag) {
        const orGroup = line.substr(charIdx - 1, 4); // substring used to detect mispelled "OR"s

        if (char === "(") {
          parenthesisStack.push({ line: lineIdx, col: charIdx });
        } else if (char === ")") {
          if (parenthesisStack.length > 0) {
            parenthesisStack.pop();
          } else {
            markers.push({
              message: `Unmatched closed parenthesis`,
              startLineNumber: lineIdx + 1,
              startColumn: charIdx + 1,
              endLineNumber: lineIdx + 1,
              endColumn: charIdx + 2,
            });
          }
        } else if (char === ":") {
          // Find full word before ":"
          const lineWords = line.substr(0, charIdx).split(" ");
          const lastWord = lineWords[lineWords.length - 1];
          if (!validFilters.includes(lastWord)) {
            markers.push({
              message: `Invalid filter prefix: ${lastWord}`,
              startLineNumber: lineIdx + 1,
              startColumn: charIdx - lastWord.length + 1,
              endLineNumber: lineIdx + 1,
              endColumn: charIdx + 1,
            });
          }
        } else if (orGroup !== " OR ") {
          if (orGroup.match(/\s[oip]r\s/i) || orGroup.match(/\sro\s/i)) {
            markers.push({
              message: "Mistyped 'OR'",
              startLineNumber: lineIdx + 1,
              startColumn: charIdx + 1,
              endLineNumber: lineIdx + 1,
              endColumn: charIdx + 3,
            });
          }
        }
      }
    }
  });

  // Mark any remaining open parenthesis
  parenthesisStack.forEach(({ line, col }) =>
    markers.push({
      message: "Unmatched open parenthesis",
      startLineNumber: line + 1,
      startColumn: col + 1,
      endLineNumber: line + 1,
      endColumn: col + 2,
    })
  );

  return markers;
}
