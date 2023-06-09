import validFilters from "./validFilters";

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

      // Invalid typos of "or"
      // use lookahead to avoid catching words prefixed by or*
      [/or(?= )/, "invalid"],
      [/oR(?= )/, "invalid"],
      [/Or(?= )/, "invalid"],
      [/[pP][rR](?= )/i, "invalid"],
      [/[iI][rR](?= )/i, "invalid"],
      [/[rR][oO](?= )/i, "invalid"],

      [/-/, "custom-negation"],

      [/\*/, "custom-wildcard"],
      [/@[0-9a-zA-ZÀ-ÖØ-öø-ÿ]+/, "custom-twitter-user"],
      [/#[0-9a-zA-ZÀ-ÖØ-öø-ÿ]+/, "custom-hashtag"],
      // one entry per filter prefix
      ...validFilters.map((filterPrefix) => [
        new RegExp(`${filterPrefix}:`),
        "custom-label",
      ]),
      // Mark filters with other prefixes as invalid
      [/[a-zA-Z_]+:/, "invalid"],
      [/[:]/, "invalid"],

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
      [/-?(\d*\.)?\d+([eE][+-]?\d+)?[jJ]?[lL]?/, "number"],
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
