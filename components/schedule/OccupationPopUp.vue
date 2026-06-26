<script lang="ts" setup>
import Schedule from './Schedule.vue';

const props = defineProps<{ show: boolean; ucID: number | 0 }>();
const emit = defineEmits(["close"]);
const activePopup = ref<"first" | "second">("first");
const api = useAPI();
const { t, locale } = useI18n();

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
let activeItem: ScheduleItem;
const activeTeacher = ref('');
const activeClassroom = ref('');
const activeAlunos = ref<string[]>([])
const errorMessage = ref('e');
const showSuccessModalTeacher = ref(false);
const showConfirmModalTeacher = ref(false);
const showSuccessModalClassroom = ref(false);
const showConfirmModalClassroom = ref(false);
const showErrorModal = ref(false);

const switchOverlay = (popup: "first" | "second") => {
  activePopup.value = popup;
};

function closePopup() {
  emit("close");
}

const handleOpenOccupationPopup = (item: ScheduleItem) => {
  activeItem = item;
  switchOverlay("second");
  activeTeacher.value = activeItem.teacher;
  activeClassroom.value = activeItem.classroom;
  fetchActiveAlunos();
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    activePopup.value = "first";
  }
});

async function fetchActiveAlunos() {
  try {
    const userResponse = await api.get(`/alunos`);

    if (!userResponse.data || !Array.isArray(userResponse.data)) {
      console.error("No user data found or response is not an array.");
      return;
    }

    const alunos = userResponse.data;
    activeAlunos.value = alunos
      .filter(aluno =>
        aluno.ucs?.some((uc: any) => uc.tp == activeItem.id || uc.t == activeItem.id)
      )
      .map(aluno => aluno.name);

  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

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
    showSuccessModalTeacher.value = true;
  }, 100);

  setTimeout(() => {
    showSuccessModalTeacher.value = false;
  }, 1300);
}

function handleCancel() {
  showConfirmModalTeacher.value = false;
}

function editTeacher() {
  if (!activeTeacher.value.trim()) {
    errorMessage.value = "Teacher field cannot be empty!"
    showError();
  } else {
    showConfirmModalTeacher.value = true;
  }
}

async function handleConfirm() {
  showConfirmModalTeacher.value = false;
  const userResponse = await api.get(`/cursos/${activeItem.idUC}`);
  
  if (userResponse.data) {
    if (userResponse.data.turnos) {
      const originalTurnos = [...userResponse.data.turnos];

      const turno = originalTurnos.find(turno => turno.id === parseInt(activeItem.id));

      if (turno) {
        if (turno.teacher == activeTeacher.value.trim()) {
          errorMessage.value = "Please write a different teacher name in order to edit!"
          showError();
          return;
        }
        turno.teacher = activeTeacher.value.trim();

        const updateResponse = await api.put(`/cursos/${activeItem.idUC}`, {
          ...userResponse.data,
          turnos: originalTurnos
        });

        if (updateResponse.data) {
          showSuccess();
        } else {
          errorMessage.value = "Failed to update teacher."
        }
      }
    }
  }
}

function showSuccessClassroom() {
  setTimeout(() => {
    showSuccessModalClassroom.value = true;
  }, 100);

  setTimeout(() => {
    showSuccessModalClassroom.value = false;
  }, 1300);
}

function handleCancelClassroom() {
  showConfirmModalClassroom.value = false;
}

function editClassroom() {
  if (!activeClassroom.value.trim()) {
    errorMessage.value = "Classroom field cannot be empty!"
    showError();
  } else {
    showConfirmModalClassroom.value = true;
  }
}

async function handleConfirmClassroom() {
  showConfirmModalClassroom.value = false;
  const userResponse = await api.get(`/cursos/${activeItem.idUC}`);
  
  if (userResponse.data) {
    if (userResponse.data.turnos) {
      const originalTurnos = [...userResponse.data.turnos];

      const turno = originalTurnos.find(turno => turno.id === parseInt(activeItem.id));

      if (turno) {
        if (turno.classroom == activeClassroom.value.trim()) {
          errorMessage.value = "Please write a different classroom in order to edit!"
          showError();
          return;
        }
        turno.classroom = activeClassroom.value.trim();

        const updateResponse = await api.put(`/cursos/${activeItem.idUC}`, {
          ...userResponse.data,
          turnos: originalTurnos
        });

        if (updateResponse.data) {
          showSuccessClassroom();
        } else {
          errorMessage.value = "Failed to update classroom."
        }
      }
    }
  }
}
</script>

<template>

  <div v-if="show" class="modal z-[50]">

    <div class="relative flex flex-col items-center rounded-lg w-[95%] h-[95%] bg-[#151316] scale-[0.8]">

      <!-- PopUp Occupation -->
      <div v-if="activePopup === 'first'" class="h-full w-full flex flex-col items-center">

        <svg @click="closePopup()" xmlns="http://www.w3.org/2000/svg"
          class="absolute top-4 right-4 text-white cursor-pointer w-8 h-8" viewBox="0 0 24 24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path fill="currentColor"
            d="M13.41 12l4.95-4.95a1 1 0 0 0-1.41-1.41L12 10.59 7.05 5.05a1 1 0 0 0-1.41 1.41L10.59 12l-4.95 4.95a1 1 0 0 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12z" />
        </svg>
        <Schedule class="rounded-lg" :type="'occupation'" :ucID="ucID" @openOccupationPopup="handleOpenOccupationPopup"/>

      </div>

      <!-- PopUp InfoChanger -->
      <div v-if="activePopup === 'second'" class="h-full w-full flex flex-col items-center ">
        
        <!-- Close -->
        <svg @click="closePopup()" xmlns="http://www.w3.org/2000/svg"
          class="absolute top-4 right-4 text-white cursor-pointer w-8 h-8" viewBox="0 0 24 24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path fill="currentColor"
            d="M13.41 12l4.95-4.95a1 1 0 0 0-1.41-1.41L12 10.59 7.05 5.05a1 1 0 0 0-1.41 1.41L10.59 12l-4.95 4.95a1 1 0 0 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12z" />
        </svg>

        <!-- Go Back -->
        <svg @click="switchOverlay('first')" xmlns="http://www.w3.org/2000/svg"
          class="absolute top-4 left-4 text-white cursor-pointer w-8 h-8" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="m7.825 13l4.9 4.9q.3.3.288.7t-.313.7q-.3.275-.7.288t-.7-.288l-6.6-6.6q-.15-.15-.213-.325T4.426 12t.063-.375t.212-.325l6.6-6.6q.275-.275.688-.275t.712.275q.3.3.3.713t-.3.712L7.825 11H19q.425 0 .713.288T20 12t-.288.713T19 13z" />
        </svg>

        <!-- Turn -->
        <p class="mt-[100px] font-bold text-[40px]">
          {{ activeItem.fullName }} {{ activeItem.turn }}
        </p>
        
        <!-- Teacher -->
        <div class="mt-[50px] flex flex-col justify-center items-start w-[666px] relative">
          <div class="absolute right-3 top-[40px]">

            <button @click="editTeacher()"
              class="relative group bg-[#9553F8] text-white font-semibold shadow-lg rounded-[5px] text-[12px] transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
              style="width: 100px; height: 25px; flex-shrink: 0;">

              <span
                class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-5">
                {{ t('edit') }}
              </span>

              <span
                class="absolute right-[-20px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z" />
                </svg>
              </span>

            </button>
          </div>
          <p class="text-[14px] text-white font-semibold pb-2">
            {{ t('teacher') }}
          </p>

          <input class="bg-transparent border-2 border-white rounded-[5px] w-full pl-[18px] pr-[200px] py-[10px] outline-none focus:ring-0 focus:border-white" v-model="activeTeacher">

        </div>

        <!-- Classroom -->
        <div class="mt-[25px] flex flex-col justify-center items-start w-[666px] relative">
          <div class="absolute right-3 top-[40px]">

            <button @click="editClassroom()"
              class="relative group bg-[#9553F8] text-white font-semibold shadow-lg rounded-[5px] text-[12px] transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
              style="width: 100px; height: 25px; flex-shrink: 0;">

              <span
                class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-5">
                {{ t('edit') }}
              </span>

              <span
                class="absolute right-[-20px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z" />
                </svg>
              </span>

            </button>
          </div>
          <p class="text-[14px] text-white font-semibold pb-2">
            {{ t('classroom') }}
          </p>

          <input class="bg-transparent border-2 border-white rounded-[5px] w-full pl-[18px] pr-[200px] py-[10px] outline-none focus:ring-0 focus:border-white" v-model="activeClassroom">

        </div>

        <!-- Students Section -->
        <div class="mt-[25px] flex flex-col justify-center items-start w-[666px] relative">
          <p class="text-[14px] text-white font-semibold pb-2">
            {{ t('enrolledStudents') }}
          </p>

          <div class="bg-transparent border-[3px] border-white rounded-[20px] w-full h-[180px] pl-[18px] py-[10px] overflow-hidden overflow-y-auto enrolled-students-container">
            <ul class="text-white space-y-1">
              <li v-for="(alunoName, index) in activeAlunos" :key="index">
                {{ alunoName }}
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>

  </div>
  <ConfirmationPopUp 
      :show="showConfirmModalTeacher"
      message="Are you sure you want to update the teacher?"
      @confirm="handleConfirm()"
      @cancel="handleCancel()"
    />
  <SuccessfulPopUp
      :show="showSuccessModalTeacher"
      :message="`Teacher was sucessfully updated.`"
      />
    <ConfirmationPopUp 
      :show="showConfirmModalClassroom"
      message="Are you sure you want to update the classroom?"
      @confirm="handleConfirmClassroom()"
      @cancel="handleCancelClassroom()"
    />
  <SuccessfulPopUp
      :show="showSuccessModalClassroom"
      :message="`Classroom was sucessfully updated.`"
      />
  <ErrorPopUp
    :show="showErrorModal"
    :message="errorMessage"
    />
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.enrolled-students-container::-webkit-scrollbar {
  width: 20px; /* Diminui a largura da scrollbar */
}

.enrolled-students-container::-webkit-scrollbar-thumb {
  border-radius: 15px; /* Arredondamento */
  border: 5px solid transparent; /* Simula um espaçamento ao redor */
  background-clip: padding-box;
  margin: 5px 0; /* Move um pouco a scrollbar para dentro verticalmente */
}

.enrolled-students-container::-webkit-scrollbar-track {
  background: transparent;
  margin: 3px; /* Reduz a altura total da scrollbar */
}

</style>