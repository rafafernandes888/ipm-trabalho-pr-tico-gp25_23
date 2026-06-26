<script lang="ts" setup>
import { ref } from 'vue';

const { t, locale } = useI18n();
const router = useRouter();

const languages = [
  { code: 'en', name: 'English', flag: '/languageSelector/en.svg' },
  { code: '', name: 'Português', flag: '/languageSelector/pt.svg' },
  { code: 'es', name: 'Español', flag: '/languageSelector/es.svg' },
  { code: 'fr', name: 'Français', flag: '/languageSelector/fr.svg' },
  { code: 'it', name: 'Italiano', flag: '/languageSelector/it.svg' },
  { code: 'de', name: 'Deutsch', flag: '/languageSelector/de.svg' },
  { code: 'zh-CN', name: '中国人', flag: '/languageSelector/china.svg' }
];

const dropdownOpen = ref(false);

const closeNopenDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

function changeLanguage(lang: string) {  
  const cleanLang = lang.replace(/^\/|\/$/g, '');
  if (lang == '') {
    router.push({ path: `${cleanLang}/account` });
  } else {
    router.push({ path: `/${cleanLang}/account` });
  }
}

const getCurrentFlag = () => {
  const currentLang = languages.find((lang) => lang.code === locale.value);
  return currentLang ? currentLang.flag : '/languageSelector/pt.svg';
};

const getCurrentLanguageName = () => {
  const currentLang = languages.find((lang) => lang.code === locale.value);
  return currentLang ? currentLang.name : 'Português';
};

</script>

<template>
  <div class="flex flex-col justify-center items-start w-full relative z-1">
    <p class="text-[14px] text-white font-semibold pb-2">
      {{ t('language') }}
    </p>
    <div class="bg-transparent h-[48px] border-2 border-white rounded-[5px] w-full pl-[18px] py-[10px] relative" @click="closeNopenDropdown()">
      <div class="inline-flex justify-center items-center absolute top-3 cursor-pointer">
        <img :src="getCurrentFlag()" class="w-4 h-4 scale-[1.5] mr-4"/>
        <span>{{ getCurrentLanguageName() }}</span>
      </div>
      <span class="caret absolute top-5 right-3 " :class="{'rotate-caret': dropdownOpen}"></span>
      <div v-if="dropdownOpen">
        <ul class="absolute top-10 left-0 mt-2 w-full border-2 border-white bg-[#151316] rounded-[5px] shadow-lg z-[5] font-semibold text-sm">
          <li v-for="lang in languages" :key="lang.code" @click="changeLanguage(lang.code)" class="text-white rounded-[2px] hover:bg-[#9553F8] flex items-center px-4 py-2 transition ease-in-out cursor-pointer">
            <img :src="lang.flag" class="w-5 h-5 mr-2" />
            <span>{{ lang.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- Language Selector -->
  <div class="rt flex items-center text-left px-6 py-6 cursor-pointer hover:bg-[#f15e75] hover:text-white lg:hidden" @click="closeNopenDropdown">
    <!-- Flag Button -->
    <div class="flex items-center justify-between cursor-pointer w-full ">
      <img :src="getCurrentFlag()" class="w-5 h-5" />
      <span class="caret" :class="{ 'rotate-caret': dropdownOpen }"></span>
    </div>

    <!-- Dropdown Menu for small screens -->
    <div v-if="dropdownOpen">
      <ul class="absolute left-0 top-16 w-full bg-white rounded-md shadow-lg z-20 py-1 font-semibold" >
        <li v-for="lang in languages" :key="lang.code" @click="changeLanguage(lang.code)" class="text-[#3b4249] hover:text-[#f15e75] flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer">
          <img :src="lang.flag" class="w-5 h-5 mr-2" />
          <span>{{ lang.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
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
</style>