<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
.el-dialog__header {
  border-bottom: 1px solid #ccc;
}
.el-dialog__body {
  max-height: 65vh;
  overflow: auto;
}
</style>
