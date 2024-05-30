import { defineStore } from 'pinia';
import { api } from '@/plugins/api';
import { useUserStore } from '@/stores/user';

export const usePlaylistStore = defineStore({
  id: 'playlist',
  state: () => ({
    playlists: [] as Playlist[],
    activePlaylist: null as Playlist | null
  }),
  actions: {
    setPlaylists(lists: Playlist[]) {
      this.playlists = lists;
    },
    getPlaylistsForGuild(id: string) {
      api
        .get(`${import.meta.env.VITE_API}/playlists`, {
          params: {
            guildId: id
          }
        })
        .then(res => {
          this.playlists = res.data;
          if (this.activePlaylist) {
            this.getSongsForPlaylist(this.activePlaylist.id);
          }
        })
        .catch(e => {
          console.error(e);
        });
    },
    getSongsForPlaylist(id: string) {
      api
        .get(`${import.meta.env.VITE_API}/playlist`, {
          params: {
            playlistId: id
          }
        })
        .then(res => {
          const playlist = this.playlists.find(p => p.id === id);
          if (playlist) {
            playlist.songs = res.data.songs;
          }
        })
        .catch(e => {
          console.error(e);
        });
    },
    addSongToPlaylist(playlistName: string, songOrPlaylistUrl: string) {
      const user = useUserStore();
      api
        .post(`${import.meta.env.VITE_API}/playlist/addsong`, {
          guildId: user.selectedGuild,
          userId: user.id,
          playlistName: playlistName,
          songUrl: songOrPlaylistUrl
        })
        .catch(e => {
          console.error(e);
        });
    }
  }
});
