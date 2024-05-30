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
    <div class="add flex">
      <div
        v-if="!props.result.added"
        class="tooltip"
        :data-tip="`Add to ${queueOrPlaylist}`"
      >
        <button
          :disabled="props.addToPlaylist && !props.playlist"
          class="btn btn-circle btn-outline btn-sm"
          @click="addResult"
        >
          <PlaylistPlus />
        </button>
      </div>
      <button
        v-else
        class="btn btn-success btn-circle btn-outline btn-sm added"
      >
        <PlaylistCheck />
      </button>
      <div
        v-if="!props.result.addedNext"
        class="tooltip"
        :data-tip="
          props.addToPlaylist
            ? 'Only available when adding to Queue'
            : `Add to TOP of Queue`
        "
      >
        <button
          :disabled="props.addToPlaylist"
          class="btn btn-circle btn-outline btn-sm ml-2"
          @click="addResultNext"
        >
          <ArrowULeftTop />
        </button>
      </div>
      <button
        v-else
        class="btn btn-success btn-circle btn-outline btn-sm added ml-2"
      >
        <Check />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { PropType } from 'vue';
import PlaylistPlus from 'vue-material-design-icons/PlaylistPlus.vue';
import PlaylistCheck from 'vue-material-design-icons/PlaylistCheck.vue';
import ArrowULeftTop from 'vue-material-design-icons/ArrowULeftTop.vue';
import Check from 'vue-material-design-icons/Check.vue';
import { useSearchStore } from '@/stores/search';

const emit = defineEmits(['add', 'addnext']);
const props = defineProps({
  result: {
    type: Object as PropType<YoutubeResult>,
    default: () => ({})
  },
  playlist: {
    type: [String, null] as PropType<string | null>,
    default: null
  },
  addToPlaylist: {
    type: Boolean,
    default: false
  }
});

const queueOrPlaylist = computed(() =>
  props.addToPlaylist ? 'Playlist' : 'Queue'
);

const thumbnail = computed(() => {
  if (props.result?.thumbnails && props.result.thumbnails.length > 0) {
    return props.result.thumbnails[0].url;
  }
  return '';
});

const searchStore = useSearchStore();
function addResult() {
  emit('add', props.result);
}
function addResultNext() {
  emit('addnext', props.result);
}

watch(
  () => props.addToPlaylist,
  () => {
    searchStore.resetAdditions();
  }
);
</script>

<style scoped></style>
