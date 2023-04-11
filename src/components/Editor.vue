<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import svQueryLang from "../utils/svQueryLang";

const props = defineProps({
  query: {
    type: String,
    default: "",
  },
  onQueryChange: {
    type: Function,
    default: () => null,
  },
});

// Create a ref to hold the DOM node
const editorDom = ref(null);

// Use the onMounted hook to execute code once the component is mounted
onMounted(() => {
  const editorInstance = monaco.editor.create(editorDom.value, {
    language: "svQuery",
    value: props.query,
    theme: "vs-dark",
    wordWrap: "on",
    lineNumbers: "off",
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
  });

  // callback when changing the query
  editorInstance?.getModel()?.onDidChangeContent(() => {
    const newValue = editorInstance.getValue();
    props.onQueryChange(newValue);
    console.log(monaco.editor.tokenize(newValue, "svQuery"));
  });

  // define custom language for SV Queries
  monaco.languages.register({ id: "svQuery" });
  monaco.languages.setMonarchTokensProvider("svQuery", svQueryLang);

  monaco.languages.setLanguageConfiguration("svQuery", {
    brackets: [["(", ")"]],
  });
});
</script>

<template>
  <div class="editorDiv" ref="editorDom"></div>
</template>

<style scoped>
.editorDiv {
  width: 100%;
  height: 200px;
  margin-bottom: 16px;
}
</style>
