<template>
  <div class="form">
    <el-dialog
      :title="title"
      :visible.sync="modal"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="图书名称">
          <el-input v-model="formData.bookName" />
        </el-form-item>
        <el-form-item label="图书名称">
          <el-cascader
            v-model="formData.categoryId"
            :options="categoryList"
            :props="{
              label: 'name',
              value: 'id',
              children: 'children',
              checkStrictly: true,
            }"
            placeholder="图书检索"
            class="filter-item"
            clearable
            @keyup.enter.native="handleFilter"
          />
        </el-form-item>
        <el-form-item label="预览图上传">
          <el-upload
            class="avatar-uploader"
            action="/api/upload/image"
            :headers="{
              Authorization: $store.state.user.token,
            }"
            :show-file-list="false"
            :auto-upload="true"
            :limit="5"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
          >
            <i slot="default" class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
          <div v-for="(v, i) in formData.cover" :key="i" class="poster-wrapper">
            <img
              class="el-upload-list__item-thumbnail"
              :src="v"
              alt=""
              @click="handleDownload(i)"
            />
            <i class="icon-remove el-icon-close" @click="handleRemove(i)" />
          </div>
        </el-form-item>
        <el-form-item label="上传资源">
          <el-upload
            class="upload-demo"
            action="/api/upload/image"
            :headers="{
              Authorization: $store.state.user.token,
            }"
            :file-list="fileList"
            :limit="1"
            accept=".pdf,image/*,video/*,audio/*"
            :before-upload="beforeAvatarUpload2"
            :on-success="handleAvatarSuccess2"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              只支持图片、视频、音频、pdf类型文档
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="formData.author" />
        </el-form-item>
        <el-form-item label="出版社">
          <el-input v-model="formData.press" />
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="formData.remark" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          type="primary"
          size="small"
          @click="$emit(type == 0 ? 'saveForm' : 'editForm')"
          >确定</el-button
        >
        <el-button size="small" @click="$emit('closeModal')">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "BookDetail",
  components: {},
  props: {
    type: {
      type: Number,
      default: 0, // 0添加 1编辑
    },
    rules: {
      type: Object,
      default: () => {
        return {};
      },
    },
    title: {
      type: String,
      default: "",
    },
    modal: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      disabled: false,
      fileList: [],
      categoryList:
        (localStorage.getItem("category") &&
          JSON.parse(localStorage.getItem("category"))) ||
        [],
    };
  },
  created() {
    console.log(this.formData);
    if (this.type == 1) {
      this.formData.cover =
        (this.formData.cover && this.formData.cover.split(",")) || [];
      this.formData.bookUrl = this.formData.bookUrl || "";
      this.fileList = this.formData.bookUrl
        ? [
            {
              name: this.formData.bookUrl.slice(
                this.formData.bookUrl.lastIndexOf("/") + 1
              ),
              url: this.formData.bookUrl,
            },
          ]
        : [];
    } else {
      this.formData.cover = [];
      this.formData.bookUrl = "";
      this.formData.fileList = [];
    }
  },
  mounted() {},
  methods: {
    handleAvatarSuccess(res, file) {
      if (res.code != 200) return this.$message.error(res.msg);
      this.formData.cover.push(res.data.url);
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 1;
      if (!isLt2M) {
        this.$message.error("上传预览图大小不能超过 1MB!");
      }
      return isLt2M;
    },
    handleAvatarSuccess2(res, file) {
      if (res.code != 200) {
        this.formData.bookUrl = "";
        this.$message.error(res.msg);
        this.fileList = [];
        return;
      }
      this.formData.bookUrl = res.data.url;
    },
    beforeAvatarUpload2(file) {
      const isLt2M = file.size / 1024 / 1024 < 200;
      if (!isLt2M) {
        this.$message.error("上传文件大小不能超过 200M");
      }
      return isLt2M;
    },
    handleRemove(index) {
      this.formData.cover.splice(index, 1);
    },
    handlePictureCardPreview(index) {
      this.dialogImageUrl = this.formData.cover[index];
      this.dialogVisible = true;
    },
    handleDownload(index) {
      window.open(this.formData.cover[index], "_blank");
    },
  },
};
</script>

<style lang="scss" scoped>
.avatar-uploader {
  display: inline-block;
  margin-right: 10px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
}
.poster-wrapper {
  display: inline-block;
  width: 120px;
  height: 120px;
  border: 1px solid #fafafa;
  position: relative;
  margin-right: 10px;
  border-radius: 2px;
  transition: 0.3s;
  cursor: pointer;
  &:hover {
    transform: scale(1.1);
    .icon-remove {
      background-color: #409eff;
      color: #fff;
      display: block;
    }
  }
  img {
    transition: 0.3s;
    width: 100%;
    height: 100%;
  }
  .icon-remove {
    position: absolute;
    right: -7px;
    top: -7px;
    border-radius: 50%;
    color: #000;
    border: 1px solid #8c939d;
    background: transparent;
    cursor: pointer;
    display: none;
    transition: 0.3s;
  }
}
</style>
