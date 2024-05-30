<template>
  <div id="playlists">
    <div class="text-5xl my-5">Playlists</div>
    <button
      class="btn bg-green-800 text-white mt-10 hover:bg-green-600"
      @click="newDialog = true"
    >
      Create new playlist
    </button>
    <div class="text-2xl mt-10">{{ user.selectedGuildName }} playlists:</div>
    <div v-for="(playlist, i) in playlists" :key="playlist.id" class="my-8">
      <div class="flex justify-between">
        <div class="flex">
          <div class="text-2xl text-green-500 mr-2 mb-1">
            {{ playlist.name }}
          </div>
          <div
            v-if="!added[i]"
            class="tooltip flex"
            :data-tip="
              playlist.songsNum === 0 ? 'Add songs first' : 'Add to Queue'
            "
          >
            <button
              :disabled="playlist.songsNum === 0"
              class="btn btn-circle btn-outline btn-sm"
              @click="addPlaylist(playlist.name, i)"
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
        </div>
        <div class="tooltip flex" data-tip="Delete playlist">
          <button
            class="btn btn-circle btn-sm bg-transparent border-none text-red-500"
            @click="confirmRemovePlaylist(playlist.name)"
          >
            <DeleteOutline />
          </button>
        </div>
      </div>
      <div class="text-sm">Total duration: {{ playlist.duration }}</div>
      <div class="text-sm">Created by: {{ playlist.createdBy }}</div>
      <div class="collapse collapse-arrow bg-base-200">
        <div class="collapse collapse-arrow bg-base-200">
          <input
            v-model="activePlaylist"
            type="checkbox"
            :true-value="playlist"
            :false-value="null"
          />
          <div class="collapse-title text-xl font-medium">
            Songs: {{ playlist.songsNum }}
          </div>
          <div class="collapse-content">
            <div v-if="!playlist.songs">Loading...</div>
            <div v-else-if="playlist.songs.length === 0">
              No songs on this playlist
            </div>
            <div v-else>
              <QueueCard
                v-for="(song, idx) in playlist.songs"
                :key="song._id"
                :queue-song="song"
                class="p-3 basis-1/4"
                @remove="confirmRemoveSong(playlist.name, idx, song.title)"
              />
            </div>
          </div>
        </div>
      </div>
      <hr class="my-10" />
    </div>
    <MyDialog
      v-model="songDialog"
      title="Delete Song"
      ok-btn="Confirm"
      class="modal"
      @ok="removeSong"
    >
      <template #default>
        <div>
          Do you really want to delete
          <span class="font-bold">{{ songToRemove?.name }}</span> from the
          playlist?
        </div>
      </template>
    </MyDialog>
    <MyDialog
      v-model="playlistDialog"
      title="Delete Playlist"
      ok-btn="Confirm"
      class="modal"
      @ok="removePlaylist"
    >
      <template #default>
        <div>
          Do you really want to delete the entire
          <span class="font-bold">{{ playlistToRemove }}</span> playlist?
        </div>
      </template>
    </MyDialog>
    <MyDialog
      v-model="newDialog"
      title="Create Playlist"
      ok-btn="Confirm"
      class="modal"
      @ok="createPlaylist"
      @closed="newPlaylistName = ''"
    >
      <template #default>
        <div>
          <input
            v-model="newPlaylistName"
            type="text"
            placeholder="Playlist name"
            class="input input-bordered w-full max-w-xs"
          />
        </div>
      </template>
    </MyDialog>
    <div v-if="error !== ''" class="toast">
      <div class="alert alert-error error text-white">
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from '@/plugins/api';
import QueueCard from '@/components/QueueCard.vue';
import MyDialog from '@/components/Dialog.vue';
import { useUserStore } from '@/stores/user';
import { usePlaylistStore } from '@/stores/playlist';
import { storeToRefs } from 'pinia';
import { onUnmounted, watch, ref } from 'vue';
import PlaylistPlus from 'vue-material-design-icons/PlaylistPlus.vue';
import PlaylistCheck from 'vue-material-design-icons/PlaylistCheck.vue';
import DeleteOutline from 'vue-material-design-icons/DeleteOutline.vue';

const user = useUserStore();
const store = usePlaylistStore();
const { playlists, activePlaylist } = storeToRefs(store);

const songToRemove = ref<{
  name: string;
  playlist: string;
  index: number;
} | null>(null);
const songDialog = ref(false);
function confirmRemoveSong(
  playlistName: string,
  index: number,
  songName: string
) {
  songToRemove.value = {
    name: songName,
    playlist: playlistName,
    index: index
  };
  songDialog.value = true;
}
async function removeSong() {
  if (songToRemove.value) {
    api
      .post(`${import.meta.env.VITE_API}/playlist/removesong`, {
        guildId: user.selectedGuild,
        userId: user.id,
        playlistName: songToRemove.value.playlist,
        index: String(songToRemove.value.index + 1) // backend removes based on position starting at 1
      })
      .catch(e => {
        console.error(e);
      });
  }
}

watch(
  () => activePlaylist.value?.id,
  () => {
    if (activePlaylist.value && !activePlaylist.value.songs) {
      store.getSongsForPlaylist(activePlaylist.value.id);
    }
  }
);

const added = ref([false]);
function addPlaylist(playlistName: string, index: number) {
  added.value[index] = true;
  api.post('/addSong', {
    user: user.id,
    guild: user.selectedGuild,
    url: playlistName
  });
}

const playlistDialog = ref(false);
const playlistToRemove = ref('');
function confirmRemovePlaylist(playlistName: string) {
  playlistToRemove.value = playlistName;
  playlistDialog.value = true;
}
function removePlaylist() {
  api
    .post(`${import.meta.env.VITE_API}/playlist/remove`, {
      guildId: user.selectedGuild,
      userId: user.id,
      playlistName: playlistToRemove.value
    })
    .catch(e => {
      console.error(e);
    });
}

const newDialog = ref(false);
const newPlaylistName = ref('');
const error = ref('');
function createPlaylist() {
  if (
    newPlaylistName.value.toLowerCase().includes('youtu') ||
    newPlaylistName.value.toLowerCase().includes('spotify')
  ) {
    error.value =
      'Playlist name can not have "youtube" or "spotify" in the name for REASONS. Try again';
  } else if (
    playlists.value.find(
      p => p.name.toLowerCase() === newPlaylistName.value.toLowerCase()
    )
  ) {
    error.value = 'Playlist with that name already exists. Try again';
    setTimeout(() => {
      error.value = '';
    }, 3000);
  } else {
    error.value = '';
    api
      .post(`${import.meta.env.VITE_API}/playlist/create`, {
        guildId: user.selectedGuild,
        userId: user.id,
        playlistName: newPlaylistName.value
      })
      .catch(e => {
        console.error(e);
      });
  }
}

onUnmounted(() => {
  activePlaylist.value = null;
});
</script>

<style lang="scss" scoped>
.toast {
  left: 0;
  right: 0;
  top: 6%;
  margin-left: auto;
  margin-right: auto;
  width: 200px;
}
</style>
