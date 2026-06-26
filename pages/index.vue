<script lang="ts" setup>
definePageMeta({
  layout: 'authentication',
  middleware: 'guest'
});
useHead({
  title: " Swap | Login"
});
</script>

<template>
  <LoginMain/>
</template>


