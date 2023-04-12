// Difficulty: "Moderate"
// Python language definition.
// Only trickiness is that we need to check strings before identifiers
// since they have letter prefixes. We also treat ':' as an @open bracket
// in order to get auto identation.
export default {
  defaultToken: "invalid",
  tokenPostfix: ".svQuery",

  keywords: ["OR"],

  brackets: [{ open: "(", close: ")", token: "delimiter.parenthesis" }],

  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@numbers" },
      { include: "@strings" },

      [/[()]/, "@brackets"],

      [/[-\[\]\{\}]/, "custom-negation"],
      ["or", "custom-negation"],
      [/\*/, "custom-wildcard"],
      [/@[0-9a-zA-ZÀ-ÖØ-öø-ÿ]+/, "custom-twitter-user"],
      [/#[0-9a-zA-ZÀ-ÖØ-öø-ÿ]+/, "custom-hashtag"],
      [/[a-zA-Z]+:/, "custom-label"],

      [
        /[0-9a-zA-ZÀ-ÖØ-öø-ÿ_]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],
    ],

    // Deal with white space, including single and multi-line comments
    whitespace: [
      [/\s+/, "white"],
      [/('''.*''')|(""".*""")/, "string"],
    ],

    // Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
    numbers: [
      [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, "number.hex"],
      [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, "number"],
    ],

    // Recognize strings, including those broken across lines with \ (but not without)
    strings: [
      [/'$/, "string.escape", "@popall"],
      [/'/, "string.escape", "@stringBody"],
      [/"$/, "string.escape", "@popall"],
      [/"/, "string.escape", "@dblStringBody"],
    ],
    stringBody: [
      [/[^\\']+$/, "string", "@popall"],
      [/[^\\']+/, "string"],
      [/\\./, "string"],
      [/'/, "string.escape", "@popall"],
      [/\\$/, "string"],
    ],
    dblStringBody: [
      [/[^\\"]+$/, "string", "@popall"],
      [/[^\\"]+/, "string"],
      [/\\./, "string"],
      [/"/, "string.escape", "@popall"],
      [/\\$/, "string"],
    ],
  },
};
