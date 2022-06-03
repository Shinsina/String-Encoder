<template>
<div class="text-center pt-5">
  <label :for="labelName">{{ labelName }}: </label>
  <input :type="type" :id="labelName" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" class="bg-black border-white border-2">
</div>
</template>

<script>
import { Options, Vue } from 'vue-class-component'
@Options({
  props: {
    labelName: String,
    type: String,
    modelValue: String
  },
  emits: ['update:modelValue']
})
export default class InputField extends Vue {}
</script>
