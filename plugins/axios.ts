import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  const api = axios.create({
    baseURL: 'http://localhost:3001',
  });

  nuxtApp.vueApp.provide('api', api);
});
