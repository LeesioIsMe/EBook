<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        placeholder="用户名"
        style="width: 150px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.nickname"
        placeholder="昵称"
        style="width: 150px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.sex"
        placeholder="用户性别"
        clearable
        class="filter-item"
        style="width: 150px"
      >
        <el-option
          v-for="(item, i) in genderList"
          :key="i"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
        >搜索</el-button
      >
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="addUserTrigger"
        >添加</el-button
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
      
      tooltip-effect="dark" show-overflow-tooltip
      style="width: 100%"
    >
      <el-table-column align="center" label="序号" width="80px">
        <template slot-scope="{ $index }">
          <span>{{
            (listQuery.pageNum - 1) * listQuery.pageSize + $index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户类型" width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="禁/启用状态" width="100px" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status == 0 ? 'danger' : 'success'">{{
            row.status == 0 ? "禁用" : "启用"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="账号" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        label="昵称"
        width="150px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center" width="120px">
        <template slot-scope="{ row }">
          <span>
            <el-image
              v-if="row.avatar"
              style="width: 50px; height: 50px"
              :src="row.avatar"
              lazy
              :preview-src-list="[row.avatar]"
            />
            <span v-else>-</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.sex | genderFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" width="150px">
        <template slot-scope="{ row }">
          <span>{{ row.phoneNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center" width="150px">
        <template slot-scope="{ row }">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="180px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="240"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.status != 'published'"
            size="mini"
            type="primary"
            @click="detailThis(row)"
            >详情</el-button
          >
          <el-button type="warning" size="mini" @click="editThis(row)"
            >编辑</el-button
          >
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            :type="row.status == 0 ? 'success' : 'danger'"
            @click="forbidOpenThis(row)"
            >{{ row.status == 0 ? "启用" : "禁用" }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <el-dialog title="资源详情" :visible.sync="detailModal" width="600px">
      <user-detail :user-info="modalData" />
    </el-dialog>
    <template v-if="addEditModal">
      <user-add-edit
        :rules="rules"
        :type="type"
        :title="title"
        :modal="addEditModal"
        :form-data="formData"
        @saveForm="saveForm"
        @editForm="editForm"
        @closeModal="addEditModal = false"
      />
    </template>
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
  components: {
    Pagination,
    "user-detail": () => import("@/components/View/User/detail"),
    "user-add-edit": () => import("@/components/View/User/index"),
  },
  directives: { waves },
  filters: {
    typeFilter(data) {
      return data == 0 ? "管理员" : "普通用户";
    },
    genderFilter(data) {
      return data == 0 ? "男" : data == 1 ? "女" : "保密";
    },
  },
  data() {
    const validateUserNo = (rule, value, callback) => {
      if (!validUserNo(value)) {
        callback(new Error("编号由8～20位数字组成，请检查编号"));
      } else {
        callback();
      }
    };
    const validatePhone = (rule, value, callback) => {
      console.log("11");
      if (!value) return callback();
      if (!validPhone(value)) {
        callback(new Error("手机号格式不正确，请检查手机号"));
      } else {
        callback();
      }
    };
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(
          new Error("用户名由字母开头，长度8～20的数字、字母组成，请检查用户名")
        );
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
    const validateConfirmPassword = (rule, value, callback) => {
      if (value != this.formData.password) {
        callback(new Error("两次密码不一致"));
      } else {
        callback();
      }
    };
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        username: "",
        nickname: "",
        sex: "",
      },
      downloadLoading: false,
      typeList: [
        { label: "管理员", value: 0 },
        { label: "普通用户", value: 1 },
      ],
      genderList: [
        { label: "全部", value: "" },
        { label: "男", value: 0 },
        { label: "女", value: 1 },
        { label: "保密", value: 2 },
      ],

      // 弹窗中的数据
      rules: {
        username: [
          { required: true, message: "用户账号不能为空" },
          { trigger: "blur", validator: validateUsername },
        ],
        password: [
          { required: true, message: "用户密码不能为空" },
          { trigger: "blur", validator: validatePassword },
        ],
        confirmPassword: [
          { required: true, message: "确认密码不能为空" },
          { trigger: "blur", validator: validateConfirmPassword },
        ],
        phoneNumber: [{ trigger: "blur", validator: validatePhone }],
        type: [{ required: true, message: "用户类型不能为空" }],
      },
      modalData: {},
      detailModal: false,
      addModal: false,
      editModal: false,
      addEditModal: false,
      formData: {},
      title: "",
      type: 0, // 0 添加 1 编辑
    };
  },
  watch: {
    detailModal(newV) {
      if (!newV) this.modalData = {};
    },
    addEditModal(newV) {
      if (!newV) (this.formData = {}), (this.title = ""), (this.type = 0);
    },
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    addUserTrigger() {
      this.addEditModal = true;
      this.title = "用户添加";
      this.type = 0;
    },
    saveForm() {
      this.$post("/api/user/add", this.formData).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success("添加成功");
        this.addEditModal = false;
        this.getList();
      });
    },
    editForm() {
      this.$post("/api/user/update", this.formData).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success("编辑成功");
        this.addEditModal = false;
        this.getList();
      });
    },
    forbidOpenThis(row) {
      this.$confirm(
        `此操作将${row.status == 0 ? "启用" : "启用"}该用户, 是否继续?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.forbidOpenConfirm(row);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "操作取消",
          });
        });
    },
    forbidOpenConfirm(row) {
      this.$put(
        "/api/user/updateStatus/" + row.id + "/" + (row.status == 0 ? 1 : 0)
      ).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success("状态已更新");
        this.getList();
      });
    },
    editThis(row) {
      this.$post("/api/user/info?id=" + this.$store.state.user.id, {
        id: this.$store.state.user.id,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.addEditModal = true;
        this.title = "用户编辑";
        this.formData = Object.assign({}, row);
        this.type = 1;
      });
    },
    detailThis(row) {
      this.$post("/api/user/info?id=" + this.$store.state.user.id, {
        id: this.$store.state.user.id,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.modalData = res.data;
        this.detailModal = true;
      });
    },
    handleFilter() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    getList() {
      this.listLoading = true;
      this.$get("/api/user/findUserList", {
        ...this.listQuery,
      })
        .then((res) => {
          this.listLoading = false;
          if (res.code != 200) {
            return this.$notify({
              title: "失败",
              message: res.msg,
              type: "error",
            });
          }
          this.list = res.data.rows;
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
          "用户账号",
          "用户昵称",
          "用户性别",
          "邮箱",
          "头像地址",
          "联系方式",
          "注册时间",
        ];
        const filterVal = [
          "type",
          "username",
          "nickname",
          "sex",
          "email",
          "avatar",
          "phoneNumber",
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
            return v[j] == 0 ? "管理员" : "普通用户";
          } else if (j === "sex") {
            return v[j] == 0 ? "男" : v[j] == 1 ? "女" : "保密";
          } else {
            return v[j];
          }
        })
      );
    },
  },
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
