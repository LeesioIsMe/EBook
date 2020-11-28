<template>
  <div class="wrapper">
    <div class="book-detail">
      <div class="logo">
        <img :src="bookData.bookUrl" alt="预览图">
      </div>
      <div class="info">
        <p><label>书名</label>{{ bookData.bookName }}</p>
        <p><label>作者 </label>{{ bookData.author }}</p>
        <p><label>出版社</label>{{ bookData.press }}</p>
        <p><label>图书分类</label>{{ bookData.categoryName }}</p>
        <p><label>上传作者</label>{{ bookData.createUserName }}</p>
        <p>
          <label>审核状态</label>{{
            bookData.status == 1
              ? "待审核"
              : bookData.status == 2
                ? "通过"
                : "驳回"
          }}
        </p>
        <p><label>上传时间</label>{{ bookData.createTime }}</p>
        <p><label>修改时间</label>{{ bookData.modifiedTime }}</p>
      </div>
      <div class="remark">
        <p>
          {{ bookData.remark }}
        </p>
      </div>
    </div>
    <div v-if="isShowHistory" class="history">
      <h3>历次审批记录</h3>
      <audit-history :history-list="historyList" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'BookDetail',
  components: {
    'audit-history': () => import('./auditHistory')
  },
  props: {
    isShowHistory: {
      type: Boolean,
      default: false
    },
    bookData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      historyList: []
    }
  },
  watch: {
    'bookData.id'(newV) {
      newV ? this.getHistory() : (this.historyList = [])
    }
  },
  created() {
  },
  mounted() {},
  methods: {
    getHistory() {
      this.$get('/api/book/getBookFindingsAll/' + this.bookData.id).then(
        (res) => {
          this.historyList = res.data
        }
      )
    }
  }
}
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
    label {
      display: inline-block;
      width: 80px;
      text-align: left;
    }
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
      color: #000;
      padding: 20px;
    }
    &::after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      background: rgba(255, 255, 255, 0.9);
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
