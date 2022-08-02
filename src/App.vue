<template>
  <Navbar />
  <Queue />
  <Footer />
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import Queue from '@/components/Queue.vue';
import Footer from '@/components/Footer.vue';
</script>

<style>
#app {
  height: 100vh;
}
</style>
