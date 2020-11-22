<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keywords"
        placeholder="书名/作者/出版社"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
        clearable
      />
      <el-cascader
        v-model="listQuery.category"
        :options="categoryList"
        :props="{ checkStrictly: true }"
        placeholder="图书分类"
        class="filter-item"
        @keyup.enter.native="handleFilter"
        clearable
      ></el-cascader>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
        >搜索</el-button
      >
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
        >导出</el-button
      >
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="序号" width="80px">
        <template slot-scope="{ $index }">
          <span>{{ (listQuery.page - 1) * listQuery.limit + $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图书名称" width="200px">
        <template slot-scope="{ row }">
          <span>{{ row.bookName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预览图" align="center" width="120px">
        <template slot-scope="{ row }">
          <span>
            <el-image
              v-if="row.poster"
              style="width: 50px; height: 50px"
              :src="row.poster"
              lazy
              :preview-src-list="[row.poster]"
            ></el-image>
            <span v-else>-</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="150px">
        <template slot-scope="{ row }">
          <span>{{ row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出版社" align="center" width="200px">
        <template slot-scope="{ row }">
          <span>{{ row.publishOrgName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年份" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.year | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="200px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        label="上传用户"
        width="150px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.uploaderName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.createTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="300"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button size="mini" type="success" @click="historyThis"
            >历史</el-button
          >
          <el-button size="mini" type="primary" @click="detailThis"
            >查阅</el-button
          >
          <el-button size="mini" type="primary" @click="passThis"
            >通过</el-button
          >
          <el-button size="mini" type="danger" @click="backThis"
            >驳回</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="'历史记录'" :visible.sync="isAddModal" width="600px">
      <el-form
        ref="addForm"
        :rules="rules"
        :model="addFormData"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="用户编号" prop="userNo">
          <el-input
            v-model="addFormData.userNo"
            placeholder="编号"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户账号" prop="account">
          <el-input
            v-model="addFormData.account"
            placeholder="账号"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input
            v-model="addFormData.password"
            placeholder="密码"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户姓名" prop="name">
          <el-input
            v-model="addFormData.name"
            maxlength="40"
            placeholder="姓名"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户头像" prop="logo">
          <el-upload
            class="avatar-uploader"
            action="/api/uploadFile"
            :data="{ type: 'logo' }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="addFormData.logo"
              :src="addFormData.logo"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <div style="display: flex">
          <el-form-item label="用户性别" prop="gender" style="width: 50%">
            <el-select
              v-model="addFormData.gender"
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
              v-model="addFormData.phone"
              placeholder="手机号"
              class="filter-item"
            />
          </el-form-item>
        </div>
        <div style="display: flex">
          <el-form-item label="用户类型" prop="type" style="width: 50%">
            <el-select
              v-model="addFormData.type"
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
          <el-form-item
            style="margin-left: 10px; width: 50%"
            label="禁/启用"
            prop="status"
          >
            <el-select
              v-model="addFormData.status"
              placeholder="禁/启用状态"
              clearable
              class="filter-item"
            >
              <el-option
                v-for="(item, i) in statusList"
                :key="i"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isAddModal = false">取消</el-button>
        <el-button type="primary" @click="submit('add')">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="'编辑用户'" :visible.sync="isEditModal" width="600px">
      <el-form
        ref="editForm"
        :rules="rules"
        :model="editFormData"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="用户编号" prop="userNo">
          <el-input
            :disabled="true"
            v-model="editFormData.userNo"
            placeholder="编号"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户账号" prop="account">
          <el-input
            :disabled="true"
            v-model="editFormData.account"
            placeholder="账号"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户姓名" prop="name">
          <el-input
            v-model="editFormData.name"
            maxlength="40"
            placeholder="姓名"
            class="filter-item"
          />
        </el-form-item>
        <el-form-item label="用户头像" prop="name">
          <el-upload
            class="avatar-uploader"
            action="/api/uploadFile"
            :data="{ type: 'logo' }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="editFormData.logo"
              :src="editFormData.logo"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <div style="display: flex">
          <el-form-item label="用户性别" prop="gender" style="width: 50%">
            <el-select
              v-model="editFormData.gender"
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
              v-model="editFormData.phone"
              placeholder="手机号"
              class="filter-item"
            />
          </el-form-item>
        </div>
        <div style="display: flex">
          <el-form-item label="用户类型" prop="type" style="width: 50%">
            <el-select
              v-model="editFormData.type"
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
          <el-form-item
            style="margin-left: 10px; width: 50%"
            label="禁/启用"
            prop="tystatuspe"
          >
            <el-select
              v-model="editFormData.status"
              placeholder="禁/启用状态"
              clearable
              class="filter-item"
            >
              <el-option
                v-for="(item, i) in statusList"
                :key="i"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isEditModal = false">取消</el-button>
        <el-button type="primary" @click="submit('edit')">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  validUsername,
  validPhone,
  validUserNo,
  validPassword,
} from "@/utils/validate";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
export default {
  name: "User",
  data() {
    const validateUserNo = (rule, value, callback) => {
      if (!validUserNo(value)) {
        callback(new Error("编号由8～20位数字组成，请检查编号"));
      } else {
        callback();
      }
    };
    const validatePhone = (rule, value, callback) => {
      if (!value) return callback();
      if (!validPhone(value)) {
        callback(new Error("手机号格式不正确，请检查手机号"));
      } else {
        callback();
      }
    };
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        new Error("用户名由字母开头，长度8～20的数字、字母组成，请检查用户名");
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error("密码由8～20位数字、字母组成，请检查格式"));
      } else {
        callback();
      }
    };
    return {
      categoryList: [
        {
          id: "1",
          label: "一级分类",
          value: "1",
          children: [
            {
              id: "1-1",
              label: "二级分类1",
              value: "1-1",
              children: [
                {
                  id: "1-1-1",
                  label: "三级分类1",
                  value: "1-1-1",
                },
                {
                  id: "1-1-2",
                  label: "三级分类2",
                  value: "1-1-2",
                },
              ],
            },
            {
              id: "1-2",
              label: "二级分类2",
              value: "1-2",
            },
          ],
        },
        {
          id: "2",
          label: "一级分类2",
          value: "2",
        },
      ],
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
      },
      downloadLoading: false,
      typeList: [
        { label: "全部", value: "" },
        { label: "工作人员", value: 1 },
        { label: "教师", value: 2 },
      ],
      statusList: [
        { label: "全部", value: "" },
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
      genderList: [
        { label: "全部", value: "" },
        { label: "男", value: 1 },
        { label: "女", value: 2 },
      ],
      // 弹窗中的数据
      isAddModal: false,
      isEditModal: false,
      rules: {
        userNo: [
          { required: true, message: "用户编号不能为空" },
          { trigger: "blur", validator: validateUserNo },
        ],
        account: [
          { required: true, message: "用户账号不能为空" },
          { trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, message: "用户密码不能为空" },
          { trigger: "blur", validator: validatePassword },
        ],
        name: [{ required: true, message: "用户名称不能为空" }],
        type: [{ required: true, message: "用户类型不能为空" }],
        phone: [
          { required: true, message: "联系电话不能为空" },
          { trigger: "blur", validator: validatePhone },
        ],
        status: [{ required: true, message: "禁启用状态不能为空" }],
        gender: [{ required: true, message: "用户性别不能为空" }],
      },
      addFormData: { logo: "" },
      imageUrl: "",
      editFormData: { logo: "" },
    };
  },
  components: { Pagination },
  directives: { waves },
  created() {
    this.getList();
  },
  filters: {},
  methods: {
    submit(type) {
      this.$refs[`${type}Form`].validate((valid) => {
        if (valid) {
          this[`${type}Submit`]();
        } else {
          return false;
        }
      });
    },
    addSubmit() {
      this.$post("/api/users/add", this.addFormData)
        .then((res) => {
          if (res.code != 200) {
            return this.$notify({
              title: "失败",
              message: res.message,
              type: "error",
            });
          }
          this.$refs.addForm.resetFields();
          this.isAddModal = false;
          this.$notify({
            title: "提示",
            message: res.message,
            type: "success",
          });
          this.getList();
        })
        .catch((err) => {
          this.isAddModal = false;
          this.$message({
            message: "网络错误，请稍后再试",
            type: "warning",
          });
        });
    },
    editSubmit() {
      this.$post("/api/users/edit", this.editFormData)
        .then((res) => {
          if (res.code != 200) {
            return this.$notify({
              title: "失败",
              message: res.message,
              type: "error",
            });
          }
          this.$refs.editForm.resetFields();
          this.isEditModal = false;
          this.$notify({
            title: "提示",
            message: res.message,
            type: "success",
          });
          this.getList();
        })
        .catch((err) => {
          this.isEditModal = false;
          this.$message({
            message: "网络错误，请稍后再试",
            type: "warning",
          });
        });
    },
    deleteThis(row) {
      this.$confirm("此操作将删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$post("/api/users/delete", { id: row.id })
            .then((res) => {
              if (res.code != 200) {
                return this.$notify({
                  title: "失败",
                  message: res.message,
                  type: "error",
                });
              }
              this.isEditModal = false;
              this.$notify({
                title: "提示",
                message: res.message,
                type: "success",
              });
              this.getList();
            })
            .catch((err) => {
              this.isEditModal = false;
              this.$message({
                message: "网络错误，请稍后再试",
                type: "warning",
              });
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    editThis(row) {
      var newObj = Object.assign({}, row);
      this.editFormData = newObj;
      this.isEditModal = true;
    },
    passwordReset(row) {
      this.$post("/api/users/resetPassword", {
        id: row.id,
      })
        .then((res) => {
          if (res.code != 200) {
            return this.$notify({
              title: "失败",
              message: res.message,
              type: "error",
            });
          }
          this.$notify({
            title: "提示",
            dangerouslyUseHTMLString: true,
            message: `${res.message}<span style="color:#f22424">${res.data}</span>`,
            type: "success",
          });
        })
        .catch((err) => {
          this.$message({
            message: "网络错误，请稍后再试",
            type: "warning",
          });
          console.log(err);
        });
    },
    changeStatus(row, status) {
      this.$post("/api/users/openOrForbid", {
        id: row.id,
        status: status,
      })
        .then((res) => {
          if (res.code != 200) {
            return this.$notify({
              title: "失败",
              message: res.message,
              type: "error",
            });
          }
          this.$notify({
            title: "提示",
            message: res.message,
            type: "success",
          });
          row.status = res.data;
        })
        .catch((err) => {
          this.$message({
            message: "网络错误，请稍后再试",
            type: "warning",
          });
          console.log(err);
        });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    getList() {
      this.listLoading = true;
      this.$get("/api/users/getAll", {
        pageNow: this.listQuery.page,
        pageSize: this.listQuery.limit,
        ...this.listQuery,
      })
        .then((res) => {
          this.listLoading = false;
          if (res.code != 200) {
            return this.$notify({
              title: "失败",
              message: res.message,
              type: "error",
            });
          }
          this.list = res.data.list;
          this.total = res.data.total;
        })
        .catch((err) => {
          this.listLoading = false;
          this.$message({
            message: "网络错误，请稍后再试",
            type: "warning",
          });
          console.log(err);
        });
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = [
          "用户类型",
          "禁启用状态",
          "用户编号",
          "用户姓名",
          "用户性别",
          "头像地址",
          "用户账号",
          "手机号",
          "注册时间",
        ];
        const filterVal = [
          "type",
          "status",
          "userNo",
          "name",
          "gender",
          "logo",
          "account",
          "phone",
          "createTime",
        ];
        const data = this.formatJson(filterVal);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "用户信息表",
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === "createTime") {
            return parseTime(v[j]);
          } else if (j === "type") {
            return v[j] == 0 ? "超级管理员" : v[j] == 1 ? "工作人员" : "教师";
          } else if (j === "status") {
            return v[j] == 0 ? "禁用" : "启用";
          } else if (j === "gender") {
            return v[j] == 0 ? "男" : "女";
          } else {
            return v[j];
          }
        })
      );
    },
    handleAvatarSuccess(res, file) {
      this.$nextTick(() => {
        this.isAddModal
          ? (this.addFormData.logo = res.data)
          : (this.editFormData.logo = res.data);
      });
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 1;

      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 1MB!");
      }
      return isLt2M;
    },
  },
  mounted() {},
};
</script>

<style lang="scss">
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
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>