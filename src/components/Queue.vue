<template>
  <div class="queue w-full divide-y divide-solid divide-emerald-800">
    <QueueCard
      v-for="(song, i) in queue.songs"
      :key="i"
      :song="song"
      class="p-3 basis-1/4"
      :class="{ 'bg-yoduh-green-1': i == 0 }"
      @remove="remove(song, i)"
    />
  </div>
</template>

<script setup lang="ts">
import { useQueueStore } from '@/stores/queue';
import QueueCard from './QueueCard.vue';
const queue = useQueueStore();

function remove(song: Song, idx: number) {
  queue.removeSong(song, idx);
}
</script>

<style scoped></style>
