export function formatAsTreeView(query) {
  let formatted = "";
  let currentIndent = 0;
  const INDENT = "  ";

  // normalize query
  query = formatAsSingleLine(query);

  let isInString = false;

  for (let charIdx = 0; charIdx < query.length; charIdx++) {
    const char = query[charIdx];
    if (char === "(" && !isInString) {
      formatted += "(\n";
      currentIndent += 1;
      formatted += INDENT.repeat(currentIndent);
    } else if (char === ")" && !isInString) {
      if (currentIndent > 0) {
        currentIndent -= 1;
      }
      formatted += "\n" + INDENT.repeat(currentIndent) + ")";
    } else if (char === "-" && !isInString) {
      formatted += "\n" + INDENT.repeat(currentIndent) + "-";
    } else if (char === '"') {
      isInString = !isInString;
      formatted += char;
    } else {
      formatted += char;
    }
  }

  // fix double line returns
  formatted = formatted.replace(/\n\s*\n/g, "\n");

  return formatted;
}

export function formatAsSingleLine(query) {
  return query
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
}

export function getFormatter(formatterFunction) {
  return {
    provideDocumentFormattingEdits(model) {
      var formatted = formatterFunction(model.getValue());
      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ];
    },
  };
}
