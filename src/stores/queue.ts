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
      if (this.songs.length === 0) {
        this.playTime = 0;
      }
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
      api.post('/addSong', {
        user: user.id,
        guild: user.selectedGuild,
        url: url
      });
    },
    togglePause(sliderValue: number) {
      this.isPaused = !this.isPaused;
      const user = useUserStore();
      console.log('calling pause', sliderValue);
      api.post(`/pause`, {
        guild: user.selectedGuild,
        seekTime: sliderValue
      });
    },
    seek(seekTime: number) {
      console.log('queue.seek');
      const user = useUserStore();
      api.post(`/seek`, {
        guild: user.selectedGuild,
        seekTime: seekTime
      });
    },
    shuffle() {
      const user = useUserStore();
      api.post(`/shuffle`, {
        guild: user.selectedGuild
      });
    },
    doneSong(song: Song) {
      console.log('done song!');
      if (this.songs[0] && this.songs[0]._id === song._id) {
        this.songs.shift();
      }
      if (this.songs.length === 0) {
        this.$reset();
      }
    },
    setPlayTime(newTime: number, fromHeartBeat: boolean) {
      console.log('queue.setPlayTime()');
      this.fromHeartBeat = fromHeartBeat;
      if (!this.ignoreSync) this.playTime = newTime;
      else console.log('received sync, but currently ignoring...');
    }
  }
});
