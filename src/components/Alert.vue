<template>
  <div
    role="alert"
    class="alert fixed top-10 z-50 w-fit self-center text-white"
    :class="alertType"
  >
    <svg
      v-if="type === 'error'"
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <svg
      v-else-if="type === 'info'"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-info shrink-0 w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <span>{{ message }}</span>
    <div v-if="btn1" class="flex">
      <button
        class="btn btn-sm bg-green-500 hover:bg-green-400 text-white border-none"
        @click="btn1!.fn"
      >
        <span v-if="btn1.title === 'Save'"><Save /></span>{{ btn1.title }}
      </button>
      <button
        v-if="btn2"
        class="btn btn-sm bg-red-500 hover:bg-red-400 border-none text-white btn-primary ml-2"
        @click="btn2!.fn"
      >
        {{ btn2.title }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAlertStore } from '@/stores/alert';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import Save from 'vue-material-design-icons/ContentSave.vue';

const store = useAlertStore();

const { message, type, btn1, btn2 } = storeToRefs(store);

const alertType = computed(() => {
  return `alert-${type.value}`;
});
</script>

<style scoped>
.alert {
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px, rgb(51, 51, 51) 0px 0px 0px 3px;
}
</style>
