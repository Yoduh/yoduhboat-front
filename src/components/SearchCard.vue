<template>
  <div class="song flex">
    <div class="thumbnail">
      <img :src="thumbnail" width="100" height="100" />
    </div>
    <div
      class="song-info ml-5 flex flex-col justify-between w-full text-green-200"
    >
      <div class="title-and-duration">
        <div>{{ props.result.title }}</div>
        <div class="text-sm text-emerald-300 opacity-50 flex">
          {{ props.result.channel.name }}
          <div class="mx-2 text-white">&#8226;</div>
          {{ props.result.durationRaw }}
        </div>
      </div>
    </div>
    <div class="add">
      <button
        v-if="!props.result.added"
        class="btn btn-circle btn-outline btn-sm"
        @click="addResult"
      >
        <PlaylistPlus />
      </button>
      <button
        v-else
        class="btn btn-success btn-circle btn-outline btn-sm added"
      >
        <PlaylistCheck />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import PlaylistPlus from 'vue-material-design-icons/PlaylistPlus.vue';
import PlaylistCheck from 'vue-material-design-icons/PlaylistCheck.vue';
import { useQueueStore } from '@/stores/queue';
import { useSearchStore } from '@/stores/search';

const props = defineProps({
  result: {
    type: Object as PropType<YoutubeResult>,
    default: () => ({})
  }
});

const thumbnail = computed(() => {
  if (props.result?.thumbnails && props.result.thumbnails.length > 0) {
    return props.result.thumbnails[0].url;
  }
  return '';
});

const queue = useQueueStore();
const searchStore = useSearchStore();
const addResult = () => {
  queue.addSong(props.result.url);
  searchStore.setAdded(props.result);
};
</script>

<style scoped></style>
