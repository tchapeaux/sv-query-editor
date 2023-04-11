<script setup lang="ts">
import { computed } from "vue";

import queryFormatter from "../utils/queryFormatter";

const props = defineProps({
  query: {
    type: String,
    default: "",
  },
});

const formattedQuery = computed(() => queryFormatter(props.query));
</script>

<template>
  <pre class="visualizer">{{ formattedQuery }}</pre>
</template>

<style scoped>
.vizualizer {
  width: 100%;
}
</style>
