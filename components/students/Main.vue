<script setup lang="ts">

import StudentInfoPopUp from './StudentInfoPopUp.vue';

const { t, locale } = useI18n();
const api = useAPI();
const filterSelected = ref(t('select'));
const dropdownOpen = ref(false);
const alunos = ref<any[]>([]);
const searchQuery = ref('');

const filters = [
  {
    title: t('select')
  },
  {
    title: t('studentName') + " (A-Z)"
  },
  {
    title: t('studentName') + " (Z-A)"
  },
  {
    title: t('yearAscendent')
  },
  {
    title: t('yearDescendent')
  }, 
  {
    title: t('wStatute')
  }, 
  {
    title: t('nStatute')
  },
  {
    title: t('completedSchedules')
  }, 
  {
    title: t('conflictedSchedules')
  }
];

function toggleFilters() {
  dropdownOpen.value = !dropdownOpen.value;
}

function pickFilter(option:string) {
  filterSelected.value = option;
}

async function fetchAlunosData() {
  try {
    const response = await api.get(`/alunos`);

    if (response.data) {
      alunos.value = response.data;
      alunos.value = JSON.parse(JSON.stringify(alunos.value));
    } else {
      console.error(`No cursos array found.`);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

await fetchAlunosData();

onUnmounted(async () => {
});

const removeAccents = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredAlunos = computed(() => {
  let list = [...alunos.value];

  if (searchQuery.value.trim()) {
    const query = removeAccents(searchQuery.value.toLowerCase());
    list = list.filter(aluno =>
      removeAccents(aluno.name.toLowerCase()).includes(query)
    );
  }

  switch (filterSelected.value) {
    case t('studentName') + " (A-Z)":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case t('studentName') + " (Z-A)":
      list.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case t('yearAscendent'):
      list.sort((a, b) => a.ano - b.ano);
      break;
    case t('yearDescendent'):
      list.sort((a, b) => b.ano - a.ano);
      break;
    case t('wStatute'):
      list.sort((a, b) => {
        const aHasStatute = a.statute !== 'Normal';
        const bHasStatute = b.statute !== 'Normal';
        return Number(bHasStatute) - Number(aHasStatute);
      });
      break;
    case t('nStatute'):
      list.sort((a, b) => {
        const aIsNormal = a.statute === 'Normal';
        const bIsNormal = b.statute === 'Normal';
        return Number(bIsNormal) - Number(aIsNormal);
      });
      break;
    case t('completedSchedules'):
      list.sort((a, b) => Number(b.scheduleStatus) - Number(a.scheduleStatus));
      break;
    case t('conflictedSchedules'):
      list.sort((a, b) => Number(a.scheduleStatus) - Number(b.scheduleStatus));
      break;
    default:
  }

  return list;
});

const displayedAlunos = ref<any[]>([]);

watch([searchQuery, filterSelected], () => {
  displayedAlunos.value = filteredAlunos.value;
}, { immediate: true });

const showPopup = ref(false);
const studentForPop = ref<any | null>(null);

const openPopup = (student: any ) => {
  if (!student) return;
  studentForPop.value = student;
  showPopup.value = true;
};

const closePopupOnEsc = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showPopup.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', closePopupOnEsc);
});

onUnmounted(() => {
  window.removeEventListener('keydown', closePopupOnEsc);
});
</script>

<template>
    <div class="bg-[#151316] w-full text-white p-[50px] relative overflow-hidden">
      <div class="shadow1"></div>
      <div class="shadow2"></div>
      <div class="flex justify-start items-center gap-8">
        <div class="flex bg-[#222125] w-[380px] justify-start items-center h-[40px] gap-1 pl-3 rounded-[5px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"/></svg>
          <input v-model="searchQuery" class="border-none bg-[#222125] w-[300px] focus-none text-[17px] font-semibold text-white" type="text" name="searchBar" id="searchBar" :placeholder="t('searchStudents')">
        </div>
        <div class="flex justify-start items-center gap-2">
          <p class="text-white font-semibold text-[14px]">
            {{ t('orderby') }}
          </p>
          <div @click="toggleFilters()" class="cursor-pointer w-[190px] h-[40px] bg-[#222125] rounded-[5px] relative flex justify-start items-center pl-3">
            <span class="text-white font-semibold text-[14px]">
              {{ filterSelected }}
            </span>
            <span class="caret absolute top-[19px] right-3 " :class="{'rotate-caret': dropdownOpen}"></span>
            <div v-if="dropdownOpen" class="absolute bg-[#222125] z-[10] top-10 left-0 w-[190px] border rounded-[5px]">
              <div
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

      <div class="h-[50px]"></div>

      <div class="w-full flex items-center justify-start pl-6">
        <p class="w-[28%] text-white text-[14px] font-semibold">
          {{ t('student') }}
        </p>
        <p class="w-[21%] text-white text-[14px] font-semibold">
          {{ t('year') }}
        </p>
        <p class="w-[23%] text-white text-[14px] font-semibold mr-1">
          {{ t('statute') }}
        </p>
        <p class="w-[22%] text-white text-[14px] font-semibold">
          {{ t('scheduleStatus') }}
        </p>
      </div>
      
      <div class="w-full flex flex-col justify-center items-center mt-1">
        <div v-for="aluno in displayedAlunos" :key="aluno.id" class="w-full flex items-center pl-6 bg-[#222125] h-[66px] rounded-[5px] relative my-3 cursor-pointer hover:scale-[1.01] duration-300 ease-in-out" @click="openPopup(aluno)">
          <svg class="absolute top-1 right-2" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#9553F8" d="m3.7 9.11l7.59 7.59c.39.39 1.02.39 1.41 0l6.3-6.3V14c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1h3.59L12 14.59L5.11 7.7a.996.996 0 0 0-1.41 0c-.38.39-.38 1.03 0 1.41"/></svg>
          <div class="w-[28%] mr-1">
            <p class=" w-[90%] text-white text-[14px] font-semibold pb-[1px]">
              {{ aluno.name }}
            </p>
            <p class=" w-[90%] text-[#5C5C5C] text-[12px] font-semibold pt-[1px]">
              {{ aluno.id }}@alunos.uminho.pt
            </p>
          </div>
          <div class="w-[21%]">
            <p class=" w-[90%] text-white text-[14px] font-semibold">
              {{ aluno.ano }}º
            </p>
          </div>
          <div class="w-[23%]">
            <p class=" w-[90%] text-white text-[14px] font-semibold">
              {{ aluno.statute }}
            </p>
          </div>
          <div v-if="aluno.scheduleStatus" class="w-[22%]">
            <p class="w-[145px] text-white text-[12px] font-semibold p-1.5 bg-[#9553F8] rounded-[5px]">
              {{ t('complete') }}
            </p>
          </div>
          <div v-if="!aluno.scheduleStatus" class="w-[22%]">
            <p class="w-[145px] text-white text-[12px] font-semibold p-1.5 bg-[#FF454C] rounded-[5px]">
              {{ t('conflict') }}
            </p>
          </div>
        </div>
      </div>

      <StudentInfoPopUp
      :show="showPopup" 
      :student="studentForPop" 
      @close="showPopup = false"
    />
    </div>
</template>

<style scoped>
::placeholder {
  color: #5C5C5C;
  font-size: 17px;
  font-weight: 600;
}

input:focus {
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