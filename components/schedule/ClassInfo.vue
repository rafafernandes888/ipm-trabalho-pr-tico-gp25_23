<script lang="ts" setup>
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

const props = defineProps<{
  show: boolean;
  scheduleItem: ScheduleItem | null;
}>();

const { t, locale } = useI18n();
const emit = defineEmits(["close"]);

function closePopup() {
  emit("close");
}

function computeEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHour = hours + duration;
  return endHour.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
}
</script>

<template>
  <div v-if="show" class="modal" @click.self="closePopup">
    <div class="w-[400px] bg-[#222125] p-6 flex flex-col items-center rounded-lg">
      <p class="text-white text-xl font-medium text-center">{{ scheduleItem?.fullName }}</p>
      <p class="text-white text-sm font-medium mb-4 text-center">
       {{ scheduleItem?.year == '1st' ? t('first') : scheduleItem?.year == '2nd' ? t('second') : t('third') }} {{ ` ${t('year')} - `}} {{ scheduleItem?.semester == '1st' ? t('first') : scheduleItem?.semester == '2nd' ? t('second') : t('third') }} {{' ' + t('Semester') }}
      </p>
      <div class="bg-[#343237] p-6 rounded-lg">
        <div class="text-white text-center space-y-4 px-10">
          <!-- Time com horário final calculado -->
          <p class="flex items-center justify-center gap-2">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8"/>
                <path fill="currentColor" d="M12.5 7H11v6l5.25 3.15l.75-1.23l-4.5-2.67z"/>
              </svg>
            </span>
            <span>
              {{ scheduleItem?.startTime }} - {{ computeEndTime(scheduleItem!.startTime, scheduleItem!.duration) }}
            </span>
          </p>
          <!-- Classroom -->
          <p class="flex items-center justify-center gap-2">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1"/>
              </svg>
            </span>
            <span>
              {{ scheduleItem?.classroom }}
            </span>
          </p>
          <!-- Turn -->
          <p class="flex items-center justify-center gap-2">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3l7 3V5c0-1.1-.9-2-2-2"/>
              </svg>
            </span>
            <span>
              {{ scheduleItem?.turn }}
            </span>
          </p>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
}
</style>
