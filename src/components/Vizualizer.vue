<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  query: {
    type: String,
    default: "",
  },
});

const formattedQuery = computed(() => {
  let formatted = "";
  let currentIndent = 0;

  const query = props.query.replace(/ OR /g, "\nOR\n");

  for (let charIdx = 0; charIdx < query.length; charIdx++) {
    const char = query[charIdx];
    if (char === "(") {
      formatted += "(\n";
      currentIndent += 1;
      formatted += "  ".repeat(currentIndent);
    } else if (char === ")") {
      currentIndent -= 1;
      formatted += "\n" + "  ".repeat(currentIndent) + ")\n";
    } else if (char == "O" && query[charIdx + 1] == "R") {
      formatted +=
        "  ".repeat(currentIndent) + "OR\n" + "  ".repeat(currentIndent);
      charIdx += 2;
    } else {
      formatted += char;
    }
  }

  // fix double line returns
  formatted = formatted.replace(/\n\n/g, "\n");

  return formatted;
});
</script>

<template>
  <pre class="visualizer">{{ formattedQuery }}</pre>
</template>

<style scoped>
.vizualizer {
  width: 100%;
}
</style>
