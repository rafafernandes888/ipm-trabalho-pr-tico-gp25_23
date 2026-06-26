<script setup lang="ts">
const api = useAPI();
const { t, locale } = useI18n();
const userID = useCookie<string>('userID');
const searchQuery = ref('');
const filterSelected = ref(t('latest'));
const dropdownOpen = ref(false);
const mensagens = ref<any[]>([]);
const messageOpened = ref<any>(null);
const newMessageSubject = ref('');
const newMessageText = ref('');
const newMessageReceiver = ref('');
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('e');
const idReceiver = ref('');
const messageInComposition = ref(false);

interface newMessage {
  id: number;
  authorId: string;
  author: string;
  subject: string;
  text: string;
  receiveDate: string;
  read: boolean;
  student: boolean;
}

const filters = [
  {
    title: t('latest')
  },
  {
    title: t('oldest')
  },
  {
    title: t('read')
  },
  {
    title: t('unread')
  }
];

function toggleFilters() {
  dropdownOpen.value = !dropdownOpen.value;
}

function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const filteredMessages = computed(() => {
  if (!searchQuery.value.trim()) {
    return mensagens.value;
  }

  const normalizedSearchQuery = normalizeString(searchQuery.value.toLowerCase());

  return mensagens.value.filter((message) => {
    const normalizedSubject = normalizeString(message.subject.toLowerCase());
    const normalizedAuthor = normalizeString(message.author.toLowerCase());
    return (
      normalizedSubject.includes(normalizedSearchQuery) || 
      normalizedAuthor.includes(normalizedSearchQuery)
    );
  });
});


async function fetchMessagesData() {
  try {
    const userResponse = userID.value.includes('@') ? await api.get(`diretor_curso/${userID.value}`) : await api.get(`alunos/${userID.value}`);

    if (userResponse.data) {
      mensagens.value = userResponse.data.mensagens;
      sortMessages();
    } else {
      console.error(`No mensagens array found.`);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

await fetchMessagesData();

function parseDate(dateStr: string): Date {
  const [time, date] = dateStr.split(' ');
  const [hours, minutes] = time.split(':');
  const [day, month, year] = date.split('/');

  return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
}

function sortMessages() {
  if (mensagens.value) {
    switch (filterSelected.value) {
      case t('latest'):
        mensagens.value.sort((a, b) => parseDate(b.receiveDate).getTime() - parseDate(a.receiveDate).getTime());
        break;
      case t('oldest'):
        mensagens.value.sort((a, b) => parseDate(a.receiveDate).getTime() - parseDate(b.receiveDate).getTime());
        break;
      case t('unread'):
        mensagens.value.sort((a, b) => (a.read === b.read) ? 0 : a.read ? 1 : -1);
        break;
      case t('read'):
        mensagens.value.sort((a, b) => (a.read === b.read) ? 0 : a.read ? -1 : 1);
        break;
      default:
        break;
    }
  }
}

function pickFilter(option:string) {
  filterSelected.value = option;
  console.log(filterSelected.value);
  sortMessages();
}

async function openMessage(idMSG:string) {
  try {
    messageInComposition.value = false;
    const index = mensagens.value.findIndex(mensagem => mensagem.id === idMSG);
    mensagens.value[index].read = true;
    messageOpened.value = mensagens.value[index];

    const userData = userID.value.includes('@') ? await api.get(`diretor_curso/${userID.value}`) : await api.get(`alunos/${userID.value}`);
    if (userData.data) {
      userData.data.mensagens = mensagens.value;

      if (userID.value.includes('@')) {
        api.put(`diretor_curso/${userID.value}`, userData.data);
      } else {
        await api.put(`alunos/${userID.value}`, userData.data);
      }
    } else {
      console.error(`No user object found.`);
    }
  }
  catch (error) {
    console.error('Error fetching user data:', error);
  }
}

function closeMessage() {
  messageOpened.value = null;
  messageInComposition.value = false;
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMessage();
  }

  if (event.key === 'ArrowUp') {
    navigateMessage(-1);
  }

  if (event.key === 'ArrowDown') {
    navigateMessage(1);
  }
};

const navigateMessage = (direction: number) => {
  if (messageOpened.value !== null) {
    const currentIndex = mensagens.value.findIndex(
      (msg) => msg.id === messageOpened.value.id
    );

    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < mensagens.value.length) {
      const nextMessage = mensagens.value[nextIndex];
      openMessage(nextMessage.id);
    }
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  if (!userID.value.includes('@') ) {
    const userResp = await api.get(`diretor_curso`)

    if (userResp.data) {
      newMessageReceiver.value = userResp.data[0].id;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

function replaceNewlinesWithBreaks(text: string) {
  if (text) {
    return text.replace(/\n/g, '<br>');
  } else return '';
};

function generateCurrentDateTime(): string {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
}

function handleCancel() {
  showConfirmModal.value = false;
}

async function sendMessage(idAuthor:string) {
  if (!messageOpened.value) {
    if (newMessageReceiver.value.trim() === '') {
      errorMessage.value = 'emptyReceiverError';
      showError();
      return;
    }

    let userExist = null;

    try {
      userExist = newMessageReceiver.value.includes('@')
        ? await api.get(`diretor_curso/${newMessageReceiver.value}`)
        : await api.get(`alunos/${newMessageReceiver.value}`);
      
    } catch (err) {
      console.error('User not found or API error:', err);
      errorMessage.value = 'receiverDoesntExist';
      showError();
      return;
    }
  }

  if (newMessageSubject.value.trim() === '') {
    errorMessage.value = 'emptySubjectError';
    showError();
    return;
  }

  if (newMessageText.value.trim() === '') {
    errorMessage.value = 'emptyTextError';
    showError();
    return;
  }

  showConfirmModal.value = true;
  idReceiver.value = idAuthor;
  if (!messageOpened.value) {
    idReceiver.value = newMessageReceiver.value;
  }
}

function showSuccess() {
  setTimeout(() => {
    showSuccessModal.value = true;
  }, 200);

  setTimeout(() => {
    showSuccessModal.value = false;
  }, 1300);
}

function showError() {
  setTimeout(() => {
    showErrorModal.value = true;
  }, 200);

  setTimeout(() => {
    showErrorModal.value = false;
  }, 1300);
}

async function handleConfirm() {
  showConfirmModal.value = false;
  try {
    const { data: receiver } = idReceiver.value.includes('@') ? await api.get(`diretor_curso/${idReceiver.value}`) : await api.get(`alunos/${idReceiver.value}`);
    const { data: sender } = userID.value.includes('@') ? await api.get(`diretor_curso/${userID.value}`) : await api.get(`alunos/${userID.value}`);

    const newMessage: newMessage = {
      id: Date.now(),
      authorId: sender.id,
      author: sender.name ? sender.name : 'Diretor de Curso',
      subject: newMessageSubject.value,
      text: newMessageText.value,
      receiveDate: generateCurrentDateTime(),
      read: false,
      student: sender.name ? true : false
    };

    receiver.mensagens.unshift(newMessage);
    if (idReceiver.value.includes('@')) {
      await api.put(`/diretor_curso/${idReceiver.value}`, receiver);
    } else {
      await api.put(`/alunos/${idReceiver.value}`, receiver);
    }

    showSuccess();

    newMessageSubject.value = '';
    newMessageText.value = '';
    closeMessage();
  } catch (error) {
    errorMessage.value = error as string;
    showError();
  }
}

function composeMessage() {
  messageOpened.value = null;
  messageInComposition.value = true;
}

function checkLength() {
  if (mensagens.value) {
    return mensagens.value.length;
  }
  return false;
}
</script>


<template>
  <div class="bg-[#151316] w-full text-white p-[50px] overflow-hidden relative" :class="{'max-h-screen': messageOpened || messageInComposition, 'max-w-full': !(messageOpened || messageInComposition)}">
    <div class="shadow1"></div>
    <div class="shadow2"></div>
    <div class="w-full flex justify-between items-center">
      <div class="flex justify-start items-center gap-8">
        <div class="flex bg-[#222125] w-[380px] justify-start items-center h-[40px] gap-1 pl-3 rounded-[5px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"/></svg>
          <input v-model="searchQuery" class="border-none bg-[#222125] w-[300px] focus-none text-[17px] font-semibold text-white search" type="text" name="searchBar" id="searchBar" :placeholder="t('searchMessages')">
        </div>
        <div class="flex justify-start items-center gap-2">
          <p class="text-white font-semibold text-[14px]">
            {{ t('orderby') }}
          </p>
          <div @click="toggleFilters()" class="cursor-pointer w-[170px] h-[40px] bg-[#222125] rounded-[5px] relative flex justify-start items-center pl-3">
            <span class="text-white font-semibold text-[14px]">
              {{ filterSelected }}
            </span>
            <span class="caret absolute top-[19px] right-3 " :class="{'rotate-caret': dropdownOpen}"></span>
            <div v-if="dropdownOpen" class="absolute bg-[#222125] z-[10] top-10 left-0 w-[170px] border rounded-[5px]">
              <div 
              v-show="!userID.includes('@') && filter.title != 'Most Students' && filter.title != 'Least Students' || userID.includes('@')" 
              @click="pickFilter(filter.title)" 
              v-for="filter in filters" class="bg-[#222125] p-2 hover:bg-[#9553F8] rounded-[3px]"
              >
                <p class="text-white font-semibold text-[14px]">
                  {{ filter.title }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="composeMessage()"
        class="relative group bg-[#9553F8] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
        style="width: 170px; height: 40px; flex-shrink: 0;"
      >
      
        <span class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-7">
          {{ t('compose') }}
        </span>

        <span class="absolute right-[-16px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"/>
          </svg>
        </span>

      </button>

    </div>

    <div class="h-[32px]"></div>

    <div class="w-full flex justify-between items-start">
      <div class="flex flex-col" 
      :class="{'w-[38%] overflow-y-auto pr-2 items-center justify-start': messageOpened || messageInComposition, 'w-full justify-center items-center': !(messageOpened || messageInComposition)}"
      :style="{ maxHeight: messageOpened || messageInComposition ? 'calc(100vh - 172px)' : 'none' }"
      >
        <h1 v-if="!checkLength()" class="text-3xl font-semibold text-white mt-[100px]">
          {{ t('inboxEmpty') }}
        </h1>
        <div 
          @click="openMessage(message.id)" 
          v-if="checkLength()" 
          v-for="message in filteredMessages" :key="message.id" 
          class="w-full flex items-center pl-6 bg-[#222125] rounded-[5px] relative cursor-pointer"
          :class="{'h-[80px] my-2 duration-300 ease-in-out': messageOpened || messageInComposition, 'h-[70px] my-3 hover:scale-[1.01] duration-300 ease-in-out': !(messageOpened || messageInComposition), 'opacity-50': messageOpened || messageInComposition ? messageOpened?.id != message.id : false}"
          style="flex-shrink: 0;"
          >
          <svg v-show="!(messageOpened || messageInComposition)" class="absolute top-1 right-2" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#9553F8" d="m3.7 9.11l7.59 7.59c.39.39 1.02.39 1.41 0l6.3-6.3V14c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1h3.59L12 14.59L5.11 7.7a.996.996 0 0 0-1.41 0c-.38.39-.38 1.03 0 1.41"/></svg>
          <div class="bg-white rounded-full p-[4px] mr-4">
            <svg v-if="message.student" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#222125" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"/></svg>
            <svg v-if="!message.student" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#222125" d="M5 13.18v4L12 21l7-3.82v-4L12 17zM12 3L1 9l11 6l9-4.91V17h2V9z"/></svg>
          </div>
          <div :class="{'flex w-[80%] flex-col': messageOpened || messageInComposition, 'flex flex-row w-full items-center': !(messageOpened || messageInComposition)}">
            <div class="mr-1" :class="{'w-full': messageOpened || messageInComposition, 'w-[18%]': !(messageOpened || messageInComposition)}">
              <div class="text-white text-[14px] leading-[15px] font-semibold" :class="{'flex items-end gap-3 w-full': messageOpened || messageInComposition, 'block w-[90%]': !(messageOpened || messageInComposition)}">
                <p class="mb-[1px]">{{ message.author == 'Diretor de Curso' ? t('courseDirector') : message.author }}</p> <p class="text-[12px] font-normal">{{ message.receiveDate }}</p>
              </div>
            </div>

            <div v-show="!message.read && !(messageOpened || messageInComposition)" class="bg-[#9553F8] rounded-full h-[1px] p-[6px] border-[#9553F8] mr-3 mt-[1px]"></div>
            
            <div class="w-[58%] overflow-hidden">
              <p class=" w-full text-[#5C5C5C] text-[14px] font-semibold truncate">
                <span class="text-white">{{ message.subject == 'SCHEDULE POSTED NOTIFICATION' ? t('schedulePosted') : message.subject }} - </span><span v-show="!(messageOpened || messageInComposition)">{{ message.text }}</span>
              </p>
              <p v-show="messageOpened || messageInComposition" class="truncate text-[13px] font-semibold text-[#5C5C5C]">{{ message.text }}</p>
            </div>
          </div>

          <div v-show="!message.read && (messageOpened || messageInComposition)" class="bg-[#9553F8] rounded-full h-[1px] p-[6px] border-[#9553F8] mt-[1px]"></div>
        </div>
      </div>
      <div v-if="messageOpened || messageInComposition" class="w-[58%] bg-[#222125] rounded-[5px] mt-3 p-3 relative">
        <button @click="closeMessage()" class="absolute top-3 right-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
        </button>
        <div v-show="messageOpened" class="w-full px-2.5 flex items-center justify-start">
          <div class="bg-white rounded-full w-fit p-[4px] mr-4">
            <svg v-if="messageOpened?.student" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#222125" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"/></svg>
            <svg v-if="!messageOpened?.student" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#222125" d="M5 13.18v4L12 21l7-3.82v-4L12 17zM12 3L1 9l11 6l9-4.91V17h2V9z"/></svg>    
          </div>
          <div class="text-[13px] text-white font-semibold">
            {{ messageOpened?.author == 'Diretor de Curso' ? t('courseDirector') : messageOpened?.author }}
            <p class="leading-[15px]">
              {{ t('subject') }} {{ messageOpened?.subject == 'SCHEDULE POSTED NOTIFICATION' ? t('schedulePosted') : messageOpened?.subject }}
            </p>
          </div>
        </div>

        <div v-show="messageOpened" class="h-[50px]"></div>

        <div class="w-full px-2.5 text-[13px] text-white font-semibold">
          <p v-html="replaceNewlinesWithBreaks(messageOpened?.text)"></p>
        </div>

        <div v-show="messageOpened" class="h-[25px]"></div>
        <div v-show="messageOpened" class="w-full px-2.5">
          <div class="h-[1px] w-full bg-white"></div>
        </div>
        <div v-show="messageOpened" class="h-[25px]"></div>

        <div class="px-2.5 text-white font-semibold" :class="{'mt-1': !messageOpened}">
          <p v-show="messageOpened" class="text-[15px]">
            {{ t('to') }} <span class="font-normal text-[13px]">{{ messageOpened?.author == 'Diretor de Curso' ? t('courseDirector') : messageOpened?.author }}</span>
          </p>
          <p v-show="!messageOpened" class="text-[14px]">
            {{ t('to') }} 
            <span v-show="!userID.includes('@')" class="font-normal text-[13px]">{{ newMessageReceiver }}</span>
            <input v-show="userID.includes('@')" v-model="newMessageReceiver" class="bg-[#222125] pl-1 font-normal w-[50%] text" placeholder="AXXXXXX" type="text">
          </p>
          <p class="py-3 text-[13px]">
            {{ t('subject') }} <input v-model="newMessageSubject" class="bg-[#222125] pl-1 font-normal w-[50%] text" :placeholder="t('writeSubject')" type="text">
          </p>

          <div v-show="!messageOpened" class="w-full mt-2 mb-3">
            <div class="h-[1px] w-full bg-white"></div>
          </div>

          <p>
            <textarea v-model="newMessageText" class="bg-[#222125] w-full min-h-[180px] text text-[13px] font-normal" :placeholder="t('writeMessage')" style="resize: none;"></textarea>
          </p>
          <div class="w-full flex justify-end items-center mt-2">

            <button 
              @click="sendMessage(messageOpened?.authorId)"
              class="relative group bg-[#9553F8] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
              style="width: 170px; height: 40px; flex-shrink: 0;"
            >
            
              <span class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-8">
                {{ t('send') }}
              </span>

              <span class="absolute right-[-10px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="m3.4 20.4l17.45-7.48a1 1 0 0 0 0-1.84L3.4 3.6a.993.993 0 0 0-1.39.91L2 9.12c0 .5.37.93.87.99L17 12L2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91"/>
                </svg>
              </span>

            </button>
            
          </div>
        </div>
      </div>
    </div>
    <ConfirmationPopUp 
      :show="showConfirmModal"
      :message="t('confirmationSendMessage')"
      @confirm="handleConfirm()"
      @cancel="handleCancel()"
    />
    <SuccessfulPopUp
      :show="showSuccessModal"
      :message="t('successfulSendMessage')"
    />
    <ErrorPopUp
      :show="showErrorModal"
      :message="t(errorMessage)"
    />
  </div>
</template>

<style scoped>
.search::placeholder {
  color: #5C5C5C;
  font-size: 17px;
  font-weight: 600;
}

.text::placeholder {
  color: #5C5C5C;
  font-size: 13px;
  font-weight: 600;
}

input:focus {
  outline: none;
  border: none;
} 

textarea:focus {
  outline: none;
  border: none;
} 

.caret {
  display: absolute;
  width: 0;
  height: 0;
  margin-left: 6px;
  vertical-align: middle;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid;
  transform: rotate(-90deg);
  transition: transform 0.2s ease-in-out;
}

.rotate-caret {
  transform: rotate(0deg); 
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
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