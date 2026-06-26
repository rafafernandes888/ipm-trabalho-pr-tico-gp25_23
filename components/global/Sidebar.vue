<script lang="ts" setup>

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const authenticated = useCookie<boolean>('authenticated');
const userID = useCookie<string>('userID');
let inactivityTimer: NodeJS.Timeout;
const showConfirmModal = ref(false);
const logoutMessage = ref('');

const keepLanguageOnNavigation = () => {
  if (locale.value=='pt') {
    return '';
  }
  else return '/'+locale.value;
}
const dashboardLink = computed(() => keepLanguageOnNavigation() + '/dashboard');
const scheduleLink = computed(() => keepLanguageOnNavigation() + '/schedule');
const coursesLink = computed(() => keepLanguageOnNavigation() + '/courses');
const studentsLink = computed(() => keepLanguageOnNavigation() + '/students');
const inboxLink = computed(() => keepLanguageOnNavigation() + '/inbox');
const accountLink = computed(() => keepLanguageOnNavigation() + '/account');

function signOut(message: string) {
  logoutMessage.value = message;
  showConfirmModal.value = true;
}
function handleConfirm() {
  authenticated.value = false; // sets cookie value to false
  userID.value = '';
  if (locale.value=='pt') {
    router.push('/'); 
  } else {
    router.push('/'+locale.value);
  }
}

function resetTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    signOut("Are you still there? Want to logout?");
  }, 5 * 60 * 1000); // log out after 5 minutes of inactivity
}

// track activity
onMounted(() => {
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keydown', resetTimer);
  resetTimer(); // start timer when user logs in
});

onUnmounted(() => {
  window.removeEventListener('mousemove', resetTimer);
  window.removeEventListener('keydown', resetTimer);
});

function handleCancel() {
  showConfirmModal.value = false;
}
</script>
<template>
  <div class="w-[260px] fixed left-0 h-screen bg-[#222125] pl-[26px] pr-[16px] py-[20px]">
    <div class="flex flex-col justify-between h-full">
      <div class="flex flex-col justify-center items-start gap-8">
        <div class="w-[125px] mb-6">
          <h1 class="text-white font-bold text-[1.7em] text-end relative">
            <svg class="absolute top-1 left-[2px]" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10s10-4.48 10-10m-7-5.5l3.15 3.15c.2.2.2.51 0 .71L15 13.5V11h-4V9h4zm-6 11l-3.15-3.15c-.2-.2-.2-.51 0-.71L9 10.5V13h4v2H9z"/></svg>
              SWAP UMINHO
          </h1>
        </div>
        <NuxtLink
          v-if="!userID.includes('@')"
          :to="scheduleLink"
          class="flex justify-start items-center gap-3"
          :class="{'text-[#9553F8]':route.path==scheduleLink, 'text-white':route.path!=scheduleLink}"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0"/><path d="M12 7v5l3 3"/></g></svg>
          <p class="text-[20px] font-semibold">
            {{ t('schedule') }}
          </p>
        </NuxtLink>
        <NuxtLink
          v-if="userID.includes('@')"
          :to="dashboardLink"
          class="flex justify-start items-center gap-3"
          :class="{'text-[#9553F8]':route.path==dashboardLink, 'text-white':route.path!=dashboardLink}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z"/></svg>
          <p class="text-[20px] font-semibold">
            {{ t('dashboard')}}
          </p>
        </NuxtLink>
        <NuxtLink 
          :to="coursesLink"
          class="flex justify-start items-center gap-3"
          :class="{'text-[#9553F8]':route.path==coursesLink, 'text-white':route.path!=coursesLink}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="m20.41 8.41l-4.83-4.83c-.37-.37-.88-.58-1.41-.58H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9.83c0-.53-.21-1.04-.59-1.42M7 7h7v2H7zm10 10H7v-2h10zm0-4H7v-2h10z"/></svg>
          <p class="text-[20px] font-semibold text">
            {{ t('courses')}}
          </p>
        </NuxtLink>
        <NuxtLink
          v-if="userID.includes('@')"
          :to="studentsLink"
          class="flex justify-start items-center gap-3"
          :class="{'text-[#9553F8]':route.path==studentsLink, 'text-white':route.path!=studentsLink}"
        >
          <svg class="mb-[1px]" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4"/></svg>
          <p class="text-[20px] font-semibold text">
            {{ t('students')}}
          </p>
        </NuxtLink>
      </div>
      <div class="flex flex-col gap-6">
        <NuxtLink 
          :to="inboxLink"
          class="flex justify-start items-center gap-2"
          :class="{'text-[#9553F8]':route.path==inboxLink, 'text-white':route.path!=inboxLink}"
        >
          <div class="bg-transparent rounded-full p-[3px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 2v9h-3.56c-.36 0-.68.19-.86.5c-.52.9-1.47 1.5-2.58 1.5s-2.06-.6-2.58-1.5a1 1 0 0 0-.86-.5H5V5z"/></svg>
          </div>
          <p class="text-[20px] font-semibold">
            {{ t('inbox')}}
          </p>
        </NuxtLink>
        <div class="flex justify-between items-center">
          <NuxtLink 
            :to="accountLink"
            class="flex justify-start items-center gap-3 ml-1"
            :class="{'text-[#9553F8]':route.path==accountLink, 'text-white':route.path!=accountLink}"
          >
            <div class="rounded-full p-[3px]" :class="{'bg-[#9553F8]':route.path==accountLink, 'bg-white':route.path!=accountLink}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#222125" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4"/></svg>
            </div>
            <p class="text-[20px] font-semibold">
              {{ t('account')}}
            </p>
          </NuxtLink>
          <div class="icon-container LOGOUT">
            <button class="text-white icon-link" @click="signOut(t('confirmationLogout'))">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <ConfirmationPopUp 
      :show="showConfirmModal"
      :message="logoutMessage"
      @confirm="handleConfirm()"
      @cancel="handleCancel()"
    />
  </div>
</template>

<style scoped>
/* Container styles */
.icon-container {
  position: relative;
  display: inline-block;
  width: 50px; /* Adjust size */
  height: 50px; /* Adjust size */
}

/* Icon link styles */
.icon-link {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 2; /* Ensure it is above the circle */
  text-decoration: none;
}

/* Pseudo-element for the circle */
.icon-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 48%;
  width: 30px; /* Initial size of the circle */
  height: 30px; /* Initial size of the circle */
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0); /* Start small */
  transition: transform 0.3s ease; /* Animation duration and easing */
  z-index: 1; /* Below the icon */
}

/* Hover effect: Grow the circle */
.icon-container:hover::before {
  transform: translate(-50%, -50%) scale(1.5); /* Grow to full size */
}

.LOGOUT::before {
  background-color: #9553F8; 
}
</style>