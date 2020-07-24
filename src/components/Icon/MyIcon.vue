<template>
  <my-icon type="icon-example" />
</template>

<script>
    import * as Icon from 'ant-design-vue'

    const MyIcon = Icon.createFromIconfontCN({
      scriptUrl: 'at.alicdn.com/t/font_1965749_3d68vpsuehl.js'
    })
    export default {
        name: 'MyIcon'
    }
</script>

<style scoped>

</style>