<script setup lang="ts">
defineProps<{ show: boolean, message: string }>();
const emit = defineEmits(["confirm", "cancel"]);
const { t, locale } = useI18n();

function confirmAction() {
  emit("confirm");
}

function cancelAction() {
  emit("cancel");
}
</script>

<template>
    <div v-if="show" class="modal z-[50]">
        <div class="w-[550px] p-[24px] rounded-[15px] bg-[#222125] top-[200px] right-[150px]">
            <div class="w-full flex justify-start items-center gap-2">
                <svg class="text-[#9553F8]" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m6 13h-5l-1-2H9.5v5H8V7h6l1 2h3z"/>
                </svg>
                <h1 class="text-left text-white text-[24px] font-semibold">
                    {{ t('usure') }}
                </h1>
            </div>
            <div class="w-full pr-24 py-4">
                <p class="text-white">
                    {{ message }}
                </p>
            </div>
            <div class="w-full flex justify-center items-center gap-3">
                <button @click="confirmAction()" class="bg-[#9553F8] hover:scale-[1.02] transition duration-200 ease-in-out rounded-[5px] flex justify-center items-center h-[41px] w-[170px]">
                    <p class="font-semibold text-white text-[16px]">
                        {{ t('yes') }}
                    </p>
                </button>
                <button @click="cancelAction()" class="bg-[#DF0000] hover:scale-[1.02] transition duration-200 ease-in-out rounded-[5px] flex justify-center items-center h-[41px] w-[170px]">
                    <p class="font-semibold text-white text-[16px]">
                        {{ t('cancel') }}
                    </p>
                </button>
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
</style>
