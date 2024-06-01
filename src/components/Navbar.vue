<template>
  <div id="nav" class="navbar z-40">
    <div class="flex-1">
      <img :src="xwing" class="h-6 w-20" />
      <div class="font-bold normal-case text-3xl p-0 ml-3">YoduhBoat</div>
      <div class="italic ml-5">
        Things are in beta. Try refreshing and/or clearing queue if things
        break.
      </div>
    </div>
    <div class="flex-none">
      <div v-if="user.guildsWithBoat.length > 0" class="mr-10">
        <div class="dropdown dropdown-end">
          <button
            class="btn btn-outline border-slate-900 w-48 h-full flex justify-start pl-2 bg-base-300"
          >
            <div v-if="selectedGuild.image" class="avatar">
              <div class="w-10 rounded-full">
                <img :src="selectedGuild.image" />
              </div>
            </div>
            <div class="pl-2 pr-4">
              {{ selectedGuild.name ? selectedGuild.name : 'Select a Server' }}
            </div>
          </button>
          <ul
            tabindex="0"
            class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
          >
            <li
              v-for="(guild, i) in guildsWithBoat"
              :key="i"
              @click="selectGuild(guild)"
            >
              <a>
                <div class="avatar">
                  <div class="w-10 rounded-full">
                    <img :src="guild.image ?? defaultImage" />
                  </div>
                </div>
                <div class="pl-2 pr-4">{{ guild.name }}</div>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div v-else-if="user.id">
        Invite the music bot to your server to use this site
      </div>
      <div v-if="user.id !== ''" class="dropdown dropdown-end">
        <button class="btn gap-2 profile-btn bg-base-300">
          <div class="avatar">
            <div class="w-10 rounded-full">
              <img :src="avatar" />
            </div>
          </div>
          <div class="pl-2 pr-4">{{ user.global_name }}</div>
        </button>
        <ul
          tabindex="0"
          class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
        >
          <li @click="logout"><a>Logout</a></li>
        </ul>
      </div>
      <div v-else>
        <button class="btn btn-ghost normal-case" @click="login">Login</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import defaultImage from '@/assets/discord-logo.png';
import xwing from '@/assets/x-wing.svg';
import { useUserStore } from '@/stores/user';
import { useWebsocketStore } from '@/stores/websocket';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { usePlaylistStore } from '@/stores/playlist';

const user = useUserStore();
const socket = useWebsocketStore();
const playlists = usePlaylistStore();
const router = useRouter();

const avatar = computed(() => {
  if (user?.avatar === '' || user?.avatar?.includes('/null')) {
    return defaultImage;
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
});

function selectGuild(guild: Guild) {
  (document?.activeElement as HTMLElement).blur();
  if (guild.id !== selectedGuild.value.id) {
    socket.openWebsocket(guild.id);
  }
  selectedGuild.value = guild;
  localStorage.guild = JSON.stringify(selectedGuild.value);
  user.selectedGuild = guild.id;
}
function login(): void {
  user.isLoading = true;
  window.open(
    `https://discord.com/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${import.meta.env.VITE_CLIENT_ID}&` +
      `redirect_uri=${
        import.meta.env.VITE_DOMAIN
      }/auth/redirect&display=popup&` +
      `scope=identify%20guilds%20guilds.members.read%20messages.read`,
    `_self`
  );
}
function logout(): void {
  user.$reset();
  localStorage.clear();
  router.replace('/');
}

const guildsWithBoat = computed(() => {
  return user.guilds.filter(g => {
    return user.guildsWithBoat.includes(g.id);
  });
});
const selectedGuild: Ref<Guild | Record<string, never>> = ref(
  localStorage.guild && localStorage.guild !== undefined
    ? JSON.parse(localStorage.guild)
    : {}
);
watch(selectedGuild, newGuild => {
  playlists.getPlaylistsForGuild(newGuild.id);
});
</script>

<style scoped>
.navbar {
  background: rgb(32, 32, 32);
}
.profile-btn {
  border-width: 1px;
  border-radius: 30px;
  padding: 4px;
}
.dropdown-arrow {
  border: solid #8d819c;
  border-width: 0 2px 2px 0;
  height: 6px;
  width: 6px;
  display: inline-block;
  -moz-transform: rotate(45deg);
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  margin: 0 8px 0 12px;
  -webkit-transition: -webkit-transform 0.2s ease;
  transition: -webkit-transform 0.2s ease;
  -moz-transition: transform 0.2s ease, -moz-transform 0.2s ease;
  transition: transform 0.2s ease;
  transition: transform 0.2s ease, -webkit-transform 0.2s ease,
    -moz-transform 0.2s ease;
}
</style>
