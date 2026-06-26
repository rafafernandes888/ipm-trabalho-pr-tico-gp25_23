<script lang="ts" setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
const {t, locale} = useI18n();
useHead({
  title: `Swap | ${t('account')}`
});
</script>

<template>
  <AccountMain/>
</template>