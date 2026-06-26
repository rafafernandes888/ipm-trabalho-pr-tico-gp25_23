<script lang="ts" setup>
import Schedule from '../schedule/Schedule.vue';

const props = defineProps<{ show: boolean; student: any }>();
const emit = defineEmits(["close", "clear-schedule"]);
const activePopup = ref<"first" | "second">("first");
const { t, locale } = useI18n();

const colors = [
  '#FF6B6B', // vermelho coral
  '#6BCB77', // verde menta
  '#4D96FF', // azul forte
  '#FFC75F', // amarelo manga
  '#FF9671', // laranja vivo
  '#B388EB', // roxo lavanda
  '#00C9A7', // turquesa
  '#F28585', // rosa escuro
  '#845EC2', // roxo intenso
  '#2C73D2', // azul oceano
  '#0081CF', // azul claro vibrante
  '#C34A36', // vermelho queimado
  '#FF8066', // salmão quente
  '#A0E426', // verde-limão
  '#F9F871', // amarelo pastel neon
];


const getColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

const switchOverlay = (popup: "first" | "second") => {
  activePopup.value = popup;
};

const scheduleRef = ref<InstanceType<typeof Schedule> | null>(null);
const scheduleWarning = ref<string>('');

const resetTrigger = ref(0);

function clearSchedule() {
    resetTrigger.value++;
}

const resetTrigger2 = ref(0);
const resetWarning = ref(0);

function publishSchedule() {
    resetTrigger2.value++;
}

function closePopup() {
  resetWarning.value++;
  setTimeout(() => {
    emit("close");
  }, 50);
}

watch(() => props.show, (newVal) => {
  if (!newVal) {
    activePopup.value = "first";
  }
});


</script>

<template>

  <div v-if="show" class="modal z-[50]">

    <div class="relative flex flex-col items-center rounded-lg w-[95%] h-[95%] bg-[#151316] scale-[0.8]">

      <!-- PopUp-->
      <div v-if="activePopup === 'first'" class="h-full w-full flex flex-col items-center">

        <!-- Close Icon -->
        <svg @click="closePopup()" xmlns="http://www.w3.org/2000/svg"
          class="absolute top-4 right-4 text-white cursor-pointer w-8 h-8" viewBox="0 0 24 24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path fill="currentColor"
            d="M13.41 12l4.95-4.95a1 1 0 0 0-1.41-1.41L12 10.59 7.05 5.05a1 1 0 0 0-1.41 1.41L10.59 12l-4.95 4.95a1 1 0 0 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12z" />
        </svg>

        <!-- Profile Photo -->
        <div class="mt-[75px] bg-white p-2 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24"><path fill="#222125" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4"/></svg>
        </div>

        <!-- Student Name -->
        <p class="mt-[25px] text-[25px] font-semibold"> {{ student.name }} ({{ student.age }}) </p>

        <!-- Course & Year -->
        <p class="mt-[5px] text-[15px] text-[#8B8A8B] font-semibold"> {{ t('Software') }} {{ student.ano + ')' }}  </p>

        <!-- Email -->
        <p class="mt-[20px] text-[15px] text-[#8B8A8B] font-semibold"> Email </p>
        <p class="mt-[5px] text-[18px] text-[#ffffff] font-semibold">  {{ student.id }}@alunos.uminho.pt </p>

        <!-- Location -->
        <p class="mt-[20px] text-[15px] text-[#8B8A8B] font-semibold"> {{ t('Location') }} </p>
        <p class="mt-[5px] text-[18px] text-[#ffffff] font-semibold">  {{ student.location }} </p>

        <!-- Location -->
        <p class="mt-[20px] text-[15px] text-[#8B8A8B] font-semibold"> {{ t('Interests') }} </p>
        <div class="mt-[5px] flex flex-wrap gap-3">
        <div
          v-for="(interest, index) in student.interests"
          :key="index"
          :style="{ backgroundColor: getColor() }"
          class="px-4 py-2 rounded-md text-white font-semibold shadow-md transition-transform hover:scale-105 cursor-default"
        >
          {{ interest }}
        </div>
      </div>

      <!-- View Schedule Button -->
      <button 
        @click="switchOverlay('second')"
        class="mt-[60px] relative group bg-[#9553F8] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
        style="width: 200px; height: 50px; flex-shrink: 0;"
        >
      
        <span class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-5">
          {{ t('viewSchedule') }}
        </span>

        <span class="absolute right-[-16px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M13 11.6V8q0-.425-.288-.712T12 7t-.712.288T11 8v3.975q0 .2.075.388t.225.337l3.3 3.3q.275.275.7.275T16 16t.275-.7t-.275-.7zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.325 0 5.663-2.337T20 12t-2.337-5.663T12 4T6.337 6.338T4 12t2.338 5.663T12 20"/>
          </svg>
        </span>

      </button>

      </div>

      <!-- PopUp Schedule Change -->
      <div v-if="activePopup === 'second'" class="h-full w-full flex flex-col justify-center items-end">
        
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

        <Schedule 
          ref="scheduleRef" 
          :resetTrigger="resetTrigger" 
          :resetTrigger2="resetTrigger2"
          :resetWarning="resetWarning" 
          :type="'accordion'" 
          :ucID="0" 
          :studentID="student.id"
          @scheduleWarning="val => scheduleWarning = val"
        />

        <!-- Botões & Informações -->
        <div class="w-full flex justify-between items-center gap-4 pb-4 bg-[#151316] px-12">
          
          <!-- Aviso de Conflito de Horario -->
          <div 
            v-if="scheduleWarning" 
            class="text-red-500 font-semibold w-full text-left flex items-center gap-2"
          >
            <!-- Ícone SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" class="text-red-500">
              <path fill="currentColor" d="M2.725 21q-.275 0-.5-.137t-.35-.363t-.137-.488t.137-.512l9.25-16q.15-.25.388-.375T12 3t.488.125t.387.375l9.25 16q.15.25.138.513t-.138.487t-.35.363t-.5.137zM12 18q.425 0 .713-.288T13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18m0-3q.425 0 .713-.288T13 14v-3q0-.425-.288-.712T12 10t-.712.288T11 11v3q0 .425.288.713T12 15"/>
            </svg>
            <span class="mt-1">{{ scheduleWarning }}</span>
          </div>

          <div class="w-full flex justify-end gap-4 items-center">
            <!-- Informação da inscrição -->
            <div class="flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#9553F8" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>
              <p v-if="student.firstInscription" class="text-semibold pl-2 text-[17px]">
                {{ t('firstRegister') }}
              </p>
              <p v-if="!student.firstInscription" class="text-semibold pl-2 text-[17px]">
                {{ t('notfirstRegister') }}
              </p>
            </div>

            <!-- Botão Clean -->
            <button @click="clearSchedule()">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                class="cursor-pointer text-white hover:text-[#d2b7ff] transition-colors duration-200"
              >
                <path fill="currentColor"
                  d="M12 20q-3.35 0-5.675-2.325T4 12t2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V5q0-.425.288-.712T19 4t.713.288T20 5v5q0 .425-.288.713T19 11h-5q-.425 0-.712-.288T13 10t.288-.712T14 9h3.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12t1.75 4.25T12 18q1.7 0 3.113-.862t2.187-2.313q.2-.35.563-.487t.737-.013q.4.125.575.525t-.025.75q-1.025 2-2.925 3.2T12 20" />
              </svg>
            </button>

            <!-- Botão Publish -->
            <button 
              @click="publishSchedule()"
              class="relative group bg-[#9553F8] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
              style="width: 170px; height: 40px; flex-shrink: 0;"
            >
              <span class="block w-full text-center font-semibold transition-all duration-200 group-hover:-translate-x-8">
                {{ t('publish') }}
              </span>

              <span class="absolute right-[-16px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor"
                    d="M4.4 19.425q-.5.2-.95-.088T3 18.5V14l8-2l-8-2V5.5q0-.55.45-.837t.95-.088l15.4 6.5q.625.275.625.925t-.625.925z"/>
                </svg>
              </span>
            </button>
          </div>

        </div>

      
      </div>

    </div>

  </div>

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