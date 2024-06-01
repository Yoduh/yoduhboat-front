<template>
  <div id="search">
    <div class="text-5xl mt-5">YouTube Search</div>
    <div class="text-md mb-8 italic">
      Supports text search, YouTube playlist links, and all Spotify links
    </div>
    <div class="form-control flex justify-start">
      <div class="text-xl flex items-center" style="min-height: 48px">
        Adding to

        <div class="tooltip flex" :data-tip="`Switch to ${sources[1]}`">
          <button
            class="label-text mr-3 btn my-3 bg-green-800 hover:bg-green-600 text-white text-xl px-2 ml-1"
            @click="toggle"
          >
            {{ sources[0] }}
          </button>
        </div>
        <span v-if="addToPlaylist"
          ><select
            v-model="selectedPlaylist"
            class="select select-bordered w-full max-w-xs ml-2"
          >
            <option disabled value="null" class="text-xl">
              Select Playlist
            </option>
            <option
              v-for="playlist in playlists"
              :key="playlist.id"
              :value="playlist.name"
              class="text-xl"
            >
              {{ playlist.name }}
            </option>
          </select></span
        >
      </div>
    </div>

    <div
      v-if="addToPlaylist && !selectedPlaylist"
      class="text-red-500"
      style="min-height: 20px"
    >
      Must select playlist before adding songs!
    </div>
    <div v-if="searchStore.loading">
      <span class="loading loading-bars loading-lg"></span>
    </div>
    <div v-else class="queue w-full divide-y divide-solid divide-emerald-800">
      <SearchPlaylistCard
        v-if="searchStore.playlist"
        :playlist="selectedPlaylist"
        :add-to-playlist="addToPlaylist"
        class="p-3 basis-1/4"
        @add="addPlaylist"
        @addnext="addPlaylistNext"
      >
      </SearchPlaylistCard>
      <SearchCard
        v-for="result in searchStore.searchList"
        :key="result.id"
        :result="result"
        :playlist="selectedPlaylist"
        :add-to-playlist="addToPlaylist"
        class="p-3 basis-1/4"
        @add="addSong"
        @addnext="addSongNext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchCard from '@/components/SearchCard.vue';
import SearchPlaylistCard from '@/components/SearchPlaylistCard.vue';
import { usePlaylistStore } from '@/stores/playlist';
import { useQueueStore } from '@/stores/queue';
import { useSearchStore } from '@/stores/search';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
const searchStore = useSearchStore();
const playlistStore = usePlaylistStore();
const { playlists } = storeToRefs(playlistStore);

const sources = ref(['Queue', 'Playlist']);
const selectedPlaylist = ref<null | string>(null);

const addToPlaylist = ref(false);
function toggle() {
  addToPlaylist.value = !addToPlaylist.value;
  const temp = sources.value[0];
  sources.value[0] = sources.value[1];
  sources.value[1] = temp;
  if (!addToPlaylist.value) {
    selectedPlaylist.value = null;
  }
}

const queue = useQueueStore();
function addSong(result: YoutubeResult) {
  if (addToPlaylist.value && selectedPlaylist.value) {
    playlistStore.addSongToPlaylist(selectedPlaylist.value, result.url);
  } else {
    queue.addSong(result.url);
  }
  searchStore.setAdded(result);
}

function addSongNext(result: YoutubeResult) {
  queue.addSongNext(result.url);
  searchStore.setAddedNext(result);
}

function addPlaylist() {
  if (addToPlaylist.value && selectedPlaylist.value && searchStore.playlist) {
    playlistStore.addSongToPlaylist(
      selectedPlaylist.value,
      searchStore.playlist.url
    );
  } else if (searchStore.playlist) {
    queue.addSong(searchStore.playlist.url);
  }
  if (searchStore.playlist) {
    searchStore.playlist.added = true;
  }
}
function addPlaylistNext() {
  if (searchStore.playlist) {
    queue.addSongNext(searchStore.playlist.url);
    searchStore.playlist.addedNext = true;
  }
}
</script>

<style scoped></style>
