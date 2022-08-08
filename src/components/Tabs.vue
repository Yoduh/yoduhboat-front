<template>
  <div>
    <div class="tabs my-4">
      <button
        class="btn btn-outline btn-secondary mx-3"
        @click="activateSearch(false)"
      >
        Queue
      </button>
      <button
        v-if="!isSearching"
        class="btn btn-ghost mx-3"
        @click="activateSearch(true)"
      >
        Search
      </button>
      <div v-else class="flex items-center search-container">
        <Youtube class="yt flex items-center" fill-color="#FF0000" />
        <input
          v-model="searchText"
          type="text"
          placeholder="Search here"
          class="search w-full max-w-xs"
          @keyup="search"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Youtube from 'vue-material-design-icons/Youtube.vue';
import { api } from '@/plugins/api';
import { useSearchStore } from '@/stores/search';

const isSearching = ref(false);
const searchText = ref('');
const emit = defineEmits(['select']);
const searchStore = useSearchStore();

function activateSearch(tab: boolean) {
  isSearching.value = tab;
  if (tab) {
    searchStore.resetAdditions();
  }
  emit('select', isSearching.value);
}
async function search(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    api.post('/search', { text: searchText.value }).then(res => {
      searchStore.setSearchList(res.data);
    });
  }
}
</script>

<style lang="scss" scoped>
.yt {
  height: 3rem;
  padding-left: 1rem;
  padding-right: 1rem;
  line-height: 1.25rem;
  line-height: 2;
  border-width: 2px;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  border-radius: 0.5rem 0 0 0.5rem;
  border-color: rgb(128 128 169);
}
.search {
  flex-shrink: 1;
  height: 3rem;
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  line-height: 2;
  --tw-border-opacity: 0;
  --tw-bg-opacity: 1;
  background-color: hsl(var(--b1) / var(--tw-bg-opacity));
  border-radius: 0 0.5rem 0.5rem 0;
  border: solid rgb(128 128 169) 2px;
  border-left: none;
  &:focus {
    outline-width: 0;
  }
}
</style>
