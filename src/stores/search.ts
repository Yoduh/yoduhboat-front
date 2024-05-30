import { defineStore } from 'pinia';

export const useSearchStore = defineStore({
  id: 'search',
  state: () => ({
    searchList: [] as YoutubeResult[],
    playlist: null as YoutubePlaylist | null
  }),
  actions: {
    setSearchList(result: YoutubeResult[] | YoutubePlaylist) {
      if ('count' in result) {
        this.playlist = { ...result, added: false, addedNext: false };
        this.searchList = [];
      } else {
        this.searchList = result.map(r => {
          return { ...r, added: false, addedNext: false };
        });
        this.playlist = null;
      }
    },
    resetAdditions() {
      this.searchList = this.searchList.map(r => {
        return { ...r, added: false, addedNext: false };
      });
      if (this.playlist) {
        this.playlist.added = false;
        this.playlist.addedNext = false;
      }
    },
    setAdded(item: YoutubeResult) {
      const result = this.searchList.find(i => i.id === item.id);
      if (result) {
        result.added = true;
      }
    },
    setAddedNext(item: YoutubeResult) {
      const result = this.searchList.find(i => i.id === item.id);
      if (result) {
        result.addedNext = true;
      }
    }
  }
});
