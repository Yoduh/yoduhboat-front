import { defineStore } from 'pinia';
import { api } from '@/plugins/api';
import { useUserStore } from '@/stores/user';

export const usePlaylistStore = defineStore({
  id: 'playlist',
  state: () => ({
    playlists: [] as Playlist[],
    activePlaylist: null as Playlist | null
  }),
  getters: {
    unsaved() {
      if (this.activePlaylist && this.activePlaylist.songs) {
        const activeSongs: Array<string> = this.activePlaylist.songs.map(
          s => s._id
        );
        const playlist = this.playlists.find(
          p => p.id === this.activePlaylist?.id
        );
        if (playlist && playlist.songs) {
          const playlistSongs: Array<string> = playlist.songs?.map(s => s._id);
          return !playlistSongs.every((s, index) => activeSongs[index] === s);
        }
      }
      return false;
    }
  },
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
          if (this.activePlaylist) {
            this.activePlaylist.songs = res.data.songs;
            const playlist = this.playlists.find(
              p => p.id === this.activePlaylist?.id
            );
            if (playlist) {
              playlist.songs = res.data.songs;
            }
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
    },
    resetActivePlaylistOrder() {
      const playlist = this.playlists.find(
        p => p.id === this.activePlaylist?.id
      );
      if (playlist) {
        this.activePlaylist = JSON.parse(JSON.stringify(playlist));
      }
    },
    setNewOrder() {
      if (this.activePlaylist) {
        const songs = this.activePlaylist.songs?.map((s, idx) => {
          return { id: s._id, order: idx + 1 };
        });
        if (songs) {
          const user = useUserStore();
          api.post('/playlist/reorder', {
            guildId: user.selectedGuild,
            songs: songs
          });
        }
      }
    }
  }
});
