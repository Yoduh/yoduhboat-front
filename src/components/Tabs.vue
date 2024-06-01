<template>
  <div>
    <div class="tabs my-4 flex justify-content-start">
      <button
        role="tab"
        class="btn btn-ghost mx-3"
        :class="{ activeTab: activeTab === 'Queue' }"
        @click="clickTab('Queue')"
      >
        Queue
      </button>
      <button
        v-if="!isSearching"
        role="tab"
        class="btn btn-ghost mx-3"
        @click="clickTab('Search')"
      >
        Search
      </button>
      <div v-else class="flex items-center search-container" role="tab">
        <Youtube class="yt flex items-center" fill-color="#FF0000" />
        <input
          ref="searchInput"
          v-model="searchText"
          type="text"
          placeholder="Search YouTube"
          class="search w-full max-w-xs"
          @keyup="search"
        />
      </div>
      <button
        role="tab"
        :disabled="user.selectedGuild === ''"
        class="btn btn-ghost mx-3"
        :class="{ activeTab: activeTab === 'Playlists' }"
        @click="clickTab('Playlists')"
      >
        Playlists
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, computed } from 'vue';
import Youtube from 'vue-material-design-icons/Youtube.vue';
import { useSearchStore } from '@/stores/search';
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

const user = useUserStore();
const route = useRoute();
const router = useRouter();
const isSearching = ref(route.name === 'Search');
const searchText = ref('');
const searchStore = useSearchStore();

const activeTab = computed(() => route.name);
function clickTab(tab: string) {
  if (tab === 'Search') {
    isSearching.value = true;
    searchStore.resetAdditions();
  } else {
    isSearching.value = false;
  }
  router.push({ name: tab });
}
async function search(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    searchStore.search(searchText.value);
  }
}

const searchInput = ref();
watch(isSearching, newVal => {
  if (newVal) {
    nextTick(() => {
      searchInput.value.focus();
    });
  }
});
</script>

<style lang="scss" scoped>
.activeTab {
  background-color: green;
  color: #eee;
}
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
