<template>
  <div class="wrapper">
    <div class="user-detail">
      <el-form :modal="userInfo" label-width="80px" label-position="right">
        <el-form-item label="用户类型">{{
          userInfo.type | typeFilter
        }}</el-form-item>
        <el-form-item label="账号">{{ userInfo.username }}</el-form-item>
        <el-form-item label="昵称">{{ userInfo.nickname }}</el-form-item>
        <el-form-item label="头像">
          <el-image
            style="width: 100px; height: 100px"
            :src="userInfo.avatar"
            lazy
            :preview-src-list="[userInfo.avatar]"
          />
        </el-form-item>
        <el-form-item label="性别">{{
          userInfo.sex | genderFilter
        }}</el-form-item>
        <el-form-item label="出生年月">{{ userInfo.birth }}</el-form-item>
        <el-form-item label="联系电话">{{
          userInfo.phone_number
        }}</el-form-item>
        <el-form-item label="上传数量">{{ userInfo.up_number }}</el-form-item>
        <el-form-item label="下载数量">{{ userInfo.down_number }}</el-form-item>
        <el-form-item label="借阅数量">{{ userInfo.read_number }}</el-form-item>
        <el-form-item label="注册时间">{{
          userInfo.createTime | parseTime
        }}</el-form-item>
        <el-form-item label="修改时间">{{
          userInfo.modifiedTime | parseTime
        }}</el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: 'UserDetail',
  filters: {
    typeFilter(data) {
      return data == 0 ? '管理员' : '普通用户'
    },
    genderFilter(data) {
      return data == 0 ? '男' : data == 1 ? '女' : '保密'
    }
  },
  components: {},
  props: {
    userInfo: {
      type: Object,
      default: () => {
        return {}
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
.user-detail {
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
