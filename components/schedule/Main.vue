<script lang="ts" setup>
import Schedule from './Schedule.vue';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
const userID = useCookie<string>('userID', { default: () => '' });
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

type ScheduleComponentExposed = {
  getSchedule: () => ScheduleItem[];
};

const scheduleRef = ref<ScheduleComponentExposed>();
const gridRef = ref<HTMLElement | null>(null);

async function exportSchedule() {
  console.log(scheduleRef.value)
  const schedule = scheduleRef.value?.getSchedule();
  if (!schedule || !gridRef.value) return;

  // 1. Capture screenshot of schedule grid
  const canvas = await html2canvas(gridRef.value);
  const imgData = canvas.toDataURL('image/png');

  // 2. Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // 3. Fill background with #151316
  pdf.setFillColor('#151316');
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // 4. Add screenshot image
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth - 20; // 10mm padding on each side
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  const imgY = 10;

  pdf.addImage(imgData, 'PNG', 10, imgY, imgWidth, imgHeight);

  // 5. Set up white text
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'medium');
  pdf.setFontSize(11);

  // 6. Render class info below the image
  let y = imgY + imgHeight + 10;
  const lineHeight = 7;

  pdf.text('Schedule Details:', 10, y);
  y += lineHeight;

  schedule.forEach((item, index) => {
    // Define order of weekdays
    const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Sort the schedule chronologically
    schedule.sort((a, b) => {
      const dayA = weekdayOrder.indexOf(a.day);
      const dayB = weekdayOrder.indexOf(b.day);

      if (dayA !== dayB) return dayA - dayB;

      // If same day, compare startTime (in HH:MM format)
      const [hourA, minA] = a.startTime.split(':').map(Number);
      const [hourB, minB] = b.startTime.split(':').map(Number);
      return hourA !== hourB ? hourA - hourB : minA - minB;
    });
    const text = `${index + 1}. ${item.fullName} | ${item.turn} | ${item.day} ${item.startTime} (${item.duration}h) | ${item.classroom} | ${item.teacher}`;

    // If we reach bottom, create a new page and redraw background
    if (y + lineHeight > pageHeight - 10) {
      pdf.addPage();
      pdf.setFillColor('#151316');
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      y = 20;
    }

    pdf.text(text, 10, y);
    y += lineHeight;
  });

  // 7. Save the PDF
  pdf.save(userID.value+'Schedule.pdf');
}


</script>

<template>

  <div class="h-screen relative overflow-hidden bg-[#151316] w-full">

    <div ref="gridRef">
      <Schedule ref="scheduleRef" :type="'normal'" :ucID="0" />
    </div>
    

    <div class="w-full px-12 flex justify-end items-center">
      
      <button
        @click="exportSchedule()" 
        class="relative group bg-[#9553F8] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:cursor-pointer hover:bg-gradient-to-l hover:from-[#583192] hover:to-[#9553F8] overflow-hidden"
        style="width: 170px; height: 40px; flex-shrink: 0;"
      >
      
        <span class="block w-full text-center font-semibold text transition-all duration-200 group-hover:-translate-x-8">
          {{ t('export') }}
        </span>

        <span class="absolute right-[-12px] top-1/2 transform -translate-y-1/2 opacity-0 transition-all ease-in-out duration-500 group-hover:opacity-100 group-hover:-translate-x-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18 2h-7.17c-.53 0-1.04.21-1.42.59L4.59 7.41C4.21 7.79 4 8.3 4 8.83V20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-6.35 14.65l-2.79-2.79c-.32-.32-.1-.86.35-.86H11v-2.99a1 1 0 0 1 .99-1a.993.993 0 0 1 1.01 1V13h1.79c.45 0 .67.54.35.85l-2.79 2.79c-.19.2-.51.2-.7.01"/>
          </svg>
        </span>

      </button>

    </div>

  </div>

</template>

