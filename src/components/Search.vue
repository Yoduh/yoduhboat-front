<template>
  <div class="queue w-full divide-y divide-solid divide-emerald-800">
    <SearchCard
      v-for="result in store.searchList"
      :key="result.id"
      :result="result"
      class="p-3 basis-1/4"
    />
  </div>
</template>

<script setup lang="ts">
import SearchCard from '@/components/SearchCard.vue';
import { useSearchStore } from '@/stores/search';

const store = useSearchStore();
</script>

<style scoped></style>
