<template>
  <div class="openform">
    <a class="openforms-embed" :href="formLink">Click here to view form.</a>
  </div>
</template>

<script>
// This component need to be used as `client-only` mode.
// Otherwise will got Nuxt error for not match server side rendering.
import openformLoader from './openform-loader'
export default {
  name: 'Openform',
  props: {
    formId: { default: null, type: String }
  },
  head () {
    return {
      script: [
        { src: '/js/embed-iframe.js', defer: true, body: true }
      ]
    }
  },
  computed: {
    formLink: function () {
      return 'https://au.openforms.com/Form/' + this.formId
    }
  },
  mounted: function () {
    // Call the form loader only after this client side component mounted.
    openformLoader()
  }
}
</script>

<style lang="css">
.openform {
}
</style>