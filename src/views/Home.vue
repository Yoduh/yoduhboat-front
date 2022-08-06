<template>
  <div v-if="!user.isLoading && user.guildsWithBoat.length > 0" class="home">
    <div class="container mx-auto">
      <Tabs @select="selectTab" />
      <Queue v-if="tab == 0" />
      <Search v-if="tab == 1" />
    </div>
  </div>
  <div v-else-if="!user.isLoading && user.id">
    You have no Discord servers with YoduhBoat. Try inviting YoduhBoat to a
    server then refreshing this page
  </div>
  <div v-else-if="user.isLoading">Loading...</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import Queue from '@/components/Queue.vue';
import Tabs from '@/components/Tabs.vue';
import Search from '../components/Search.vue';
import { useUserStore } from '@/stores/user';

const user = useUserStore();

const tab: Ref<number> = ref(0);
function selectTab(tabNum: number) {
  tab.value = tabNum;
}
</script>

<style scoped>
.home {
  flex: 1;
  overflow: auto;
}
</style>
