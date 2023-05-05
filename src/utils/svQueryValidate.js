import { getFirstAmbigiousNode } from "./astParser";
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
              message: `Parenthèse fermée sans équivalent ouverte`,
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
              message: `Préfixe de filtre invalide: ${lastWord}`,
              startLineNumber: lineIdx + 1,
              startColumn: charIdx - lastWord.length + 1,
              endLineNumber: lineIdx + 1,
              endColumn: charIdx + 1,
            });
          }
        } else if (orGroup !== " OR ") {
          if (orGroup.match(/\s[oip]r\s/i) || orGroup.match(/\sro\s/i)) {
            markers.push({
              message: "Faute de frappe dans 'OR'",
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
      message: "Parenthèse ouverte sans équivalent fermée",
      startLineNumber: line + 1,
      startColumn: col + 1,
      endLineNumber: line + 1,
      endColumn: col + 2,
    })
  );

  // Find ambiguous nodes using the AST parser
  const ambigousNode = getFirstAmbigiousNode(query);
  if (ambigousNode) {
    const line = queryPerLines[ambigousNode.start.line - 1];

    const nbOfNegations = (
      line.substr(0, ambigousNode.start.column).match(/ -/g) || []
    ).length;
    markers.push({
      message:
        "Combinaison ambigue de OR et AND implicite - utilisez des parenthèses",
      startLineNumber: ambigousNode.start.line,
      startColumn: ambigousNode.start.column - 3 * nbOfNegations,
      endLineNumber: ambigousNode.end.line,
      endColumn: ambigousNode.end.column - 3 * nbOfNegations,
    });
  }

  return markers;
}
