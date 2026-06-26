<script lang="ts" setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
const {t, locale} = useI18n();
useHead({
  title: `Swap | ${t('inbox')}`
});
</script>

<template>
  <InboxVueMain/>
</template>