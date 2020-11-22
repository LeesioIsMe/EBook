<template>
  <div class="audit-history">
    <el-timeline>
      <el-timeline-item
        v-for="(history, index) in historyList"
        :key="index"
        :type="history.type"
        :timestamp="history.createTime"
      >
        {{ history.content }}
      </el-timeline-item>
    </el-timeline>
  </div>
</template>
<script>
export default {
  name: "BookDetail",
  props: {
    historyList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {};
  },
  methods: {},
  created() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
</style>