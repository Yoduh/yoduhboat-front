<template>
  <div v-if="!user || !user.id"></div>
  <div v-else-if="user.isLoading">Loading...</div>
  <div v-else-if="user.guildsWithBoat.length === 0">
    You have no Discord servers with YoduhBoat. Try inviting YoduhBoat to a
    server then refreshing this page
  </div>
  <div
    v-else-if="!user.selectedGuild || user.selectedGuild === ''"
    class="h-full flex items-center justify-center text-2xl"
  >
    Select a server up top
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
    <div class="mx-3 sm:mx-10 md:mx-24 lg:mx-64 xl:mx-96 xl:mx-100">
      <Tabs />
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import Tabs from '@/components/Tabs.vue';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
</script>

<style scoped>
.home {
  flex: 1;
  overflow: auto;
}

@media (min-width: 1536px) {
  .xl\:mx-100 {
    margin-left: 34rem;
    margin-right: 34rem;
  }
}
</style>
