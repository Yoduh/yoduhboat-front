<template>
  <div class="navbar bg-base-100">
    <div class="flex-1">
      <img
        :src="xwing" 
        class="h-6 w-20"
      >
      <a class="btn btn-ghost normal-case text-xl p-0">YoduhBoat</a>
    </div>
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <button class="btn gap-2 profile-btn">
          <div class="avatar">
            <div class="w-10 rounded-full">
              <img src="https://cdn.discordapp.com/avatars/200809303907631104/6aa5a9086caef0080e8071e5e688c749.png">
            </div>
          </div>
          <div class="pl-2 pr-4">
            Yoduh
          </div>
        </button>
        <ul
          tabindex="0"
          class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
        >
          <li><a>Logout</a></li>
          <li><a>My Servers</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import xwing from "@/assets/x-wing.svg";
</script>

<style scoped>
.profile-btn {
  border-width: 1px;
  border-radius: 30px;
  padding: 4px;
}
.dropdown-arrow {
  border: solid #8d819c;
    border-width: 0 2px 2px 0;
    height: 6px;
    width: 6px;
    display: inline-block;
    -moz-transform: rotate(45deg);
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    margin: 0 8px 0 12px;
    -webkit-transition: -webkit-transform .2s ease;
    transition: -webkit-transform .2s ease;
    -moz-transition: transform .2s ease,-moz-transform .2s ease;
    transition: transform .2s ease;
    transition: transform .2s ease,-webkit-transform .2s ease,-moz-transform .2s ease;
}
</style>