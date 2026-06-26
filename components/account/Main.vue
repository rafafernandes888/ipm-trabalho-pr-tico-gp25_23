<script lang="ts" setup>
const { t, locale } = useI18n();
const authenticated = useCookie<boolean>('authenticated');
const userID = useCookie<string>('userID');
const api = useAPI();
const router = useRouter();

const showPassword = ref(false);
const notificationsProf = ref(false);
const notificationsStudent = ref(false);
const showConfirmModal = ref(false);
const showConfirmModalLogout = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('e');

const credentials = ref<{ email: string; password: string }>({
  email: '',
  password: '',
});

const userData = ref<any>(null);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

async function toggleNotificationsProf() {
  notificationsProf.value = !notificationsProf.value;
  if (userID.value.includes('@')) {
    const dcResponse = await api.get(`/diretor_curso/${userID.value}`);
    let payload: Record<string, any> = {
      ...dcResponse.data,
      notificationsProf: notificationsProf.value
    };
    await api.put(`/diretor_curso/${userID.value}`, payload);
  }
}

async function toggleNotificationsStudent() {
  notificationsStudent.value = !notificationsStudent.value;
  if (userID.value.includes('@')) {
    const dcResponse = await api.get(`/diretor_curso/${userID.value}`);
    let payload: Record<string, any> = {
      ...dcResponse.data,
      notificationsStudent: notificationsStudent.value
    };
    await api.put(`/diretor_curso/${userID.value}`, payload);
  }
}

async function fetchUserData() {
  try {
    let endpoint = userID.value.includes('@') ? 'diretor_curso' : 'alunos';
    const response = await api.get(`/${endpoint}?id=${userID.value}`);

    if (response.data.length > 0) {
      userData.value = response.data[0];
      credentials.value.email = userID.value.includes('@') 
        ? response.data[0].id
        : response.data[0].id + '@alunos.uminho.pt';
      credentials.value.password = response.data[0].password;
      notificationsProf.value = response.data[0].notificationsProf || false;
      notificationsStudent.value = response.data[0].notificationsStudent || false;
    } else {
      console.error(`No ${endpoint} found for this ID`);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

await fetchUserData();

function signOut() {
  showConfirmModalLogout.value=true;
}

function handleConfirmLogout() {
  authenticated.value = false;
  userID.value = '';

  router.push(locale.value === 'pt' ? '/' : '/' + locale.value);
}

async function updatePassword() {
  if (!credentials.value.password.trim()) {
    errorMessage.value = 'emptyPasswordError';
    showError();
    return;
  } else if (credentials.value.password.trim() == userData.value.password) {
    errorMessage.value = 'samePasswordError';
    showError();
    return;
  }
  showConfirmModal.value = true;
}

function showSuccess() {
  setTimeout(() => {
    showSuccessModal.value = true;
  }, 100);

  setTimeout(() => {
    showSuccessModal.value = false;
  }, 1300);
}

function showError() {
  setTimeout(() => {
    showErrorModal.value = true;
  }, 100);

  setTimeout(() => {
    showErrorModal.value = false;
  }, 1300);
}

async function handleConfirm() {
  showConfirmModal.value = false;
  if (!userData.value) {
    alert('User not found!');
    return;
  }

  try {
    userData.value.password = credentials.value.password;
    let endpoint = userID.value.includes('@') ? 'diretor_curso' : 'alunos';
    let payload: Record<string, any> = {
      ...userData.value,
      password: userData.value.password,
    };

    if (userID.value.includes('@')) {
      payload.notificationsProf = notificationsProf.value;
      payload.notificationsStudent = notificationsStudent.value;
    } else {
      payload.ano = userData.value.ano;
    }

    const response = await api.put(`/${endpoint}/${userID.value}`, payload);

    if (response.status === 200) {
      showSuccess();
    }
  } catch (error) {
      errorMessage.value=error as string;
      showError();
  }
}

function handleCancel() {
  showConfirmModal.value = false;
}
function handleCancelLogout() {
  showConfirmModalLogout.value = false;
}
</script>


<template>
    <div class="bg-[#151316] w-full text-white px-[60px] py-[40px] overflow-hidden relative">
      <div class="shadow1"></div>
      <div class="shadow2"></div>
      <div class="w-full flex justify-between">
        <h1 class="text-white font-semibold text-[24px]">
          {{ t('account') }}
        </h1>

        <button 
          @click="signOut()" 
          class="relative group bg-[#9553F8] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
          style="width: 170px; height: 40px; flex-shrink: 0;"
        >
        
          <span class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-8">
            {{ t('logout') }}
          </span>

          <span class="absolute right-[-16px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="m17 8l-1.41 1.41L17.17 11H9v2h8.17l-1.58 1.58L17 16l4-4zM5 5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H5z"/>
            </svg>
          </span>

        </button>

      </div>
      <div class="h-[60px]"></div>
      <div class="flex flex-col justify-center items-start w-[666px] pb-6 relative z-[1]">
        <p class="text-[14px] text-white font-semibold pb-2">
          Email
        </p>
        <input class="bg-transparent border-2 border-white rounded-[5px] w-full pl-[18px] pr-[200px] py-[10px]" type="text" name="email" v-model="credentials.email">
      </div>
      <div class="flex flex-col justify-center items-start w-[666px] relative">
        <div class="absolute right-3 top-[40px]">

          <button 
            @click="updatePassword()"
            class="relative group bg-[#9553F8] text-white font-semibold shadow-lg rounded-[5px] text-[12px] transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
            style="width: 100px; height: 25px; flex-shrink: 0;"
          >
          
            <span class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-5">
              {{ t('edit') }}
            </span>

            <span class="absolute right-[-20px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"/>
              </svg>
            </span>

          </button>
        </div>
        <p
         @click="togglePasswordVisibility()"
         class="absolute cursor-pointer right-2 top-2 text-[11px] font-semibold flex justify-center items-center gap-1"
        >   
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M4.52 5.935L1.394 2.808l1.414-1.414l19.799 19.798l-1.414 1.415l-3.31-3.31A10.95 10.95 0 0 1 12 21c-5.392 0-9.878-3.88-10.818-9A11 11 0 0 1 4.52 5.935m10.238 10.237l-1.464-1.464a3 3 0 0 1-4.001-4.001L7.829 9.243a5 5 0 0 0 6.929 6.929M7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.95 10.95 0 0 1-2.012 4.593l-3.86-3.86Q17 12.373 17 12a5 5 0 0 0-5.732-4.947z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"/></svg>
            {{ t('show') }}
        </p>
        <p class="text-[14px] text-white font-semibold pb-2">
          {{ t('password') }}
        </p>
        <input class="bg-transparent border-2 border-white rounded-[5px] w-full pl-[18px] pr-[200px] py-[10px]" :type="showPassword ? 'text' : 'password'" name="password" v-model="credentials.password">
      </div>
      <div class="h-[23px]"></div>
      <div class="w-[333px]">
        <LanguageSelector />
      </div>
      <div class="h-[25px]"></div>
      <div v-if="userID.includes('@')" class="flex flex-col justify-center items-start w-[260px] relative">
        <p class="text-[14px] text-white font-semibold pb-1">
          {{ t('notifications') }}
        </p>
        <p class="text-[12px] font-semibold text-[#5C5C5C] text-left pb-2">
          {{ t('chooseNotifications') }}
        </p>
        <div class="w-full flex justify-between items-center py-1.5 gap-3 w-[156px]">
          <svg class="mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 13.18v4L12 21l7-3.82v-4L12 17zM12 3L1 9l11 6l9-4.91V17h2V9z"/></svg>
          <p class="text-[14px] text-white font-semibold pb-1 text-left w-1/2">
            {{ t('teachers') }}
          </p>
          <div @click="toggleNotificationsProf()" class="rounded-[5px] border-[2px] border-white w-[23px] h-[23px] flex justify-center items-center">
            <span v-if="notificationsProf" class="bg-[#9553F8] h-[20px] w-[20px] rounded-[2px] flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L5.53 12.7a.996.996 0 1 0-1.41 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71a.996.996 0 1 0-1.41-1.41z"/></svg>
            </span>
          </div>
        </div>
        <div class="w-full flex justify-between items-center py-1.5 gap-3 w-[156px]">
          <svg class="mb-1.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"/></svg>
          <p class="text-[14px] text-white font-semibold pb-1 text-left w-1/2">
            {{ t('students') }}
          </p>
          <div @click="toggleNotificationsStudent()" class="rounded-[5px] border-[2px] border-white w-[23px] h-[23px] flex justify-center items-center">
            <span v-if="notificationsStudent" class="bg-[#9553F8] h-[20px] w-[20px] rounded-[2px] flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L5.53 12.7a.996.996 0 1 0-1.41 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71a.996.996 0 1 0-1.41-1.41z"/></svg>
            </span>
          </div>
        </div>
      </div>
      <ConfirmationPopUp 
        :show="showConfirmModal"
        :message="t('confirmationEditPassword')"
        @confirm="handleConfirm()"
        @cancel="handleCancel()"
      />
      <ConfirmationPopUp 
        :show="showConfirmModalLogout"
        :message="t('confirmationLogout')"
        @confirm="handleConfirmLogout()"
        @cancel="handleCancelLogout()"
      />
      <SuccessfulPopUp
      :show="showSuccessModal"
      :message="t('successfulEditPassword')"
      />
      <ErrorPopUp
      :show="showErrorModal"
      :message="t(errorMessage)"
      />
    </div>
</template>

<style scoped>
.shadow1 {
  position: absolute;
  width: 1300px; 
  height: 850px;
  bottom: -500px;
  right: -300px;
  background : radial-gradient(closest-side, rgba(157,170,255,0.21), #151316);
  opacity: 0.65;
  z-index: -1;
  pointer-events: none;
}

.shadow2 {
  position: absolute;
  width: 1000px; 
  height: 850px;
  top: -500px;
  right: -300px;
  background : radial-gradient(closest-side, rgba(157,170,255,0.21), #151316);
  opacity: 0.35;
  z-index: -1;
  pointer-events: none;
}
</style>