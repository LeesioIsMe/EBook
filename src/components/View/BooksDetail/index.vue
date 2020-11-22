<template>
  <div class="wrapper">
    <div class="book-detail">
      <div class="logo">
        <img :src="bookData.poster" alt="预览图" />
      </div>
      <div class="info">
        <p><label>书名</label>{{ bookData.bookName }}</p>
        <p><label>作者 </label>{{ bookData.author }}</p>
        <p><label>出版社</label>{{ bookData.publishOrgName }}</p>
        <p><label>出版年份</label>{{ bookData.year }}</p>
        <p><label>图书分类</label>{{ bookData.category }}</p>
      </div>
      <div class="remark">
        <p>
          {{ bookData.remark }} wadjawdjaw adowihdio wah doiahwodi
          ahwiodahwiodahdio awhdoiawh oidhawio awh iowahio
        </p>
      </div>
    </div>
    <div class="history" v-if="isShowHistory">
      <h3>历次审批记录</h3>
      <audit-history :historyList="historyList"></audit-history>
    </div>
  </div>
</template>
<script>
export default {
  name: "BookDetail",
  props: {
    isShowHistory: {
      type: Boolean,
      default: false,
    },
    bookData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      historyList: [],
    };
  },
  components: {
    "audit-history": () => import("./AuditHistory"),
  },
  methods: {
    getHistory() {
      console.log("11");
      this.historyList = [
        {
          content: "包含敏感信息或广告, 予以删除",
          createTime: "2020-11-21 20:46",
          type: "danger",
        },
        {
          content: "资料缺失",
          createTime: "2018-04-03 20:46",
          type: "danger",
        },
        {
          content: "标题违规",
          createTime: "2018-04-03 20:46",
          type: "danger",
        },
        {
          content: "信息不充分",
          createTime: "2018-04-03 20:46",
          type: "danger",
        },
      ];
    },
  },
  created() {
    if (this.isShowHistory) this.getHistory();
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.book-detail {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
  &:hover {
    .remark {
      left: 270px;
    }
  }
  .logo {
    width: 250px;
    height: 250px;
    margin-right: 20px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ccc;
    cursor: pointer;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .info {
    width: calc(100% - 270px);
  }
  .remark {
    transition: 0.6s;
    position: absolute;
    top: 0;
    left: 110%;
    width: calc(100% - 270px);
    height: 100%;
    border-radius: 4px;
    p {
      margin: 0;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      color: #fff;
      padding: 20px;
    }
    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      background: rgba(0, 0, 0, 0.9);
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      width: 100%;
      height: 100%;
      filter: blur(2px);
      z-index: 0;
    }
  }
}
.history {
  border-top: 1px solid #ccc;
  margin-top: 20px;
}
</style>