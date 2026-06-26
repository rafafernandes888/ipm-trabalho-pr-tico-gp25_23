<script setup lang="ts">
import OccupationPopUp from '../schedule/OccupationPopUp.vue';

const api = useAPI();
const { t, locale } = useI18n();
const userID = useCookie<string>('userID');
const filterSelected = ref(t('select'));
const dropdownOpen = ref(false);
const cursos = ref<any[]>([]);
const originalCursos = ref<any[]>([]);
const searchQuery = ref('');

const filters = [
  {
    title: t('select')
  },
  {
    title: t('fSemester')
  },
  {
    title: t('sSemester')
  }, 
  {
    title: t('yearAscendent')
  },
  {
    title: t('yearDescendent')
  }, 
  {
    title: t('mStudents')
  }, 
  {
    title: t('lStudents')
  }, 
  {
    title: t('cadeira')+ ' (A-Z)'
  },
  {
    title: t('cadeira')+ ' (Z-A)'
  }
];

function toggleFilters() {
  dropdownOpen.value = !dropdownOpen.value;
}

function pickFilter(option:string) {
  filterSelected.value = option;
}

function toggleFav(courseId: number) {
  event.stopPropagation(); 
  const index = cursos.value.findIndex(course => course.id === courseId);
  if (index !== -1) {
    cursos.value[index].fav = !cursos.value[index].fav;
  }
}

async function fetchCursosData() {
  try {
    const response = await api.get(`/cursos`);
    const userResponse = userID.value.includes('@') ? await api.get(`diretor_curso/${userID.value}`) : await api.get(`alunos/${userID.value}`);

    if (response.data.length > 0 && userResponse.data) {
      const sortedCursos = userID.value.includes('@') ? response.data.sort((a: any, b: any) => {
        return (b.fav === true ? 1 : 0) - (a.fav === true ? 1 : 0);
      }) : response.data
          .filter((course: any) =>
            userResponse.data.ucs.some((uc: any) => uc.idUC === course.id)
          )
          .map((course: any) => {
            const uc = userResponse.data.ucs.find((uc: any) => uc.idUC === course.id);
            return {
              ...course,
              fav: uc?.fav ?? false
            };
          })
          .sort((a: any, b: any) => {
            return (b.fav === true ? 1 : 0) - (a.fav === true ? 1 : 0);
          });

      cursos.value = sortedCursos;
      originalCursos.value = JSON.parse(JSON.stringify(sortedCursos));
    } else {
      console.error(`No cursos array found.`);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

await fetchCursosData();

onUnmounted(async () => {
  if (userID.value.includes('@')) return;

  const updatedUCs = cursos.value
    .map(course => {
      const original = originalCursos.value.find(orig => orig.id === course.id);
      if (!original || course.fav === original.fav) return null;

      return {
        idUC: course.id,
        fav: course.fav
      };
    })
    .filter(Boolean);

  if (updatedUCs.length === 0) return;

  try {
    const alunoResponse = await api.get(`/alunos/${userID.value}`);
    const aluno = alunoResponse.data;

    if (!aluno) {
      console.error("No student found");
      return;
    }

    aluno.ucs = aluno.ucs.map((uc: any) => {
      const updated = updatedUCs.find((change: any) => change.idUC === uc.idUC);
      return updated ? { ...uc, fav: updated.fav } : uc;
    });

    await api.put(`/alunos/${userID.value}`, aluno);

  } catch (error) {
    console.error(`Failed to update student favs`, error);
  }
});

const removeAccents = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredCursos = computed(() => {
  let list = [...cursos.value];

  if (searchQuery.value.trim()) {
    const query = removeAccents(searchQuery.value.toLowerCase());
    list = list.filter(course =>
      removeAccents(course.title.toLowerCase()).includes(query)
    );
  }

  switch (filterSelected.value) {
    case t('cadeira')+ ' (A-Z)':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case t('cadeira')+ ' (Z-A)':
      list.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case t('yearAscendent'):
      list.sort((a, b) => a.year - b.year);
      break;
    case t('yearDescendent'):
      list.sort((a, b) => b.year - a.year);
      break;
    case t('mStudents'):
      list.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
      break;
    case t('lStudents'):
      list.sort((a, b) => a.enrolledStudents - b.enrolledStudents);
      break;
    case t('fSemester'):
      list = list.filter(a => a.semester === 1);
      break;
    case t('sSemester'):
      list = list.filter(a => a.semester === 2);
      break;
      default:
      list.sort((a, b) => {
        const favA = a.fav === true;
        const favB = b.fav === true;
        return Number(favB) - Number(favA);
      });
  }

  return list;
});

const displayedCursos = ref<any[]>([]);

watch([searchQuery, filterSelected], () => {
  displayedCursos.value = filteredCursos.value;
}, { immediate: true });

const showPopup = ref(false);
const selectedidUC = ref<number>(0);

const openPopup = (idUC: number) => {
  if (!selectedidUC) return;
  selectedidUC.value = idUC;
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
          <input v-model="searchQuery" class="border-none bg-[#222125] w-[300px] focus-none text-[17px] font-semibold text-white" type="text" name="searchBar" id="searchBar" :placeholder="t('searchCourses')">
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

      <div class="h-[50px]"></div>

      <div class="w-full flex items-center justify-start pl-6">
        <p class="w-[27%] text-white text-[14px] font-semibold">
          {{ t('course') }}
        </p>
        <p class="w-[16%] text-white text-[14px] font-semibold">
          {{ t('year') }}
        </p>
        <p class="w-[23%] text-white text-[14px] font-semibold">
          {{ t('regent') }}
        </p>
        <p v-if="userID.includes('@')" class="w-[22%] text-white text-[14px] font-semibold">
          {{ t('enrolledStudents') }}
        </p>
        <p v-if="!userID.includes('@')" class="w-[22%] text-white text-[14px] font-semibold">
          {{ t('action') }}
        </p>
      </div>
      
      <div class="w-full flex flex-col justify-center items-center mt-1">
        <div v-for="course in displayedCursos" :key="course.id" class="w-full flex items-center pl-6 bg-[#222125] h-[66px] rounded-[5px] relative my-3 cursor-pointer hover:scale-[1.01] duration-300 ease-in-out" 
        @click="openPopup(course.id)">
          <svg class="absolute top-1 right-2" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#9553F8" d="m3.7 9.11l7.59 7.59c.39.39 1.02.39 1.41 0l6.3-6.3V14c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1h3.59L12 14.59L5.11 7.7a.996.996 0 0 0-1.41 0c-.38.39-.38 1.03 0 1.41"/></svg>
          <div class="w-[27%] mr-1">
            <p class=" w-[90%] text-white text-[14px] font-semibold">
              {{ course.title }}
            </p>
          </div>
          <div class="w-[16%]">
            <p class=" w-[90%] text-white text-[14px] font-semibold">
              {{ course.year }}º
            </p>
          </div>
          <div class="w-[23%] mr-1" :class="{'w-[22%]': !userID.includes('@')}">
            <p class=" w-[90%] text-white text-[14px] font-semibold">
              {{ course.regent }}
            </p>
          </div>
          <div v-if="userID.includes('@')" class="w-[22%]">
            <p class=" w-[90%] text-white text-[14px] font-semibold">
              {{ course.enrolledStudents }}
            </p>
          </div>
          <div v-if="!userID.includes('@')" class="w-[22%]">
            <p class=" w-[90%] text-white text-[14px] font-semibold">
              <svg @click="toggleFav(course.id)" v-show="course.fav === false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m22 9.24l-7.19-.62L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.63-7.03zM12 15.4l-3.76 2.27l1-4.28l-3.32-2.88l4.38-.38L12 6.1l1.71 4.04l4.38.38l-3.32 2.88l1 4.28z"/></svg>
              <svg @click="toggleFav(course.id)" v-show="course.fav === true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#9553F8" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z"/></svg>
            </p>
          </div>
        </div>
      </div>

      <OccupationPopUp
      :show="showPopup" 
      :ucID="selectedidUC"
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