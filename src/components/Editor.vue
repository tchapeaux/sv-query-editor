<script setup lang="ts">
import { onMounted, ref, shallowRef, reactive } from "vue";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import svQueryLang from "../utils/svQueryLang";
import queries_example from "../utils/queries_examples.json";
import { formatAsTreeView, formatAsSingleLine } from "../utils/queryFormatter";

const isCopied = reactive({ value: false });
const query = reactive({ value: queries_example.Marvel });

const editorDom = ref(null);
const editorInstance = shallowRef(null);

function onCopyQuery() {
  let cleanedQuery = formatAsSingleLine(query.value.replace(/ or /gi, " OR "));

  navigator.clipboard.writeText(cleanedQuery);
  isCopied.value = true;

  setTimeout(() => (isCopied.value = false), 2000);
}

function onFormat() {
  // mannually trigger document formatting by:
  editorInstance.value.trigger("editor", "editor.action.formatDocument");
}

// Wait for the component to be mounted to create the instance
onMounted(() => {
  // define custom language for SV Queries
  monaco.languages.register({ id: "svQuery" });
  monaco.languages.setMonarchTokensProvider("svQuery", svQueryLang);

  monaco.languages.setLanguageConfiguration("svQuery", {
    brackets: [["(", ")"]],
  });

  // Define a new theme that contains only rules that match our language
  monaco.editor.defineTheme("svQueryTheme", {
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
  });

  monaco.languages.registerDocumentFormattingEditProvider("svQuery", {
    provideDocumentFormattingEdits(model, options) {
      var formatted = formatAsTreeView(model.getValue());
      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ];
    },
  });

  editorInstance.value = monaco.editor.create(editorDom.value, {
    language: "svQuery",
    value: query.value,
    theme: "svQueryTheme",
    wordWrap: "on",
    lineNumbers: "off",
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
  });

  // callback when changing the query
  editorInstance.value?.getModel()?.onDidChangeContent(() => {
    const newValue = editorInstance.value.getValue();
    query.value = newValue;
  });
});
</script>

<template>
  <div class="editorDiv" ref="editorDom"></div>
  <button @click="onCopyQuery">
    <span v-if="isCopied.value">✔️ Copied</span>
    <span v-else>Copy</span>
  </button>
  <button @click="onFormat">Formatter</button>
</template>

<style scoped>
.editorDiv {
  width: 100%;
  height: 400px;
  margin-bottom: 16px;
}
</style>
