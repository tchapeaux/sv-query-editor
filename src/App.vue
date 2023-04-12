<script setup lang="ts">
import { reactive } from "vue";

import Editor from "./components/Editor.vue";
import Vizualizer from "./components/Vizualizer.vue";

import queries_example from "./utils/queries_examples.json";
import { formatAsSingleLine } from "./utils/queryFormatter.js";

let isCopied = reactive({ value: false });
let query = reactive({ value: queries_example.Marvel });

function onQueryChange(newQuery: string) {
  query.value = newQuery;
}

function onCopyQuery() {
  let cleanedQuery = formatAsSingleLine(query.value.replace(/ or /gi, " OR "));

  navigator.clipboard.writeText(cleanedQuery);
  isCopied.value = true;

  setTimeout(() => (isCopied.value = false), 2000);
}
</script>

<template>
  <h1>SV Query Editor</h1>
  <h2>Editor</h2>
  <p>Paste your query in the editor below</p>
  <Editor :query="query.value" :onQueryChange="onQueryChange" />
  <button class="copy-btn" :onclick="onCopyQuery">
    <span v-if="isCopied.value">✔️ Copied</span>
    <span v-else>Copy</span>
  </button>
  <h2>Visualizer</h2>
  <Vizualizer :query="query.value" />
</template>

<style scoped></style>
