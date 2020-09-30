<template>
  <component :is="type" v-bind="linkProps(to, menuId)">
    <slot />
  </component>
</template>

<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    },
    menuId: Number
  },
  computed: {
    isExternal() {
      return isExternal(this.to)
    },
    type() {
      if (this.isExternal) {
        return 'a'
      }
      return 'router-link'
    }
  },
  methods: {
    linkProps(to, menu_Id) {
      if (this.isExternal) {
        return {
          href: to,
          target: '_blank',
          rel: 'noopener'
        }
      }
      if (to.indexOf('/test/test') !== -1) {
        console.log(to)
        return { to: { path: to + '/', query: { id: menu_Id }}}
        // this.$route.params.menuId = menu_Id
      }
      return {
        to: to
      }
    }
  }
}
</script>
