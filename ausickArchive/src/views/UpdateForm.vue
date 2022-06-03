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
      uploaderType: null,
      formFields: null,
      formObject: {},
      modelPlaceholders: [],
      artistFields: {
        id: 'text',
        bio: 'text',
        photo: 'text',
        members: 'text'
      },
      albumFields: {
        id: 'text',
        collectionPrice: 'number'
      },
      songFields: {
        id: 'text',
        trackPrice: 'number'
      }
    }
  },
  created () {
    this.uploaderType = this.$router.currentRoute.value.params.type
    if (this.uploaderType === 'artist') {
      this.formFields = this.artistFields
    } else if (this.uploaderType === 'album') {
      this.formFields = this.albumFields
    } else if (this.uploaderType === 'song') {
      this.formFields = this.songFields
    } else {
      this.formFields = null
    }
  },
  methods: {
    submitForm () {
      if (this.formFields === this.artistFields) {
        this.formObject = {
          id: this.$refs.id.modelValue,
          bio: this.$refs.bio.modelValue,
          photo: this.$refs.photo.modelValue,
          members: this.$refs.members.modelValue
        }
        this.updateArtist(this.formObject)
      } else if (this.formFields === this.albumFields) {
        this.formObject = {
          id: this.$refs.id.modelValue,
          collectionPrice: this.$refs.collectionPrice.modelValue
        }
        this.updateAlbum(this.formObject)
      } else {
        this.formObject = {
          id: this.$refs.id.modelValue,
          trackPrice: this.$refs.trackPrice.modelValue
        }
        this.updateSong(this.formObject)
      }
    },
    async updateArtist (artist: Record <string, unknown>) {
      try {
        console.log(artist)
        const res = await axios.post(DataBaseConnection, { query: `mutation { updateArtist(id: "${artist.id}" bio: " ${artist.bio}" photo: "${artist.photo}" members: "${artist.members}"){id bio photo members} }` }, options)
        console.log(res.data)
      } catch (e) {
        console.log('err', e)
      }
    },
    async updateAlbum (album: Record <string, unknown>) {
      try {
        const res = await axios.post(DataBaseConnection, { query: `mutation { updateAlbum(id: "${album.id}" collectionPrice: ${album.collectionPrice} ){id collectionPrice} }` }, options)
        console.log(res.data)
      } catch (e) {
        console.log('err', e)
      }
    },
    async updateSong (song: Record <string, unknown>) {
      try {
        const res = await axios.post(DataBaseConnection, { query: `mutation { updateSong(id: "${song.id}" trackPrice: ${song.trackPrice} ){id trackPrice} }` }, options)
        console.log(res.data)
      } catch (e) {
        console.log('err', e)
      }
    }
  }
})
export default class UpdateForm extends Vue {}
</script>
