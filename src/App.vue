<template>
  <Navbar />
  <router-view></router-view>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
</script>

<style>
#app {
  height: 100vh;
}
</style>
