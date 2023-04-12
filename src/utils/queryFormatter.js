export default function formatQuery(query) {
  let formatted = "";
  let currentIndent = 0;

  // normalize query
  query = query.replace(/\n/g, " ");
  query = query.replace(/\s+/g, " ");

  let isInString = false;

  for (let charIdx = 0; charIdx < query.length; charIdx++) {
    const char = query[charIdx];
    if (char === "(" && !isInString) {
      formatted += "(\n";
      currentIndent += 1;
      formatted += "  ".repeat(currentIndent);
    } else if (char === ")" && !isInString) {
      currentIndent -= 1;
      formatted += "\n" + "  ".repeat(currentIndent) + ")";
    } else if (char === "-" && !isInString) {
      formatted += "\n" + "  ".repeat(currentIndent) + "-";
    } else if (char === '"') {
      isInString = !isInString;
      formatted += char;
    } else {
      formatted += char;
    }
  }

  // fix double line returns
  formatted = formatted.replace(/\n+/g, "\n");

  return formatted;
}