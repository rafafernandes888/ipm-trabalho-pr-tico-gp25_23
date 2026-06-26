<script lang="ts" setup>

const api = useAPI(); // axios instance already linked to localhost3001 where json-server is running
const router = useRouter();
const { t, locale } = useI18n();
const authenticated = useCookie<boolean>('authenticated', { default: () => false }); // middleware authentication value
const userID = useCookie<string>('userID', { default: () => '' }); // userid value stored in cookies
const showErrorModal = ref(false);
const errorMessage =  ref('e');

const credentials = ref<{ username: string, password: string }>({username:"", password:""});
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const keepLanguageOnNavigation = () => {
  if (locale.value=='pt') {
    return '';
  }
  else return '/'+locale.value;
}
const dashboardLink = computed(() => keepLanguageOnNavigation() + '/dashboard');

function showError() {
  setTimeout(() => {
    showErrorModal.value = true;
  }, 200);

  setTimeout(() => {
    showErrorModal.value = false;
  }, 1300);
}

async function fetchAlunoCredentials() {
  const username = credentials.value.username.trim();
  
  if (username.length >= 5) {
    if (username.includes('@')) {
      try {
        const response = await api.get(`/diretor_curso?id=${username}`);
        
        if (response.data.length > 0) {
          if (response.data[0].password === credentials.value.password) {
            console.log("Diretor de Curso autenticado");
            authenticated.value = true;
            userID.value = response.data[0].id; 
            router.push(dashboardLink.value);
          } else {
            showError();
          errorMessage.value = 'incorrectPassword'
          }
        } else {
          showError();
          errorMessage.value = 'userNotFound'
        }
      } catch (error) {
        showError();
        errorMessage.value = error as string;
      }
    } else {
      // Axxxxx or Exxxxx alunoIDs
      const normalizedUsername = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
      
      try {
        const response = await api.get(`/alunos?id=${normalizedUsername}`);
        
        if (response.data.length > 0) {
          if (response.data[0].password === credentials.value.password) {
            console.log("Aluno autenticado");
            authenticated.value = true;
            userID.value = response.data[0].id;
            router.push(dashboardLink.value);
          } else {
            showError();
            errorMessage.value = 'incorrectPassword'
          }
        } else {
          showError();
          errorMessage.value = 'userNotFound'
        }
      } catch (error) {
        showError();
        errorMessage.value = error as string;
      }
    }
  } else {
      showError();
      errorMessage.value = 'invalidUsername'
  }
}


</script>
<template>
    <div class="h-screen relative overflow-hidden bg-[#151316] w-full flex justify-center items-center gap-[16%]">
        <div class="shadow1"></div>
        <div class="shadow2"></div>
        <div class="w-[300px]">
            <h1 class="text-white font-bold text-[4em] text-end relative">
                <svg class="absolute top-2 left-3" xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10s10-4.48 10-10m-7-5.5l3.15 3.15c.2.2.2.51 0 .71L15 13.5V11h-4V9h4zm-6 11l-3.15-3.15c-.2-.2-.2-.51 0-.71L9 10.5V13h4v2H9z"/></svg>
                SWAP UMINHO
            </h1>
        </div>
        <div class="w-[530px] bg-[#222125] rounded-[15px] flex flex-col justify-center items-center gap-7 text-white px-[70px] py-[40px]">
            <h1 class="text-[2em] font-semibold">
              {{ t('signIn') }}
            </h1>
            <input v-model="credentials.username" class="custom" type="text" :placeholder="t('username')" aria-label="Username" @keydown.enter="fetchAlunoCredentials()">
            <div class="w-full relative mt-1">
                <input 
                  v-model="credentials.password" 
                  class="custom"
                  :type="showPassword ? 'text' : 'password'" 
                  :placeholder="t('password')"
                  aria-label="Password"
                  @keydown.enter="fetchAlunoCredentials()"
                >
                <p
                @click="togglePasswordVisibility()"
                class="absolute cursor-pointer right-2 top-[-18px] text-[11px] font-semibold flex justify-center items-center gap-1"
                >   
                    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M4.52 5.935L1.394 2.808l1.414-1.414l19.799 19.798l-1.414 1.415l-3.31-3.31A10.95 10.95 0 0 1 12 21c-5.392 0-9.878-3.88-10.818-9A11 11 0 0 1 4.52 5.935m10.238 10.237l-1.464-1.464a3 3 0 0 1-4.001-4.001L7.829 9.243a5 5 0 0 0 6.929 6.929M7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.95 10.95 0 0 1-2.012 4.593l-3.86-3.86Q17 12.373 17 12a5 5 0 0 0-5.732-4.947z"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"/></svg>
                    {{ t('show') }}
                </p>
            </div>
            <button
            @click="fetchAlunoCredentials()"
            class="bg-[#914FF4] hover:scale-[1.01] text-white hover:text-[#d4d1d1] rounded-[5px] w-full py-[14px] text-[16px] font-semibold hover:bg-[#733dc5] transition duration-300 ease-in-out"
            >
              {{ t('continue') }}
            </button>
        </div>
    </div>
    <ErrorPopUp
      class="text-white"
      :show="showErrorModal"
      :message="t(errorMessage)"
      />
</template>

<style scoped>
.custom {
  color: white; 
  border-radius: 5px; 
  background-color: #343237;
  padding: 12px 10px;
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  outline: none;
}

.custom::placeholder {
  color: #5C5C5C;
}

.shadow1 {
  position: absolute;
  width: 1000px; 
  height: 850px;
  bottom: -500px;
  left: -300px;
  background : radial-gradient(closest-side, rgba(157,170,255,0.21), #151316);
  opacity: 0.6;
  z-index: 0;
}

.shadow2 {
  position: absolute;
  width: 1000px; 
  height: 850px;
  top: -500px;
  left: -300px;
  background : radial-gradient(closest-side, rgba(157,170,255,0.21), #151316);
  opacity: 0.35;
  z-index: 0;
}
</style>