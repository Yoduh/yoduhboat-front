<template>
  <div>
    <div class="container mx-auto pt-10">
      <div class="grid grid-rows-4">
        <div class="queue-header">
          <button class="btn btn-outline btn-secondary mx-3">
            Queue
          </button>
          <button class="btn btn-ghost mx-3">
            Search
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isActive = ref(true);
</script>

<style scoped>

</style>