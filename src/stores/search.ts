import { defineStore } from 'pinia';
import { api } from '@/plugins/api';

export const useSearchStore = defineStore({
  id: 'search',
  state: () => ({
    searchList: [] as YoutubeResult[],
    playlist: null as YoutubePlaylist | null,
    loading: false
  }),
  actions: {
    search(searchText: string) {
      this.loading = true;
      api.post('/search', { text: searchText }).then(res => {
        this.setSearchList(res.data);
      });
    },
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
      this.loading = false;
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
