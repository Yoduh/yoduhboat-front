<template>
  <div v-if="searchPlaylist" class="song flex">
    <div v-if="searchPlaylist.thumbnail" class="thumbnail w-56">
      <img :src="searchPlaylist.thumbnail" />
    </div>
    <div
      class="song-info ml-5 flex flex-col justify-between w-full text-green-200"
    >
      <div class="title-and-duration">
        <div>{{ searchPlaylist.title }}</div>
        <div class="text-sm text-emerald-300 opacity-50 flex">
          {{ searchPlaylist.channel.name }}
          <div class="mx-2 text-white">&#8226;</div>
          {{ searchPlaylist.durationRaw }}
        </div>

        <div class="collapse collapse-arrow bg-base-200">
          <div class="collapse collapse-arrow bg-base-200">
            <input
              v-model="activePlaylist"
              type="checkbox"
              :true-value="playlist"
              :false-value="null"
            />
            <div
              class="collapse-title text-md font-medium py-0 flex items-center"
            >
              Songs: {{ searchPlaylist.count }}
            </div>
            <div class="collapse-content">
              <div v-if="searchPlaylist.count === 0">
                No songs on this playlist
              </div>
              <div v-else>
                <QueueCard
                  v-for="song in searchPlaylist.songs"
                  :key="song.id"
                  :youtube-song="song"
                  class="p-3 basis-1/4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="add">
      <button
        v-if="!searchPlaylist.added"
        :disabled="props.addToPlaylist && !props.playlist"
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
import { watch, ref } from 'vue';
import type { PropType } from 'vue';
import QueueCard from '@/components/QueueCard.vue';
import PlaylistPlus from 'vue-material-design-icons/PlaylistPlus.vue';
import PlaylistCheck from 'vue-material-design-icons/PlaylistCheck.vue';
import { useSearchStore } from '@/stores/search';
import { storeToRefs } from 'pinia';

const props = defineProps({
  playlist: {
    type: [String, null] as PropType<string | null>,
    default: null
  },
  addToPlaylist: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['add']);

const searchStore = useSearchStore();
const { playlist: searchPlaylist } = storeToRefs(searchStore);
const addResult = () => {
  emit('add', searchPlaylist);
};

watch(
  () => props.addToPlaylist,
  () => {
    searchStore.resetAdditions();
  }
);

const activePlaylist = ref();
</script>

<style scoped>
.collapse-title,
input {
  min-height: 2.5rem;
}
.collapse-title::after {
  top: 1.25rem;
}
</style>
