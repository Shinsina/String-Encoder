<template>
    <div class="flex">
    <div v-for="artist in artistArray" :key="artist.id" class="flex-col w-1/4 text-center">
      <div class="flex-auto border-white border-2 border-t-0">
      <div v-on:click.prevent="goToArtistPage(artist.id)" class="block lg:text-xl md:text-xs sm:text-xs break-words text-center">
        {{ artist.artistName }}
        <div class="flex justify-center">
        <img :src="artist.photo" width="380" height="380"/>
        </div>
        Founded {{ artist.founded }} in {{ artist.hometown }}
      </div>
      </div>
    </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import axios from 'axios'
const DataBaseConnection = 'http://localhost:3000/graphql'
const options = { headers: { 'Content-Type': 'application/json' } }
@Options({
  components: {
  },
  data () {
    return {
      artistArray: []
    }
  },
  created () {
    this.getRequest()
  },
  methods: {
    async getRequest () {
      try {
        const res = await axios.post(DataBaseConnection, { query: '{ artists{ id, artistId, artistName, photo, founded, hometown } }' }, options)
        console.log(this.artistArray)
        res.data.data.artists.forEach((artist: Record<string, unknown>) => {
          this.artistArray = [...this.artistArray, artist]
        })
        console.log(this.artistArray)
      } catch (e) {
        console.log('err', e)
      }
    },
    goToArtistPage (artistId: string) {
      this.$router.push(`/artist/${artistId}`)
    }
  }
})
export default class Home extends Vue {}
</script>
