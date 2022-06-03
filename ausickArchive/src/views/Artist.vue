<template>
  <div class="artist">
    <div v-if="artist" class="w-full flex border-white border-2 border-t-0 pt-5">
     <div class="flex-col w-1/4 text-center  text-xl">
        <p>{{ artist.artistName }}</p>
        <div class="flex justify-center">
        <img :src="artist.photo" width="380" height="380"/>
        </div>
        <p>Founded {{ artist.founded }} in {{ artist.hometown }}</p>
         <p class="text-base pt-5">{{ artist.bio }}</p>
      </div>
      <div class="flex flex-wrap w-full">
        <div v-for="album in sortAlbums(artist.albums)" :key="album.id" class="w-1/4 text-center">
          <div class="flex justify-center" v-on:click.prevent="goToAlbumPage(album.id)">
          <img :src="album.artworkUrl100" />
          </div>
          <p>{{album.collectionName}}</p>
          <p class="pb-5">{{ album.copyright }}</p>
          <div class="flex justify-center" v-for="song in sortSongs(album.songs)" :key="song.id">
            {{song.trackNumber}}. {{song.trackName}}
          </div>
          </div>
      </div>
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
      artist: {}
    }
  },
  created () {
    this.getRequest(this.$router.currentRoute.value.params.artistId)
  },
  methods: {
    async getRequest (id: string) {
      try {
        const queryString = 'artist(id:"' + id + '"){id,artistId,artistName,bio,photo,founded,hometown,albums {id,collectionId,collectionName,collectionCensoredName,artworkUrl100,collectionPrice,collectionExplicitness,trackCount,copyright,releaseDate,primaryGenreName, songs {id,trackId,trackName,trackCensoredName,trackPrice,trackExplicitness,discCount,discNumber,trackNumber,trackTimeMillis}}}'
        const res = await axios.post(DataBaseConnection, { query: '{' + queryString + '}' }, options)
        this.artist = res.data.data.artist
        console.log(this.artist)
      } catch (e) {
        console.log('err', e)
      }
    },
    goToAlbumPage (albumId: string) {
      this.$router.push(`/album/${albumId}`)
    },
    sortSongs (songs: Array<Record<string, unknown>>) {
      return _.orderBy(songs, 'trackNumber', 'asc')
    },
    sortAlbums (albums: Array<Record<string, unknown>>) {
      return _.orderBy(albums, 'releaseDate', 'desc')
    }
  }
})
export default class Artist extends Vue {}
</script>
