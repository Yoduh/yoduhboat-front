<template>
  <Navbar />
  <router-view></router-view>
  <Player v-if="!user.isLoading && user.guildsWithBoat.length > 0" />
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import { onMounted } from 'vue';
import Player from '@/components/Player.vue';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
onMounted(async () => {
  if (user.id === '' && localStorage.token) {
    user.isLoading = true;
    user.setToken(JSON.parse(localStorage.token));
    if (localStorage.guild) {
      user.selectedGuild = JSON.parse(localStorage.guild).id;
    }
  }
});
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
}
html,
body {
  height: 100vh;
  max-height: 100vh;
}
</style>
