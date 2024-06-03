<template>
  <div class="queue w-full">
    <div class="text-5xl my-5">Currently Playing</div>
    <div v-if="queue.songs.length === 0" class="mt-10">Queue is empty!</div>
    <div v-else class="font-xl flex justify-end">
      <div
        class="btn bg-green-800 hover:bg-green-600 text-white mb-4"
        @click="stop"
      >
        Remove All
      </div>
    </div>
    <div class="divide-y divide-solid divide-emerald-800">
      <QueueCard
        v-for="(song, i) in queue.songs"
        :key="i"
        :queue-song="song"
        class="p-3 basis-1/4"
        :class="{ 'bg-yoduh-green-1': i == 0 }"
        @remove="remove(song, i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQueueStore } from '@/stores/queue';
import QueueCard from '@/components/QueueCard.vue';
import { api } from '@/plugins/api';
import { useUserStore } from '@/stores/user';
const queue = useQueueStore();

function remove(song: Song, idx: number) {
  queue.removeSong(song, idx);
}

const user = useUserStore();
function stop() {
  api.post(`/stop`, {
    guildId: user.selectedGuild,
    userId: user.id
  });
}
</script>

<style scoped></style>
