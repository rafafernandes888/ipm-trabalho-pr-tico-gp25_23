<script setup lang="ts">
defineProps<{ show: boolean, message: string }>();
const { t, locale } = useI18n();
</script>

<template>
    <transition name="modal">
        <div v-show="show" class="modal z-[50]">
            <div class="w-[550px] p-[24px] rounded-[15px] bg-[#222125] top-[200px] right-[150px]">
                <div class="w-full flex justify-start items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path fill="#00BE0D" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"/></svg>
                    <h1 class="text-left text-white text-[24px] font-semibold">
                        {{ t('successMessage') }}
                    </h1>
                </div>
                <div class="w-full pr-24 pt-3 pb-1">
                    <p>
                        {{ message }}
                    </p>
                </div>
            </div>
        </div>
    </transition>
</template>


<style scoped>
.modal {
  position: fixed;
  bottom: 5%;
  inset-inline: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  
  opacity: 0.3;
  transform: translateY(100px);

  transition: opacity 1.3s, transform 0.8s;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 1.3s, transform 0.8s;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
}

.modal-enter-to, .modal-leave {
  opacity: 1;
  transform: translateY(0);
}
</style>

