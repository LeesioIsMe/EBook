<template>
  <div class="audit-history">
    <el-timeline>
      <el-timeline-item
        v-for="(history, index) in historyList"
        :key="index"
        :type="history.status == 1 ? '' : history.status == 2 ? 'success' : 'danger'"
        :timestamp="history.createTime"
      >
        {{ history.findings }}
      </el-timeline-item>
    </el-timeline>
    <p v-if="!historyList || (historyList && historyList.length == 0)" style="color: 999;text-align: center;">暂无记录</p>
  </div>
</template>
<script>
export default {
  name: 'BookDetail',
  props: {
    historyList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
