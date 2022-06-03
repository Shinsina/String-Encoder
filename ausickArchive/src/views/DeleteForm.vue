<template>
<div class="text-center">
<div v-if="formFields">
  <div v-for="(field, key) in formFields" :key="key">
    <InputField :labelName="key" :type="field" :ref="key" v-model="this.modelPlaceholders[key]"/>
  </div>
  <button v-on:click.prevent="submitForm()">Submit</button>
</div>
</div>
</template>

<script lang='ts'>
import { Options, Vue } from 'vue-class-component'
import axios from 'axios'
import InputField from '../components/InputField.vue'
const DataBaseConnection = 'http://localhost:3000/graphql'
const options = { headers: { 'Content-Type': 'application/json' } }
@Options({
  components: {
    InputField
  },
  data () {
    return {
      formFields: {
        id: 'text',
        type: 'text'
      },
      formObject: {},
      modelPlaceholders: [],
      artist: null,
      album: null,
      song: null
    }
  },
  methods: {
    submitForm () {
      // console.log(String(this.$refs.type.modelValue).toUpperCase() === 'ARTIST')
      if (String(this.$refs.type.modelValue).toUpperCase() === 'ARTIST') {
        this.getArtist(this.$refs.id.modelValue)
      } else if (String(this.$refs.type.modelValue).toUpperCase() === 'ALBUM') {
        this.getAlbum(this.$refs.id.modelValue)
      } else if (String(this.$refs.type.modelValue).toUpperCase() === 'SONG') {
        this.getSong(this.$refs.id.modelValue)
      } else {
        alert('Invalid query type (Valid types are Artist, Album or Song)')
      }
    },
    async getArtist (id: string) {
      try {
        const queryString = 'artist(id:"' + id + '"){id,artistId,artistName,bio,photo,founded,hometown,albums {id,collectionId,collectionName,collectionCensoredName,artworkUrl100,collectionPrice,collectionExplicitness,trackCount,copyright,releaseDate,primaryGenreName, songs {id,trackId,trackName,trackCensoredName,trackPrice,trackExplicitness,discCount,discNumber,trackNumber,trackTimeMillis}}}'
        const res = await axios.post(DataBaseConnection, { query: '{' + queryString + '}' }, options)
        this.artist = res.data.data.artist
        console.log(this.artist)
        if (this.artist) {
          this.deleteArtist(this.artist)
        }
      } catch (e) {
        console.log('err', e)
      }
    },
    async getAlbum (id: string) {
      try {
        const queryString = 'album(id:"' + id + '"){id,artistName,collectionId,collectionName,artworkUrl100,collectionPrice,copyright,releaseDate,collectionExplicitness,songs{id,trackName,trackPrice,trackNumber,trackTimeMillis}}'
        const res = await axios.post(DataBaseConnection, { query: '{' + queryString + '}' }, options)
        this.album = res.data.data.album
        console.log(this.album)
        if (this.album) {
          this.deleteAlbum(this.album)
        }
      } catch (e) {
        console.log('err', e)
      }
    },
    async getSong (id: string) {
      try {
        const queryString = 'song(id:"' + id + '"){id}'
        const res = await axios.post(DataBaseConnection, { query: '{' + queryString + '}' }, options)
        this.song = res.data.data.song
        console.log(this.song)
        if (this.song) {
          this.deleteSong(this.song)
        }
      } catch (e) {
        console.log('err', e)
      }
    },
    async deleteArtist (artist: Record <string, unknown>) {
      const artistAlbums = artist.albums as Array<Record <string, unknown>>
      artistAlbums.forEach((album: Record <string, unknown>) => {
        this.deleteAlbumSongs(album)
      })
      this.deleteArtistAlbums(artist)
      this.deleteArtistSongs(artist)
      try {
        const queryString = 'deleteArtist(id:"' + artist.id + '"){id}'
        const res = await axios.post(DataBaseConnection, { query: 'mutation {' + queryString + '}' }, options)
        console.log(res)
      } catch (e) {
        console.log('err', e)
      }
      // console.log(artist)
    },
    async deleteArtistAlbums (artist: Record <string, unknown>) {
      try {
        const queryString = 'deleteAlbums(artistId:' + artist.artistId + '){artistId}'
        const res = await axios.post(DataBaseConnection, { query: 'mutation {' + queryString + '}' }, options)
        console.log(res)
      } catch (e) {
        console.log('err', e)
      }
    },
    async deleteArtistSongs (artist: Record <string, unknown>) {
      try {
        const queryString = 'deleteSongs(artistId: ' + artist.artistId + '){artistId}'
        const res = await axios.post(DataBaseConnection, { query: 'mutation {' + queryString + '}' }, options)
        console.log(res)
      } catch (e) {
        console.log('err', e)
      }
    },
    async deleteAlbumSongs (album: Record <string, unknown>) {
      try {
        const queryString = 'deleteSongsOnAlbum(collectionId:' + album.collectionId + '){collectionId}'
        const res = await axios.post(DataBaseConnection, { query: 'mutation {' + queryString + '}' }, options)
        console.log(res)
      } catch (e) {
        console.log('err', e)
      }
    },
    async deleteAlbum (album: Record <string, unknown>) {
      this.deleteAlbumSongs(album)
      try {
        const queryString = 'deleteAlbum(id:"' + album.id + '"){id}'
        const res = await axios.post(DataBaseConnection, { query: 'mutation {' + queryString + '}' }, options)
        console.log(res)
      } catch (e) {
        console.log('err', e)
      }
    },
    async deleteSong (song: Record <string, unknown>) {
      try {
        const queryString = 'deleteSong(id:"' + song.id + '"){id}'
        const res = await axios.post(DataBaseConnection, { query: 'mutation {' + queryString + '}' }, options)
        console.log(res)
      } catch (e) {
        console.log('err', e)
      }
    }
  }
})
export default class DeleteForm extends Vue {}
</script>
