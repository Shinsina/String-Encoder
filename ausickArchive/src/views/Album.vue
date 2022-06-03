<template>
<div v-if="album" class="text-center">
  <div class="flex justify-center" v-on:click.prevent="goToAlbumPage(album.id)">
    <img :src="album.artworkUrl100" />
  </div>
  <p>{{album.collectionName}} ${{album.collectionPrice}}</p>
  <p>{{ album.releaseDate }}</p>
  <div class="flex justify-center" v-for="song in sortSongs(album.songs)" :key="song.id">
    {{song.trackNumber}}. {{song.trackName}}  {{trackLength(song.trackTimeMillis) }} ${{song.trackPrice}}
  </div>
  {{ album.copyright }}
  <div>
    <button v-on:click.prevent="purchase()">Buy</button>
  </div>
</div>
</template>

<script lang='ts'>
import { Options, Vue } from 'vue-class-component'
import axios from 'axios'
import _ from 'lodash'
const DataBaseConnection = 'http://localhost:3000/graphql'
const options = { headers: { 'Content-Type': 'application/json' } }
@Options({
  components: {
  },
  data () {
    return {
      album: {}
    }
  },
  created () {
    this.getRequest(this.$router.currentRoute.value.params.albumId)
    console.log(this.$router)
  },
  methods: {
    async getRequest (id: string) {
      try {
        console.log(id)
        const queryString = 'album(id:"' + id + '"){id,artistName,collectionName,artworkUrl100,collectionPrice,copyright,releaseDate,collectionExplicitness,songs{id,trackName,trackPrice,trackNumber,trackTimeMillis}}'
        const res = await axios.post(DataBaseConnection, { query: '{' + queryString + '}' }, options)
        this.album = res.data.data.album
        console.log(this.album)
      } catch (e) {
        console.log('err', e)
      }
    },
    trackLength (trackLength: number) {
      const minutes = Math.floor(trackLength / 60000)
      const seconds = Number(((trackLength % 60000) / 1000).toFixed(0))
      return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
    },
    sortSongs (songs: Array<Record<string, unknown>>) {
      return _.orderBy(songs, 'trackNumber', 'asc')
    },
    purchase () {
      alert('Thank you for your purchase!')
    }
  }
})
export default class Album extends Vue {}
</script>
