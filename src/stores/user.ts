import { defineStore } from 'pinia';
// import { sortByKey } from '../helpers/util.js';
import axios from 'axios';
import { usePlaylistStore } from '@/stores/playlist';
import { api } from '@/plugins/api';

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    voiceChannel: '',
    botChannel: {} as { id: string; name: string },
    isLoading: false,
    access_token: '',
    expires_in: 0,
    refresh_token: '',
    scope: '',
    token_type: '',
    id: '',
    username: '',
    avatar: '',
    guilds: [] as Guild[],
    guildsWithBoat: [] as string[],
    selectedGuild: ''
  }),
  getters: {
    getUserGuildIds(state) {
      return state.guilds.map(g => g.id);
    },
    validVoiceState(state) {
      return (
        state.voiceChannel &&
        (!state.botChannel || state.voiceChannel === state.botChannel.id)
      );
    },
    selectedGuildName(state): string {
      if (this.selectedGuild) {
        const guild = state.guilds.find(g => g.id === this.selectedGuild);
        if (guild) return guild.name;
        else return '';
      } else {
        return '';
      }
    }
  },
  actions: {
    setToken(token: Token) {
      // send token to backend to validate future requests
      localStorage.token = JSON.stringify(token);
      return axios
        .post(`${import.meta.env.VITE_API}/setToken`, token)
        .then(dbUser => {
          this.access_token = token.access_token;
          this.expires_in = token.expires_in;
          this.refresh_token = token.refresh_token;
          this.scope = token.scope;
          this.token_type = token.token_type;
          // this.getUserDetails();

          localStorage.id = dbUser.data.userId;
          this.id = dbUser.data.userId;
          this.username = dbUser.data.username;
          this.avatar = dbUser.data.avatar;
          this.guilds = dbUser.data.guilds;
          this.setUserGuilds();

          this.setInterceptor();
        })
        .catch(e => {
          console.log('setToken error', e);
          this.isLoading = false;
        });
    },
    setUserGuilds() {
      axios
        .post(
          `${import.meta.env.VITE_API}/servers`,
          {
            guilds: this.guilds.map(g => g.id)
          },
          {
            headers: {
              Authorization: JSON.stringify({
                id: this.id,
                access_token: this.access_token
              })
            }
          }
        )
        .then(res => {
          this.guildsWithBoat = res.data;
          if (this.selectedGuild) {
            const playlists = usePlaylistStore();
            playlists.getPlaylistsForGuild(this.selectedGuild);
          }
        })
        .catch(e => {
          console.log('get servers errors', e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    setInterceptor() {
      api.interceptors.request.use(
        config => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          config.headers!.Authorization = JSON.stringify({
            id: this.id,
            access_token: this.access_token
          });
          return config;
        },
        error => {
          return Promise.reject(error);
        }
      );
    }

    // setUserGuildsWithBoat(guildIdsWithBoat: Array<string>) {
    //   const filteredGuilds = this.guilds.filter(g =>
    //     guildIdsWithBoat.includes(g.id)
    //   );
    //   const sortedGuilds = sortByKey(filteredGuilds, 'name');
    //   this.guildsWithBoat = sortedGuilds;
    // }
  }
});
