<template>
  <Viewer :value="value" :plugins="plugins" />
</template>

<script setup>
import { Viewer } from "@bytemd/vue-next";
import gfm from "@bytemd/plugin-gfm";
import highlight from "@bytemd/plugin-highlight";
import "bytemd/dist/index.css";
import "highlight.js/styles/default.css";
// import "github-markdown-css/github-markdown-light.css";

const plugins = [gfm(), highlight()];

// interface Props {
//   value: string;
// }

 const props = defineProps({
   value: {
     type: String,
     default: "",
   },
 });
</script>
