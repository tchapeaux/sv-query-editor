import lucene from "lucene";

function DFS(currentNode) {
  const nodes = [];

  if (currentNode.left) {
    nodes.push(...DFS(currentNode.left));
  }

  nodes.push(currentNode);

  if (currentNode.right) {
    nodes.push(...DFS(currentNode.right));
  }

  return nodes;
}

function translateSvToLucene(query) {
  // These are "quick fixes" to support some general typos or quirks present in SV data
  return query.replace(/\)-\(/g, ") -(").replace(/ -/g, " NOT ");
}

function extractNodeLocation(ambigousNode) {
  return {
    start: ambigousNode.left?.termLocation?.end,
    end: ambigousNode.right?.termLocation?.start,
  };
}

export function getFirstAmbigiousNode(query) {
  const luceneQuery = translateSvToLucene(query);
  const ast = lucene.parse(luceneQuery);

  for (const node of DFS(ast)) {
    if (
      node.operator === "OR" &&
      (node.right?.operator === "AND" ||
        node.right?.operator === "<implicit>") &&
      !node.right?.parenthesized
    ) {
      return extractNodeLocation(node.right);
    }

    if (
      (node.operator === "AND" || node.operator === "<implicit>") &&
      node.right?.operator === "OR" &&
      !node.right?.parenthesized
    ) {
      return extractNodeLocation(node.right);
    }
  }

  return null;
}

// const query = "foo OR bar lvl:National";
// console.log(lucene.parse(query));
// console.log(getFirstAmbigiousNode(query));
