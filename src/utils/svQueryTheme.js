export default {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "#55aa55" },
    {
      token: "custom-negation",
      foreground: "#ff0000",
    },
    { token: "custom-wildcard", foreground: "#ffd700" },
    { token: "custom-twitter-user", foreground: "#1DA1F2" },
    { token: "custom-hashtag", foreground: "#F26E1D" },
    { token: "custom-label", foreground: "#AAAAFF" },
  ],

  colors: {
    "editor.foreground": "#cccccc",
  },
};
