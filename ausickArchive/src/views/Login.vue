<template>
<div v-if="validated" class="text-center flex justify-center">
  <div class="pr-10">
  <button v-on:click="this.upload = !this.upload">Upload</button>
  <div v-if="upload">
    <div><button v-on:click.prevent="goToUploadPage('artist')">Artist</button></div>
    <div><button v-on:click.prevent="goToUploadPage('album')">Album</button></div>
    <div><button v-on:click.prevent="goToUploadPage('song')">Song</button></div>
  </div>
  </div>
  <div>
  <button  v-on:click="this.update = !this.update">Update</button>
  <div v-if="update">
    <div><button v-on:click.prevent="goToUpdatePage('artist')">Artist</button></div>
    <div><button v-on:click.prevent="goToUpdatePage('album')">Album</button></div>
    <div><button  v-on:click.prevent="goToUpdatePage('song')">Song</button></div>
  </div>
  </div>
  <div class="pl-10">
  <button  v-on:click.prevent="goToDeletePage()">Delete</button>
  </div>
</div>
<div v-else>
<div class="text-center">
<div v-if="formFields">
  <div v-for="(field, key) in formFields" :key="key">
    <InputField :labelName="key" :type="field" :ref="key" v-model="this.modelPlaceholders[key]"/>
  </div>
  <button v-on:click.prevent="submitForm()">Submit</button>
</div>
</div>
</div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import InputField from '../components/InputField.vue'
@Options({
  components: {
    InputField
  },
  data () {
    return {
      formFields: {
        id: 'text'
      },
      modelPlaceholders: [],
      validated: false,
      upload: false,
      update: false
    }
  },
  methods: {
    submitForm () {
      if (this.$refs.id.modelValue === 'Shinsina') {
        this.validated = true
      }
    },
    goToDeletePage () {
      this.$router.push('/delete')
    },
    goToUploadPage (type: string) {
      this.$router.push(`/upload/${type}`)
    },
    goToUpdatePage (type: string) {
      this.$router.push(`/update/${type}`)
    }
  }
})
export default class Login extends Vue {}
</script>
