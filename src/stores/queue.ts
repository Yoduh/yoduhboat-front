import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { api } from '@/plugins/api';

export const useQueueStore = defineStore({
  id: 'queue',
  state: () => ({
    songs: [] as Queue,
    isPlaying: false,
    isPaused: false,
    playTime: 0,
    fromHeartBeat: false,
    ignoreSync: false
  }),
  getters: {
    getQueueSongTitle: state => {
      return (songId: string) => {
        const song: Song | undefined = state.songs.find(s => s._id === songId);
        if (song) {
          return song.artist
            ? `${song.artist} - ${song.title}`
            : `${song.title}`;
        }
        return undefined;
      };
    }
  },
  actions: {
    setQueue(newQueue: Queue) {
      this.songs = newQueue;
    },
    removeSong(song: Song, index: number) {
      this.songs.splice(index, 1);
      if (index === 0) this.playTime = 0;
      const user = useUserStore();
      // backend queue removal uses 1-based indexing instead of zero (for REASONS)
      index++;
      this.ignoreSync = true;
      api
        .post(`/remove`, {
          guild: user.selectedGuild,
          songId: song._id
        })
        .finally(() => (this.ignoreSync = false));
    },
    addSong(url: string) {
      const user = useUserStore();
      api
        .post('/addSong', {
          user: user.id,
          guild: user.selectedGuild,
          url: url
        })
        .then(res => {
          this.songs.push(res.data.song);
        });
    },
    togglePause() {
      this.isPaused = !this.isPaused;
      const user = useUserStore();
      console.log('calling pause');
      api.post(`/pause`, {
        guild: user.selectedGuild
      });
    },
    seek(seekTime: number) {
      console.log('queue.seek');
      const user = useUserStore();
      // ignore any incoming (stale) sync attempts until player is completely done with the seek operation
      this.ignoreSync = true;
      api
        .post(`/seek`, {
          guild: user.selectedGuild,
          seekTime: seekTime
        })
        .finally(() => (this.ignoreSync = false));
    },
    doneSong(song: Song) {
      console.log('done song!');
      if (this.songs[0] && this.songs[0]._id === song._id) {
        this.songs.shift();
      }
      if (this.songs.length === 0) {
        this.isPlaying = false;
      }
    },
    setPlayTime(newTime: number, fromHeartBeat: boolean) {
      this.fromHeartBeat = fromHeartBeat;
      if (!this.ignoreSync) this.playTime = newTime;
      else console.log('received sync, but currently ignoring...');
    }
  }
});
