<script setup>
useHead({
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico"
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;700&display=swap'
    }
  ]
});
</script>

<template>
  <NuxtLayout />
</template>

<style>
::selection {
  background-color: #6843ad;
  color: white; 
}
body {
  font-family: 'Noto Sans', sans-serif;
  background-color: #151316;
}

/* Customizing the scrollbar itself */
::-webkit-scrollbar {
  width: 8px; /* Width of the vertical scrollbar */
  height: 8px; /* Height of the horizontal scrollbar */
}

/* Customizing the scrollbar track (the area the thumb moves within) */
::-webkit-scrollbar-track {
  background-color: #333; /* Background color of the track */
  border-radius: 10px; /* Rounded corners for the track */
}

/* Customizing the scrollbar thumb (the draggable part) */
::-webkit-scrollbar-thumb {
  background-color: #9553F8; /* Thumb color */
  border-radius: 10px; /* Rounded corners for the thumb */
  border: 2px solid #333; /* Border around the thumb */
}

/* Customizing the scrollbar thumb when hovered */
::-webkit-scrollbar-thumb:hover {
  background-color: #7f34e4; /* Darker thumb color on hover */
}
</style>