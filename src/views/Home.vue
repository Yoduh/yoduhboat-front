<template>
  <div v-if="user.isLoading">Loading...</div>
  <div v-else-if="user.guildsWithBoat.length === 0">
    You have no Discord servers with YoduhBoat. Try inviting YoduhBoat to a
    server then refreshing this page
  </div>
  <div
    v-else-if="!user.botChannel && !user.voiceChannel"
    class="h-full flex items-center justify-center text-2xl"
  >
    Please join any voice channel to begin
  </div>
  <div
    v-else-if="user.botChannel && user.voiceChannel !== user.botChannel.id"
    class="h-full flex items-center justify-center text-2xl"
  >
    Please join YoduhBoat's voice channel:
    <span class="ml-3 text-lime-300 italic">{{ user.botChannel.name }}</span>
  </div>
  <div v-else class="home">
    <div class="container mx-auto">
      <Tabs @select="selectTab" />
      <Queue v-if="!isSearching" />
      <Search v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import Queue from '@/components/Queue.vue';
import Tabs from '@/components/Tabs.vue';
import Search from '../components/Search.vue';
import { useUserStore } from '@/stores/user';

const user = useUserStore();

const isSearching: Ref<boolean> = ref(false);
function selectTab(searching: boolean) {
  isSearching.value = searching;
}
</script>

<style scoped>
.home {
  flex: 1;
  overflow: auto;
}
</style>
