<template>
<div class="bg-black h-screen text-white">
  <div class="text-center bg-indigo-800 border-white border-2">
    <p class="block lg:text-7xl md:text-4xl sm-text-3xl break-words text-center">Ausick</p>
    <p class="block lg:text-4xl md:text-xl sm:text-lg break-words text-center">Celebrating the "sick" stuff from down under</p>
    <div class="block lg:text-3xl md:text-lg sm:text-md break-words text-center">
    <router-link to="/"> Home </router-link>
    <router-link to="/login">Login</router-link>
    <a v-on:click="this.$router.back"> Back </a>
    </div>
  </div>
  <router-view class="bg-black"/>
  </div>
</template>
