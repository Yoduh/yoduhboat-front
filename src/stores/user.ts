import { defineStore } from 'pinia';
import defaultImage from '../assets/discord-logo.png';
import { sortByKey } from '../helpers/util.js';
import axios from 'axios';

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    access_token: '',
    expires_in: 0,
    refresh_token: '',
    scope: '',
    token_type: '',
    id: '',
    username: '',
    avatar: '',
    guilds: [] as Guild[],
    guildsWithBloop: [] as Guild[]
  }),
  getters: {
    getUserGuildIds(state) {
      return state.guilds.map(g => g.id);
    }
  },
  actions: {
    setToken(token: Token) {
      // send token to backend to validate future requests
      localStorage.token = JSON.stringify(token);
      return axios
        .post(`${import.meta.env.VITE_API}/setToken`, token)
        .then(() => {
          this.access_token = token.access_token;
          this.expires_in = token.expires_in;
          this.refresh_token = token.refresh_token;
          this.scope = token.scope;
          this.token_type = token.token_type;
          this.getUserDetails();
        })
        .catch(e => {
          console.log('setToken error', e);
        });
    },
    getUserDetails() {
      // fetch the user data
      console.log('fetching user details');
      return axios
        .get('https://discordapp.com/api/users/@me', {
          headers: { Authorization: `Bearer ${this.access_token}` }
        })
        .then(res => {
          localStorage.id = res.data.id;
          this.id = res.data.id;
          this.username = res.data.username;
          this.avatar = res.data.avatar;
          // dispatch('guild/getSounds', null, { root: true });
          // get current song info / queue instead
        })
        .catch(e => {
          console.log('get user error', e);
        })
        .finally(() => {
          this.getUserGuilds();
        });
    },
    getUserGuilds() {
      return axios
        .get('https://discordapp.com/api/users/@me/guilds', {
          headers: { Authorization: `Bearer ${this.access_token}` }
        })
        .then(res => {
          const formattedGuilds = res.data.map((g: Guild) => {
            let link = defaultImage;
            if (g.icon) {
              link = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.jpg`;
            }
            return {
              ...g,
              image: link
            };
          });
          this.guilds = formattedGuilds;
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
              this.guildsWithBloop = res.data;
            })
            .catch(e => {
              console.log('get servers errors', e);
            });
        })
        .catch(e => {
          console.log('get guilds error', e);
        });
    },
    setUserGuildsWithBloop(guildIdsWithBloop: Array<string>) {
      const filteredGuilds = this.guilds.filter(g =>
        guildIdsWithBloop.includes(g.id)
      );
      const sortedGuilds = sortByKey(filteredGuilds, 'name');
      this.guildsWithBloop = sortedGuilds;
    }
  }
});
