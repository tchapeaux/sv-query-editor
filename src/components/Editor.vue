<script setup lang="ts">
import { onMounted, ref, shallowRef, reactive } from "vue";
import type { Ref, ShallowRef } from "vue";
import LZString from "lz-string";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import svQueryLang from "../utils/svQueryLang";
import svQueryTheme from "../utils/svQueryTheme";
import validate from "../utils/svQueryValidate";
import queries_example from "../utils/queries_examples.json";
import {
  formatAsTreeView,
  formatAsSingleLine,
  getFormatter,
} from "../utils/queryFormatter";

const urlParams = new URLSearchParams(window.location.search);

const query = reactive({
  value:
    LZString.decompressFromEncodedURIComponent(urlParams.get("query") || "") ||
    queries_example.Marvel,
});

const state = reactive({
  isQueryCopied: false,
  isLinkCopied: false,
  containsError: false,
});

const editorDom: Ref<HTMLElement> = ref(null);
const editorInstance: ShallowRef<monaco.editor.IStandaloneCodeEditor> =
  shallowRef(null);

function onCopyQuery() {
  let cleanedQuery = formatAsSingleLine(query.value.replace(/ or /gi, " OR "));

  navigator.clipboard.writeText(cleanedQuery);
  state.isQueryCopied = true;
  state.isLinkCopied = false;

  setTimeout(() => (state.isQueryCopied = false), 2000);
}

function onCopyShareLink() {
  let shareUrl =
    window.location.origin +
    "?query=" +
    LZString.compressToEncodedURIComponent(query.value);

  navigator.clipboard.writeText(shareUrl);
  state.isLinkCopied = true;
  state.isQueryCopied = false;

  setTimeout(() => (state.isLinkCopied = false), 2000);
}

function onFormatAsTree() {
  if (editorInstance.value) {
    monaco.languages.registerDocumentFormattingEditProvider(
      "svQuery",
      getFormatter(formatAsTreeView)
    );

    editorInstance.value.trigger(
      "editor",
      "editor.action.formatDocument",
      null
    );
  }
}

function onFormatAsLine() {
  if (editorInstance.value) {
    monaco.languages.registerDocumentFormattingEditProvider(
      "svQuery",
      getFormatter(formatAsSingleLine)
    );

    editorInstance.value.trigger(
      "editor",
      "editor.action.formatDocument",
      null
    );

    // Re-enable tree formatting afterwards
    monaco.languages.registerDocumentFormattingEditProvider(
      "svQuery",
      getFormatter(formatAsTreeView)
    );
  }
}

function onGoToFirstError() {
  if (editorInstance.value) {
    editorInstance.value.trigger("editor", "editor.action.marker.next", null);
  }
}

function checkForErrors() {
  if (editorInstance.value) {
    const markers = validate(editorInstance.value.getModel());

    state.containsError = markers.length > 0;

    monaco.editor.setModelMarkers(
      editorInstance.value.getModel(),
      "owner",
      markers.map((m) => ({
        ...m,
        severity: monaco.MarkerSeverity.Error,
      }))
    );
  }
}

// define custom language for SV Queries
monaco.languages.register({ id: "svQuery" });
monaco.languages.setMonarchTokensProvider("svQuery", svQueryLang);

monaco.languages.setLanguageConfiguration("svQuery", {
  brackets: [["(", ")"]],
});

// Define a new theme that contains only rules that match our language
monaco.editor.defineTheme("svQueryTheme", svQueryTheme);

// Wait for the component to be mounted to create the instance
onMounted(() => {
  editorInstance.value = monaco.editor.create(editorDom.value, {
    language: "svQuery",
    value: query.value,
    theme: "svQueryTheme",
    wordWrap: "on",
    lineNumbers: "on",
    maxTokenizationLineLength: 50000,
    tabSize: 2,
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
  });

  checkForErrors();

  // callback when changing the query
  editorInstance.value.getModel()?.onDidChangeContent(() => {
    const newValue = editorInstance.value.getValue();
    query.value = newValue;

    checkForErrors();
  });
});
</script>

<template>
  <div
    :class="{ editorDiv: true, hasError: state.containsError }"
    ref="editorDom"
  ></div>
  <nav>
    <button @click="onFormatAsTree">Formatter en arbre</button>
    <button @click="onFormatAsLine">Formatter en ligne</button>
    <button v-if="state.containsError" @click="onGoToFirstError">
      🚨 See next error
    </button>
  </nav>
  <nav>
    <button @click="onCopyQuery">
      <span v-if="state.isQueryCopied">✔️ Copiée !</span>
      <span v-else>Copier la Query</span>
    </button>
    <button @click="onCopyShareLink">
      <span v-if="state.isLinkCopied">✔️ Copié !</span>
      <span v-else>Copier un lien de partage</span>
    </button>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.editorDiv {
  width: 100%;
  height: 400px;
  margin-bottom: 16px;

  border: 3px solid white;
}

.editorDiv.hasError {
  border: 3px solid crimson;
}
</style>
