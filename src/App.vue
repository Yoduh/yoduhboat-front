<template>
  <Navbar id="mynavbar" class="mynavbarclass" />
  <router-view></router-view>
  <Player
    v-if="
      !user.isLoading && user.guildsWithBoat.length > 0 && user.selectedGuild
    "
  />
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import { onMounted } from 'vue';
import Player from '@/components/Player.vue';
import { useUserStore } from '@/stores/user';
import { useWebsocketStore } from '@/stores/websocket';

const user = useUserStore();
const ws = useWebsocketStore();
onMounted(async () => {
  if (user.id === '' && localStorage.token) {
    user.isLoading = true;
    user.setToken(JSON.parse(localStorage.token));
    if (localStorage.guild) {
      const guildId = JSON.parse(localStorage.guild).id;
      user.selectedGuild = guildId;
      ws.openWebsocket(guildId);
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
  width: 100vw;
}
html,
body {
  height: 100vh;
  max-height: 100vh;
}
</style>
