<template>
  <div class="song flex">
    <div class="thumbnail">
      <img :src="thumbnail" />
    </div>
    <div
      class="song-info ml-5 flex flex-col justify-between w-full text-green-200"
    >
      <div class="title-and-duration">
        <div>{{ title }}</div>
        <div class="text-sm text-emerald-300 opacity-50">
          {{ queueSong?.durationTime ?? youtubeSong.durationRaw }}
        </div>
      </div>
      <div v-if="queueSong?.avatar" class="flex items-center">
        <div class="avatar">
          <div class="w-5 rounded-full">
            <img :src="queueSong.avatar" />
          </div>
        </div>
        <div
          v-if="queueSong?.addedBy"
          class="ml-2 text-emerald-300 text-sm opacity-50"
        >
          {{ queueSong.addedBy }}
        </div>
      </div>
    </div>
    <div v-if="queueSong?.durationTime" class="remove">
      <button
        class="btn btn-circle btn-outline btn-sm remove-btn"
        @click="$emit('remove', queueSong)"
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
import { computed } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  queueSong: {
    type: Object as PropType<Song>,
    default: () => null
  },
  youtubeSong: {
    type: Object as PropType<YoutubeResult>,
    default: () => null
  }
});

const title = computed(() => {
  if (props.queueSong) {
    if (props.queueSong.artist)
      return `${props.queueSong.artist} - ${props.queueSong.title}`;
    else return `${props.queueSong.title}`;
  } else {
    return props.youtubeSong.title;
  }
});

const thumbnail = computed(() => {
  if (props.queueSong) {
    return props.queueSong.thumbnail;
  } else if (
    props.youtubeSong?.thumbnails &&
    props.youtubeSong.thumbnails.length > 0
  ) {
    return props.youtubeSong.thumbnails[0].url;
  }
  return '';
});

defineEmits(['remove']);
</script>

<style scoped>
.remove-btn {
  color: #696e78;
}
</style>
