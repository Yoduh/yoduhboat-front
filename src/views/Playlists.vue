<template>
  <div id="playlists">
    <div class="text-5xl my-5">{{ user.selectedGuildName }} Playlists</div>
    <div class="dropdown">
      <input
        v-model="filterText"
        class="input input-bordered"
        placeholder="Filter by playlist name"
      />
      <ul
        ref="filterDropdown"
        tabindex="0"
        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-80 flex-nowrap overflow-auto"
      >
        <li v-for="item in filteredPlaylists" :key="item.id">
          <a @click.prevent="filter(item.name)">{{ item.name }}</a>
        </li>
      </ul>
    </div>

    <button
      class="btn bg-green-800 text-white hover:bg-green-600 ml-5"
      @click="newDialog = true"
    >
      Create new playlist
    </button>
    <div
      v-for="(playlist, i) in filteredPlaylists"
      :key="playlist.id"
      class="my-8"
    >
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
            :true-value="JSON.parse(JSON.stringify(playlist))"
            :false-value="null"
          />
          <div class="collapse-title text-xl font-medium">
            Songs: {{ playlist.songsNum }}
          </div>
          <div v-if="activePlaylist" class="collapse-content">
            <div v-if="!activePlaylist.songs">Loading...</div>
            <div v-else-if="activePlaylist.songs?.length === 0">
              No songs on this playlist
            </div>
            <div v-else>
              <div v-if="!drag" class="flex btn" @click="toggleDrag">
                Order locked <Lock />
              </div>
              <div v-else class="flex btn" @click="toggleDrag">
                Order unlocked <LockOpen />
              </div>
              <draggable
                v-model="activePlaylist.songs"
                :disabled="!drag"
                item-key="_id"
                ghost-class="ghost"
                :scroll-sensitivity="100"
                :force-fallback="true"
              >
                <template #item="{ element: song }">
                  <QueueCard
                    :key="song._id"
                    :queue-song="song"
                    class="p-3 basis-1/4"
                    :class="{ draggable: drag }"
                    :is-draggable="drag"
                    :style="{ userSelect: drag ? 'none' : 'default' }"
                    @remove="confirmRemoveSong(activePlaylist!.id, song)"
                  />
                </template>
              </draggable>
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
import { useAlertStore } from '@/stores/alert';
import { storeToRefs } from 'pinia';
import { onUnmounted, watch, ref, computed } from 'vue';
import { useFocus } from '@vueuse/core';
import PlaylistPlus from 'vue-material-design-icons/PlaylistPlus.vue';
import PlaylistCheck from 'vue-material-design-icons/PlaylistCheck.vue';
import DeleteOutline from 'vue-material-design-icons/DeleteOutline.vue';
import Lock from 'vue-material-design-icons/Lock.vue';
import LockOpen from 'vue-material-design-icons/LockOpen.vue';
import draggable from 'vuedraggable';

const user = useUserStore();
const store = usePlaylistStore();
const { playlists, activePlaylist, unsaved } = storeToRefs(store);

const filterDropdown = ref();
const { focused } = useFocus(filterDropdown);
const filterText = ref('');
const filteredPlaylists = computed(() =>
  playlists.value.filter(p => p.name.toLowerCase().includes(filterText.value))
);
function filter(name: string) {
  filterText.value = name;
  focused.value = false;
}

const songToRemove = ref<{
  name: string;
  playlist: string;
  index: number;
} | null>(null);
const songDialog = ref(false);
function confirmRemoveSong(playlistId: string, song: Song) {
  const playlist = playlists.value.find(p => p.id === playlistId);
  if (playlist) {
    const index = playlist.songs!.indexOf(song);
    songToRemove.value = {
      name: song.title,
      playlist: playlist.name,
      index: index
    };
    songDialog.value = true;
  }
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
    drag.value = false;
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

const drag = ref(false);
function toggleDrag() {
  if (drag.value && unsaved.value) {
    // save new order
  }
  drag.value = !drag.value;
}

const alertStore = useAlertStore();
watch(unsaved, val => {
  if (val) {
    const message = 'You have unsaved changes!';
    const btn1 = {
      title: 'Save',
      fn: () => {
        store.setNewOrder();
        drag.value = false;
        alertStore.forceClose();
      }
    };
    const btn2 = {
      title: 'Cancel',
      fn: () => {
        drag.value = false;
        alertStore.forceClose();
        store.resetActivePlaylistOrder();
      }
    };
    alertStore.setMessage(message, 'info', null);
    alertStore.setButtons(btn1, btn2);
  }
  if (!val) {
    alertStore.forceClose();
  }
});

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

.ghost {
  opacity: 0.5;
  background: #1f5d38;
}

.draggable {
  cursor: move;
}
</style>
