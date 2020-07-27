<template>
  <div class="openform">
    <a class="openforms-embed" :href="formLink">Click here to view form.</a>
  </div>
</template>

<script>
// This component need to be used as `client-only` mode.
// Otherwise will got Nuxt error for not match server side rendering.

export default {
  name: 'Openform',
  props: {
    formId: { default: null, type: String }
  },
  computed: {
    formLink: function () {
      return 'https://au.openforms.com/Form/' + this.formId
    }
  },
  mounted: function () {
    let openFormsEmbedScript = document.createElement('script')
     openFormsEmbedScript.setAttribute('src', 'https://au.openforms.com/Scripts/embed-iframe.js?immediate=true')
     document.head.appendChild(openFormsEmbedScript)
  }
}
</script>

<style lang="css">
.openform {
}
</style>
