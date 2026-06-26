<script lang="ts" setup>
import { Chart, registerables } from "chart.js";

const api = useAPI();
const { t, locale } = useI18n();
const userID = useCookie<string>('userID');
const router = useRouter();
const mensagens = ref<any[]>([]);
const totalAlunosNum = ref(0);
const allocatedAlunos = ref(0);
const unAllocatedAlunos = ref(0);

Chart.register(...registerables);
onMounted(async () => {
  try {
    const userResponse = await api.get(`diretor_curso/${userID.value}`);
    const alunosArray = await api.get('alunos');
    if (alunosArray.data) {
      totalAlunosNum.value = alunosArray.data.length;
      allocatedAlunos.value = alunosArray.data.filter((aluno: any) => aluno.scheduleStatus === true).length;
      unAllocatedAlunos.value = alunosArray.data.filter((aluno: any) => aluno.scheduleStatus === false).length;
    } else {
      console.error("No alunos found");
    }
    if (userResponse.data) {
      const data = userResponse.data;

      if (data.mensagens && Array.isArray(data.mensagens)) {
        let filteredMessages = [];

        if (data.notificationsProf && data.notificationsStudent) {
          // ✅ Show all types
          filteredMessages = data.mensagens;
        } else if (data.notificationsStudent) {
          // ✅ Only messages from students
          filteredMessages = data.mensagens.filter((msg: any) => msg.student === true);
        } else if (data.notificationsProf) {
          // ✅ Only messages from professors
          filteredMessages = data.mensagens.filter((msg: any) => msg.student === false);
        }

        // ✅ Sort by most recent (assuming higher ID = more recent)
        filteredMessages.sort((a: any, b: any) => b.id - a.id);

        // ✅ Take last 3 (most recent) messages
        mensagens.value = filteredMessages.slice(0, 3);
      }
    } else {
      console.error(`No mensagens array found.`);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }

  const pieChartData = {
    type: "pie",
    data: {
      labels: ["Allocated Students", "Unallocated Students"],
      datasets: [
        {
          data: [((allocatedAlunos.value/totalAlunosNum.value)*100).toFixed(1), ((unAllocatedAlunos.value/totalAlunosNum.value)*100).toFixed(1)],
          backgroundColor: [
            "white",
            "#9553F8"
          ],
          borderWidth: 0
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
      },
    },
  };

  const pieChartData2 = {
    type: "bar",
    data: {
      labels: ["TP1", "TP2", "TP3", "TP4", "TP5"],
      datasets: [
        {
          data: [15, 10, 30, 15, 40],
          backgroundColor: [
            "#9553F8"
          ]
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
      },
      scales: {
        x: {
          ticks: {
            color: "white"
          },
          grid: {
            display: false,
            color: "white"
          }
        },
        y: {
          ticks: {
            color: "white"
          },
          grid: {
            display: false,
            color: "white"
          }
        }
      },
    },
  };

  const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
  if (ctx) {
    new Chart(ctx, pieChartData);
  }
  const ctx2 = document.getElementById('pieChart2') as HTMLCanvasElement;
  if (ctx2) {
    new Chart(ctx2, pieChartData2);
  }
});

function goToInbox() {
  if (locale.value=='pt') {
    router.push('/inbox'); 
  } else {
    router.push('/'+locale.value+'/inbox');
  }
}

</script>
<template>
  <div class="bg-[#151316] w-full text-white py-[50px] px-[70px] relative overflow-hidden">
    <div class="shadow1"></div>
    <div class="shadow2"></div>
    <div class="flex flex-col gap-8">
      <div class="flex items-center justify-center gap-[5%] h-[350px]">
        <div class="w-[35%] flex flex-col justify-center items-center h-full relative bg-[#222125] rounded-xl">
          <p class="text-white font-semibold text-[20px] absolute top-3 left-5">
            {{ t('students') }} ({{ totalAlunosNum }})
          </p>
          <div class="w-[50%] mb-8 relative">
            <canvas class="pointer-events-none" id="pieChart"></canvas>
            <div class="absolute centered-element w-[50%] bg-[#222125] rounded-full"></div>
          </div>
          <div class="absolute left-5 bottom-3">
            <p class="text-white text-[14px] font-semibold relative pl-6">
              <span class="text-white text-7xl leading-[0px] absolute left-0 top-[-12px]">.</span>{{ t('unAllocated') }}<span class="pl-1 text-[#5C5C5C] text-[13px] font-semibold">{{ ((allocatedAlunos/totalAlunosNum)*100).toFixed(1) }}%</span>
            </p>
            <p class="text-white text-[14px] font-semibold relative pl-6">
              <span class="text-[#9553F8] leading-[0px] text-7xl absolute left-0 top-[-12px]">.</span>{{ t('allocated') }}<span class="pl-1 text-[#5C5C5C] text-[13px] font-semibold">{{ ((unAllocatedAlunos/totalAlunosNum)*100).toFixed(1) }}%</span>
            </p>
          </div>
        </div>
        <div class="w-[60%] flex flex-col justify-center items-center h-full relative bg-[#222125] rounded-xl">
          <p class="text-white font-semibold text-[20px] absolute top-3 left-5">
            {{ t('courseUnbalance') }}
          </p>
          <div class="w-[70%] relative mt-8">
            <canvas class="pointer-events-none" id="pieChart2"></canvas>
          </div>
          <div class="absolute left-5 bottom-3">
            <p class="text-white text-[15px] font-semibold relative">
              {{ t('course') }}: Análise Matemática
            </p>
          </div>
        </div>
      </div>

      <div>
        <h1 class="text-white text-[20px] font-semibold mb-3">
          {{ t('notifications') }}
        </h1>
        <div class="flex items-center gap-[5%]">
          <h1 v-if="mensagens.length==0" class="w-full flex justify-center items-center text-white text-[18px] font-semibold mt-6">
            There are no notifications to check.
          </h1>
          <div @click="goToInbox()" v-for="notification in mensagens" class="w-[20%] relative bg-[#222125] rounded-xl flex flex-col justify-center items-center gap-2 pb-6 pt-9 hover:scale-[1.02] ease-in-out duration-300 cursor-pointer">
            <div class="absolute top-1.5 right-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#9553F8" d="m3 8.41l9 9l7-7V15h2V7h-8v2h4.59L12 14.59L4.41 7z"/></svg>
            </div>
            <div class="bg-white p-2 rounded-full">
              <svg v-if="notification.student" xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 24 24"><path fill="#222125" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 24 24"><path fill="#222125" d="M5 13.18v4L12 21l7-3.82v-4L12 17zM12 3L1 9l11 6l9-4.91V17h2V9z"/></svg>
            </div>
            <p class="text-white text-[14px] font-semibold text-center pt-2 leading-[19px] w-[90%]">
              {{ notification.author }}
              <span class="block text-[#5C5C5C] text-[12px] font-semibold text-center">
                {{ notification.student ? t('student') : t('teacher') }}
              </span>
            </p>
            <p class="text-white w-full text-[14px] font-semibold text-center pt-1 leading-[23px] flex flex-col justify-center items-center">
              {{ t('subject') }}
              <span class="block w-[85%] text-[#5C5C5C] text-[12px] font-semibold text-center leading-[14px] truncate">
                {{ notification.subject }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.centered-element {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  aspect-ratio: 1;      
  height: auto;    
}
.shadow1 {
  position: absolute;
  width: 1300px; 
  height: 850px;
  bottom: -500px;
  right: -500px;
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