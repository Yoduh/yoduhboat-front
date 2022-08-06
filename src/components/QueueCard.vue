<template>
  <div class="song flex">
    <div class="thumbnail">
      <img :src="props.song.thumbnail" width="100" height="100" />
    </div>
    <div
      class="song-info ml-5 flex flex-col justify-between w-full text-green-200"
    >
      <div class="title-and-duration">
        <div>{{ title }}</div>
        <div class="text-sm text-emerald-300 opacity-50">
          {{ props.song.durationTime }}
        </div>
      </div>
      <div class="flex items-center">
        <div class="avatar">
          <div class="w-5 rounded-full">
            <img :src="props.song.avatar" />
          </div>
        </div>
        <div class="ml-2 text-emerald-300 opacity-50">
          {{ props.song.addedBy }}
        </div>
      </div>
    </div>
    <div class="remove">
      <button
        class="btn btn-circle btn-outline btn-sm remove-btn"
        @click="$emit('remove', song)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { useQueueStore } from '@/stores/queue.js';

const props = defineProps({
  song: {
    type: Object as PropType<Song>,
    default: () => ({})
  }
});

const queue = useQueueStore();
const title = computed(() => queue.getQueueSongTitle(props.song._id));

defineEmits(['remove']);
</script>

<style scoped>
.remove-btn {
  color: #696e78;
}
</style>
