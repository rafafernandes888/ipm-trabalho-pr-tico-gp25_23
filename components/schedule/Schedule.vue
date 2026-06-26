<script lang="ts" setup>
import ClassInfo from './ClassInfo.vue';

const props = defineProps<{ type?: String , ucID: number|0 , studentID?: String, resetTrigger?: number, resetTrigger2?: number, resetWarning?: number }>();
const userID = useCookie<string>('userID', { default: () => '' });
const api = useAPI();
const {t, locale} = useI18n();
const showErrorModal = ref(false);
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const areUSure = ref(t('areusureSchedule'));

const emit = defineEmits<{
  (event: 'openOccupationPopup', item: ScheduleItem): void;
  (event: 'scheduleWarning', value: string): void;
}>();

const days = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
];
const hours = Array.from({ length: 12 }, (_, i) => (i + 8).toString().padStart(2, '0') + ':00');

const openItems = ref<string[]>([]);

interface ScheduleItem {
  id: string;
  idUC: number;
  fullName: string;
  title: string;
  day: string;
  startTime: string;
  turn: string;
  year: string;
  semester: string;
  classroom: string;
  duration: number;
  checked: boolean;
  enrolledStudents: number;
  maxOccupation: number;
  currentOccupation: number;
  teacher: string;
}

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

const scheduleWarning = ref<string>('');
const schedule = ref<ScheduleItem[]>([]);
const canPublish = ref(true);
defineExpose({
  getSchedule: () => schedule.value
});
async function fetchUserSchedule() {
  try {
    let parsedSchedule: ScheduleItem[] = [];
    let parsedSchedule2: ScheduleItem[] = [];

    if (props.type === 'normal') {
      const userResponse = await api.get(`alunos/${userID.value}`);

      if (!userResponse.data) {
        console.error("No user info found.");
        return;
      }

      const ucs = userResponse.data.ucs;

      const courses = await Promise.all(ucs.map(async (uc: any) => {
        const cursoResponse = await api.get(`cursos/${uc.idUC}`);
        return {
          curso: cursoResponse.data,
          tpIndex: uc.tp,
          tIndex: uc.t
        };
      }));

      courses.forEach(({ curso, tpIndex, tIndex }) => {
        const { id, abrev, title, year, semester, enrolledStudents, turnos } = curso as {
          id: number;
          abrev: string;
          title: string;
          year: number;
          semester: number;
          enrolledStudents: number;
          turnos: any[];
        };

        const selectedTurnos = [];

        if (tpIndex > 0) {
          const tpTurno = turnos.find(t => t.id === tpIndex);
          if (tpTurno) selectedTurnos.push(tpTurno);
        }

        if (tIndex > 0) {
          const tTurno = turnos.find(t => t.id === tIndex);
          if (tTurno) selectedTurnos.push(tTurno);
        }

        if (selectedTurnos) {
          selectedTurnos.forEach(turno => {
            parsedSchedule.push({
              id: String(turno.id),
              idUC: id,
              title: abrev,
              fullName: title,
              day: turno.day,
              startTime: turno.startTime,
              turn: turno.turn,
              year:  year == 1 ?  `${year}st` : year == 2 ? `${year}nd` : `${year}rd`,
              semester: semester == 1 ?  `${semester}st` : `${semester}nd`,
              classroom: turno.classroom,
              duration: turno.duration,
              checked: true,
              enrolledStudents,
              maxOccupation: turno.maxOccupation,
              currentOccupation: turno.currentOccupation,
              teacher: turno.teacher
            });
          });
        }
      });
    }

    else if (props.type === 'accordion') {

      const userResponse = await api.get(`alunos/${props.studentID}`);

      if (!userResponse.data) {
        console.error("No user info found.");
        return;
      }

      const ucs = userResponse.data.ucs;

      const courses = await Promise.all(ucs.map(async (uc: any) => {
        const cursoResponse = await api.get(`cursos/${uc.idUC}`);
        return {
          curso: cursoResponse.data,
          tpIndex: uc.tp,
          tIndex: uc.t
        };
      }));

      courses.forEach(({ curso, tpIndex, tIndex }) => {
        const { id, abrev, title, year, semester, enrolledStudents, turnos } = curso as {
          id: number;
          abrev: string;
          title: string;
          year: number;
          semester: number;
          enrolledStudents: number;
          turnos: any[];
        };

        const selectedTurnos = [];

        if (tpIndex > 0) {
          const tpTurno = turnos.find(t => t.id === tpIndex);
          if (tpTurno) selectedTurnos.push(tpTurno);
        }

        if (tIndex > 0) {
          const tTurno = turnos.find(t => t.id === tIndex);
          if (tTurno) selectedTurnos.push(tTurno);
        }

        if (selectedTurnos) {
          selectedTurnos.forEach(turno => {
            parsedSchedule.push({
              id: String(turno.id),
              idUC: id,
              title: abrev,
              fullName: title,
              day: turno.day,
              startTime: turno.startTime,
              turn: turno.turn,
              year: year == 1 ?  `${year}st` : year == 2 ? `${year}nd` : `${year}rd`,
              semester: semester == 1 ?  `${semester}st` : `${semester}nd`,
              classroom: turno.classroom,
              duration: turno.duration,
              checked: true,
              enrolledStudents,
              maxOccupation: turno.maxOccupation,
              currentOccupation: turno.currentOccupation,
              teacher: turno.teacher
            });
          });
        }

        if (turnos) {
          turnos.forEach(turno => {
            const isSelected = parsedSchedule.some(selected => selected.id === String(turno.id));
            
            parsedSchedule2.push({
              id: String(turno.id),
              idUC: id,
              title: abrev,
              fullName: title,
              day: turno.day,
              startTime: turno.startTime,
              turn: turno.turn,
              year: year == 1 ? `${year}st` : year == 2 ? `${year}nd` : `${year}rd`,
              semester: semester == 1 ? `${semester}st` : `${semester}nd`,
              classroom: turno.classroom,
              duration: turno.duration,
              checked: isSelected,
              enrolledStudents,
              maxOccupation: turno.maxOccupation,
              currentOccupation: turno.currentOccupation,
              teacher: turno.teacher
            });
          });
        }
        const seen = new Set();
        parsedSchedule = parsedSchedule2.filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      });
    }

    else if (props.type === 'occupation') {
      const cursoResponse = await api.get(`cursos/${props.ucID}`);
      const curso = cursoResponse.data;

      const { id, abrev, title, year, semester, enrolledStudents, turnos } = curso as {
        id: number;
        abrev: string;
        title: string;
        year: number;
        semester: number;
        enrolledStudents: number;
        turnos: any[];
      };

      if (turnos) {
        parsedSchedule = turnos.map(turno => ({
          id: String(turno.id),
          idUC: id,
          title: abrev,
          fullName: title,
          day: turno.day,
          startTime: turno.startTime,
          turn: turno.turn,
          year: year == 1 ?  `${year}st` : year == 2 ? `${year}nd` : `${year}rd`,
          semester: semester == 1 ?  `${semester}st` : `${semester}nd`,
          classroom: turno.classroom,
          duration: turno.duration,
          checked: true,
          enrolledStudents,
          maxOccupation: turno.maxOccupation,
          currentOccupation: turno.currentOccupation,
          teacher: turno.teacher
        }));
      }
    }

    schedule.value = parsedSchedule;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

await fetchUserSchedule();

const coursesByYear = computed(() => {
  const result: Record<string, string[]> = {};
  schedule.value.forEach(item => {
    if (!result[item.year]) {
      result[item.year] = [];
    }
    if (!result[item.year].includes(item.fullName)) {
      result[item.year].push(item.fullName);
    }
  });
  return result;
});

const toggleAccordion = (id: string) => {
  if (openItems.value.includes(id)) {
    openItems.value = openItems.value.filter(item => item !== id);
  } else {
    openItems.value.push(id);
  }
};

const getItemsForDayAndHour = (day: string, hour: string) => {
  return schedule.value.filter(item => item.checked && item.day === day && item.startTime === hour);
};

const getAllTurnsForCourse = (day: string, hour: string) => {
  return schedule.value.filter(item => item.day === day && item.startTime === hour);
};

const overlappingMap = computed(() => {
  const map: Record<string, ScheduleItem[]> = {};
  const items = schedule.value.filter(item => item.checked);
  let hasOverlap = false;

  const isOverlapping = (a: ScheduleItem, b: ScheduleItem) => {
    if (a.day !== b.day) return false;

    const startA = parseInt(a.startTime.split(':')[0]);
    const endA = startA + a.duration;
    const startB = parseInt(b.startTime.split(':')[0]);
    const endB = startB + b.duration;

    return Math.max(startA, startB) < Math.min(endA, endB);
  };

  for (let i = 0; i < items.length; i++) {
    const itemA = items[i];
    const overlappingGroup = items.filter(itemB => itemA.id !== itemB.id && isOverlapping(itemA, itemB));

    if (overlappingGroup.length > 0) {
      hasOverlap = true;
      const group = [itemA, ...overlappingGroup];
      group.forEach(item => {
        map[item.id] = group;
      });
    }
  }

  if (hasOverlap && scheduleWarning.value != t('moreTPsWarning')) {
    scheduleWarning.value = t('classesConflict');
  } else if (scheduleWarning.value == t('classesConflict')) {
    scheduleWarning.value = '';
  }

  return map;
});

watch(() => schedule.value.map(item => item.checked), () => {
  const tpPlCounts: Record<string, number> = {};

  // Filter the schedule to get only checked items
  const checkedItems = schedule.value.filter(item => item.checked);

  // Count "TP" or "PL" occurrences for each idUC
  checkedItems.forEach(item => {
    if (item.turn.includes('TP') || item.turn.includes('PL')) {
      const key = item.idUC;
      tpPlCounts[key] = (tpPlCounts[key] || 0) + 1;
    }
  });

  // Check if any fullName group has more than 1 "TP" or "PL" class
  for (const key in tpPlCounts) {
    if (tpPlCounts[key] > 1) {
      scheduleWarning.value = t('moreTPsWarning');
      canPublish.value = false;
      return;
    }
  }

  canPublish.value = true;
  if (scheduleWarning.value == t('moreTPsWarning')) {
    scheduleWarning.value = '';
  }

}, { deep: true });


function getOverlapStyle(item: ScheduleItem) {
  const group = overlappingMap.value[item.id] || [item];
  const index = group.findIndex(i => i.id === item.id);

  const gapPx = 3;
  const slotWidthPx = 95; 

  const totalGapPx = (group.length - 1) * gapPx;
  const availableWidth = slotWidthPx - totalGapPx;
  const widthPercent = availableWidth / group.length;
  const leftPercent = index * (widthPercent + gapPx);

  return {
    top: '4px',
    width: `calc(${widthPercent}% )`,
    left: `calc(${leftPercent}% )`
  };
}

const showPopup = ref(false);
const selectedScheduleItem = ref<ScheduleItem | null>(null);

const openItemPopup = (item: ScheduleItem | undefined) => {
  if (!item) return; 
  selectedScheduleItem.value = item;
  showPopup.value = true;
};

const occupationItems = computed(() => {
  return schedule.value;
});

const enrolledStudents = computed(() => {
  return occupationItems.value.length > 0 ? occupationItems.value[0].enrolledStudents : 0;
});

const handleItemClick = (item: ScheduleItem | undefined) => {
  if (!item) return;

  if (userID.value.includes('@')) {
    emit('openOccupationPopup', item);
  } else {
    openItemPopup(item);
  }
};

function generateCurrentDateTime(): string {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
}

const uncheckAllScheduleItems = () => {
  schedule.value = schedule.value.map(item => ({
    ...item,
    checked: false
  }));
};

function showError() {
  setTimeout(() => {
    showErrorModal.value = true;
  }, 100);

  setTimeout(() => {
    showErrorModal.value = false;
  }, 1300);
}

function showSuccess() {
  setTimeout(() => {
    showSuccessModal.value = true;
  }, 100);

  setTimeout(() => {
    showSuccessModal.value = false;
  }, 1300);
}

function handleCancel() {
  showConfirmModal.value = false;
}

async function publishCheckedScheduleItems() {
  if (!canPublish.value && scheduleWarning.value!='') {
    showError();
    return;
  }

  const userResponse = await api.get(`alunos/${props.studentID}`);
  if (!userResponse.data) {
    console.error("No user info found.");
    return;
  }
  
  const studentData = userResponse.data;
  const updatedUcs = [...studentData.ucs];
  schedule.value.forEach((item) => {
    if (item.checked) {
      const ucsItem = updatedUcs.find(ucs => ucs.idUC === item.idUC);

      if (ucsItem) {
        if (item.maxOccupation == item.currentOccupation) {
          areUSure.value = `${item.title} - ${item.turn} ${t('isFull')}` + t('areusureSchedule');
          return;
        }
      } else {
        areUSure.value = scheduleWarning.value + ' '+ t('areusureSchedule');
      }
    }
  });
  showConfirmModal.value = true;
}

async function handleConfirm() {
  showConfirmModal.value = false;
  const userResponse = await api.get(`alunos/${props.studentID}`);

  if (!userResponse.data) {
    console.error("No user info found.");
    return;
  }

  const studentData = userResponse.data;  // Assuming student data is stored here
  const updatedUcs = [...studentData.ucs]; // Copy the ucs array to avoid mutation issues

  // Iterate over the schedule items
  schedule.value.forEach((item) => {
    if (item.checked) { // Only process checked items
      // Find the corresponding ucs item by matching idUC
      const ucsItem = updatedUcs.find(ucs => ucs.idUC === item.idUC);

      if (ucsItem) {  // If the ucsItem exists, update its properties
        // Update tp if turn includes 'TP' or 'PL'
        if (item.turn.includes("TP") || item.turn.includes("PL")) {
          ucsItem.tp = parseInt(item.id);  // Update the tp value with item.id
        }
        // Update t if turn includes 'T' and does not include 'TP'
        else {
          ucsItem.t = parseInt(item.id);
        }
      }
    }
  });

  if(canPublish.value && scheduleWarning.value != '') {
    userResponse.data.scheduleStatus = false;  
  }
  else{
    userResponse.data.scheduleStatus = true;
  }

  userResponse.data.ucs = updatedUcs;
  
  const adminResponse = await api.get(`diretor_curso/${userID.value}`);

  if (adminResponse.data) {
    const newMessage: newMessage = {
        id: Date.now(),
        authorId: adminResponse.data.id,
        author: 'Diretor de Curso',
        subject: 'SCHEDULE POSTED NOTIFICATION',
        text: `Olá ${userResponse.data.name},\nO teu horário foi publicado/atualizado.\n\Com os melhores cumprimentos,\nDiretor de Curso\n`,
        receiveDate: generateCurrentDateTime(),
        read: false,
        student: false
      };
    userResponse.data.mensagens.unshift(newMessage);
  }
  const response = await api.put(`alunos/${props.studentID}`, { ...userResponse.data });

  if (response.status === 200) {
    showSuccess();
  }
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}


watch(() => props.resetTrigger, () => {
  uncheckAllScheduleItems();
});

watch(() => props.resetTrigger2, () => {
  publishCheckedScheduleItems();
});

watch(() => props.resetWarning, () => {
  scheduleWarning.value = '';
  canPublish.value = true;
});

watch(() => scheduleWarning.value, (newWarning) => {
  if (newWarning) {
    emit('scheduleWarning', newWarning);
  } else {
    emit('scheduleWarning', '');
  }
});


</script>

<template>
  <div class="flex h-full p-12 justify-center w-full bg-[#151316]" :class="{'pb-8': props.type!='accordion', 'pb-3': props.type=='accordion'}">

    <!-- Accordion -->
    <div v-if="props.type === 'accordion'" class="w-1/3 overflow-y-auto mr-4 rounded-lg self-start max-h-[650px]">
      <div class="w-full mx-auto">
        <div
          v-for="year in ['1st', '2nd', '3rd']"
          :key="year"
          :class="[
            'text-white',
            year === '1st' ? 'rounded-t-lg border-b' : (year === '3rd' ? 'rounded-b-lg' : 'border-b')
          ]"
        >
          <!-- Year Header -->
          <div class="flex items-center justify-between py-3 cursor-pointer bg-[#222125] px-4" @click="toggleAccordion(year)">
            <span class="font-bold text-lg">{{ year == '1st' ? t('first') : year == '2nd' ? t('second') : t('third') }} {{t('year')}}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4 transition-transform duration-200"
              :class="{ 'rotate-180': openItems.includes(year) }"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <!-- Courses -->
          <div v-show="openItems.includes(year)" class="px-5 bg-[#222125]">
            <div
              v-for="course in coursesByYear[year]"
              :key="course"
              class="border-b border-[#5C5C5C] text-white"
            >
              <!-- Course Header -->
              <div class="flex items-center justify-between py-2 cursor-pointer bg-[#222125] px-5" @click="toggleAccordion(course)">
                <span class="font-medium text-sm">{{ course }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'rotate-180': openItems.includes(course) }"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <!-- Schedule items for this course -->
              <div v-show="openItems.includes(course)" class="px-5 pb-2">
                <div
                  v-for="item in schedule.filter(i => i.year === year && i.fullName === course)"
                  :key="item.id"
                  class="text-white"
                >
                  <div class="flex items-center justify-between py-2" @click="toggleAccordion(item.id)">
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        v-model="item.checked"
                        class="appearance-none h-4 w-4 rounded border-2 transition duration-200 cursor-pointer"
                        :class="{
                          'bg-[#9553F8] border-white': item.checked,
                          'bg-[#222125] border-white': !item.checked
                        }"
                        @click.stop
                      />
                      <span class="text-xs font-medium">{{ item.turn }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Occupation Section -->
    <div v-if="props.type === 'occupation'" class="w-1/3 overflow-y-auto mr-4 rounded-lg self-start max-h-[650px]">
      <div class="w-full mx-auto p-4 bg-[#222125] rounded-lg">
        <h1 class="text-xl font-bold text-white mb-2">{{t('Occupation')}}</h1>
        <p class="text-sm text-white mb-4">{{ t('enrolledStudents') }}: {{ enrolledStudents }}</p>
        <div v-for="item in occupationItems" :key="item.id" class="mb-4">
          <p class="text-sm font-medium text-white mb-1">{{t('Turn')}}: {{ item.turn }}</p>
          <div class="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div class="bg-[#9553F8] h-3 rounded-full transition-all duration-300" :style="{ width: (item.currentOccupation / item.maxOccupation * 100) + '%' }"></div>
          </div>
          <p class="text-xs text-white mt-1">{{ item.currentOccupation }} / {{ item.maxOccupation }} &nbsp; ({{Math.round(item.currentOccupation / item.maxOccupation * 100) + '%'}})</p>
        </div>
      </div>
    </div>

    <!-- Schedule Normal -->
    <div v-if="props.type === 'normal'" class="w-full ml-4 flex flex-col bg-[#222125] rounded-lg shadow-lg">
      <div class="flex-1 overflow-auto">
        <div class="w-full mx-auto">
          <!-- Day headers -->
          <div class="grid grid-cols-6 border-b-2 border-[#5C5C5C] text-center">
            <div class="p-2 font-medium text-white"></div>
            <div 
              v-for="day in days" 
              :key="day" 
              class="p-2 font-medium text-white border-l-2 border-[#5C5C5C] last:border-r-0"
            >
              {{ t(day) }}
            </div>
          </div>

          <!-- Time slots -->
          <div v-for="(hour, index) in hours" :key="hour" class="grid grid-cols-6 text-center border-b-2 border-[#5C5C5C] last:border-b-0 items-center">
            <!-- Time label -->
            <div class="border-[#5C5C5C] p-2 text-sm text-white">
              {{ hour }}
            </div>

            <!-- Day columns -->
            <div 
              v-for="day in days" 
              :key="`${day}-${hour}`" 
              class="relative z-1 h-[50px] border-l-2 border-[#5C5C5C] p-1 last:border-r-0"
              @click="openItemPopup(getItemsForDayAndHour(day, hour)[0])"
            >
              <!-- Render checked items que batem com o dia e hora -->
              <div
                v-for="item in getItemsForDayAndHour(day, hour)"
                :key="item.id"
                class="absolute z-[1] mx-1 rounded-md bg-[#9553F8] p-2 text-sm cursor-pointer"
                :class="item.duration === 1 ? 'h-[calc(100%-8px)]' : 'h-[calc(200%-8px)]'"
                :style="getOverlapStyle(item)"
              >
                <div class="flex items-center gap-1 text-center">
                  <span class="font-medium text-balance text-white">
                    {{ item.title + ' - ' + item.turn }}
                  </span>
                </div>
              </div>
            </div> 
          </div> 
        </div> 
      </div> 
    </div>

    <!-- Schedule Occupation -->
    <div v-else-if="props.type === 'occupation'" class="w-2/3 flex flex-col bg-[#222125] rounded-lg shadow-lg">
      <div class="flex-1 overflow-auto">
        <div class="w-full mx-auto">
          <!-- Day headers -->
          <div class="grid grid-cols-6 border-b-2 border-[#5C5C5C] text-center">
            <div class="p-2 font-medium text-white"></div>
            <div 
              v-for="day in days" 
              :key="day" 
              class="p-2 font-medium text-white border-l-2 border-[#5C5C5C] last:border-r-0"
            >
              {{ t(day) }}
            </div>
          </div>

          <!-- Time slots -->
          <div v-for="(hour, index) in hours" :key="hour" class="grid grid-cols-6 text-center border-b-2 border-[#5C5C5C] last:border-b-0 items-center">
            <!-- Time label -->
            <div class="border-[#5C5C5C] p-2 text-sm text-white">
              {{ hour }}
            </div>

            <!-- Day columns -->
            <div 
              v-for="day in days" 
              :key="`${day}-${hour}`" 
              class="relative h-[50px] border-l-2 border-[#5C5C5C] p-1 last:border-r-0"
              @click="handleItemClick(getAllTurnsForCourse(day, hour)[0])"
            >
              <!-- Render checked items que batem com o dia e hora -->
              <div
                v-for="item in getAllTurnsForCourse(day, hour)"
                :key="item.id"
                class="absolute z-[1] mx-1 rounded-md bg-[#9553F8] p-2 text-sm cursor-pointer"
                :class="{'h-[calc(100%-8px)]': item.duration === 1, 'h-[calc(200%-8px)]': item.duration !==1}"
                :style="getOverlapStyle(item)"
              >
                <div class="flex items-center gap-1 text-center">
                  <span class="font-medium text-balance text-white">
                    {{ item.title + ' - ' + item.turn }}
                  </span>
                </div>
              </div>
            </div> 
          </div> 
        </div> 
      </div> 
    </div>

    <!-- Schedule Accordion -->
    <div v-else-if="props.type === 'accordion'" class="w-2/3 flex flex-col bg-[#222125] rounded-lg shadow-lg">
      <div class="flex-1 overflow-auto">
        <div class="w-full mx-auto">
          <!-- Day headers -->
          <div class="grid grid-cols-6 border-b-2 border-[#5C5C5C] text-center">
            <div class="p-2 font-medium text-white"></div>
            <div 
              v-for="day in days" 
              :key="day" 
              class="p-2 font-medium text-white border-l-2 border-[#5C5C5C] last:border-r-0"
            >
              {{ t(day) }}
            </div>
          </div>

          <!-- Time slots -->
          <div v-for="(hour, index) in hours" :key="hour" class="grid grid-cols-6 text-center border-b-2 border-[#5C5C5C] last:border-b-0 items-center">
            <!-- Time label -->
            <div class="border-[#5C5C5C] p-2 text-sm text-white">
              {{ hour }}
            </div>

            <!-- Day columns -->
            <div 
              v-for="day in days" 
              :key="`${day}-${hour}`" 
              class="relative h-[50px] border-l-2 border-[#5C5C5C] p-1 last:border-r-0"
              @click="openItemPopup(getItemsForDayAndHour(day, hour)[0])"
            >
              <!-- Render checked items que batem com o dia e hora -->
              <div
                v-for="item in getItemsForDayAndHour(day, hour)"
                :key="item.id"
                class="absolute z-[1] mx-1 rounded-md bg-[#9553F8] p-2 text-sm cursor-pointer"
                :class="item.duration === 1 ? 'h-[calc(100%-8px)]' : 'h-[calc(200%-8px)]'"
                :style="getOverlapStyle(item)"
              >
                <div class="flex items-center gap-1 text-center">
                  <span class="font-medium text-balance text-white">
                    {{ item.title + ' - ' + item.turn }}
                  </span>
                </div>
              </div>
            </div> 
          </div> 
        </div> 
      </div> 
    </div>

    <!-- Popup para exibir informações do scheduleItem -->
    <ClassInfo
      :show="showPopup" 
      :scheduleItem="selectedScheduleItem" 
      @close="showPopup = false"
    />
    <ErrorPopUp
      :show="showErrorModal"
      :message="t('moreTPsWarning')"
      />
    <ConfirmationPopUp 
        :show="showConfirmModal"
        :message="areUSure"
        @confirm="handleConfirm()"
        @cancel="handleCancel()"
      />
    <SuccessfulPopUp
      :show="showSuccessModal"
      :message="t('publishSuccess')"
      />
  </div>
</template>
