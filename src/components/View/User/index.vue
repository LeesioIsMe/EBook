<template>
  <div class="form">
    <el-dialog
      :title="title"
      :visible.sync="modal"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="用户账号" prop="username">
          <el-input
            v-model="formData.account"
            placeholder="账号"
            class="filter-item"
            :disabled="type == 1"
          />
        </el-form-item>
        <template v-if="type != 1">
          <el-form-item label="用户密码" prop="password">
            <el-input
              v-model="formData.password"
              placeholder="密码"
              class="filter-item"
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              placeholder="确认密码"
              class="filter-item"
            />
          </el-form-item>
        </template>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input
            v-model="formData.nickname"
            maxlength="40"
            placeholder="姓名"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户头像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="/api/uploadFile"
            :data="{ type: 'logo' }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="formData.avatar" :src="formData.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <div style="display: flex">
          <el-form-item label="邮箱" prop="email" style="width: 50%">
            <el-input v-model="formData.email" />
          </el-form-item>
        </div>
        <el-form-item label="出生日期" prop="birth" style="width: 50%">
          <el-date-picker v-model="formData.birth" />
        </el-form-item>
        <div style="display: flex">
          <el-form-item label="用户性别" prop="sex" style="width: 50%">
            <el-select
              v-model="formData.sex"
              placeholder="用户性别"
              clearable
              class="filter-item"
            >
              <el-option
                v-for="(item, i) in genderList"
                :key="i"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            style="margin-left: 10px; width: 50%"
            label="手机号"
            prop="phone"
          >
            <el-input
              v-model="formData.phone"
              placeholder="联系电话"
              class="filter-item"
            />
          </el-form-item>
        </div>
        <el-form-item label="用户类型" prop="type" style="width: 50%">
          <el-select
            v-model="formData.type"
            placeholder="用户类型"
            clearable
            class="filter-item"
          >
            <el-option
              v-for="(item, i) in typeList"
              :key="i"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          type="primary"
          size="small"
          @click="$emit(type == 0 ? 'saveForm' : 'editForm')"
        >确定</el-button>
        <el-button size="small" @click="$emit('closeModal')">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'BookDetail',
  components: {},
  props: {
    type: {
      type: Number,
      default: 0 // 0添加 1编辑
    },
    rules: {
      type: Object,
      default: () => {
        return {}
      }
    },
    title: {
      type: String,
      default: ''
    },
    modal: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false,
      fileList: [],
      typeList: [
        { label: '管理员', value: 0 },
        { label: '普通用户', value: 1 }
      ],
      genderList: [
        { label: '男', value: 0 },
        { label: '女', value: 1 },
        { label: '保密', value: 2 }
      ]
    }
  },
  created() {},
  mounted() {},
  methods: {
    handleAvatarSuccess(res, file) {
      if (res.code != 200) {
        this.$message.error(res.message)
        this.formData.avatar = ''
        return
      }
      this.formData.avatar = res.data
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 1

      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 1MB!')
      }
      return isLt2M
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
