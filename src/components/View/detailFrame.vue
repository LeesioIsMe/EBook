<template>
  <div class="frame">
    <el-dialog
      title="阅读"
      :visible.sync="modal"
      :before-close="closeModal"
      :close-on-click-modal="false"
      fullscreen
    >
      <iframe
        v-if="frameShow"
        :src="'/pdf/web/viewer.html?file=' + encodeURIComponent(url)"
        :height="height"
        width="100%"
        frameborder="0"
      />
      <embed v-else :src="url" :height="height" width="100%">
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Frame',
  props: {
    modal: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      url: '',
      height: window.innerHeight - 125,
      frameShow: false
    }
  },
  watch: {
    'window.innerHeight'(newV) {
      this.height = newV > 300 ? newV - 125 : 300
    }
  },
  created() {
    var url =
      'http://123.56.103.203:12309/upload/files/1573961336456-administrator-1.pdf'
    if (url.substr(url.lastIndexOf('.') + 1) == 'pdf') {
      this.frameShow = true
    } else {
      this.frameShow = false
    }
    this.url = url
  },
  methods: {
    closeModal() {
      this.$emit('closeModal')
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .el-dialog__body {
  max-height: unset;
}
</style>
