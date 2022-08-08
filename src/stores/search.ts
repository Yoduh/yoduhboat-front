import { defineStore } from 'pinia';

export const useSearchStore = defineStore({
  id: 'search',
  state: () => ({
    searchList: [] as YoutubeResult[]
  }),
  actions: {
    setSearchList(list: YoutubeResult[]) {
      this.searchList = list.map(r => {
        return { ...r, added: false };
      });
    },
    resetAdditions() {
      this.searchList = this.searchList.map(r => {
        return { ...r, added: false };
      });
    },
    setAdded(item: YoutubeResult) {
      const result = this.searchList.find(i => i.id === item.id);
      if (result) {
        result.added = true;
      }
    }
  }
});
