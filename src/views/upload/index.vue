<template>
  <div class="app-container">
    <book-search
      ref="bookSearch"
      :is-show-add="true"
      :is-show-download="false"
      :is-show-rend="false"
      :op-width="320"
      :tableUrl="'/api/book/findBookList'"
      :tableParams="{ createUser: $store.state.user.id, status: '' }"
      @handleAdd="addBookTrigger"
      @deleteThis="deleteThis"
    >
      <template slot="tableSlot">
        <el-table-column label="上传时间" width="150px" align="center">
          <template slot-scope="{ row }">
            <span>{{
              row.createTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
          </template>
        </el-table-column>
      </template>
      <template slot="operateSlotCard" slot-scope="{ slotScope }">
        <template v-if="slotScope.row.status != 1">
          <el-button size="mini" type="warning" @click="editThis(slotScope.row)"
            >修改</el-button
          >
          <el-button
            v-if="slotScope.row.upDown == 1"
            size="mini"
            type="warning"
            @click="upDownThis(slotScope.row)"
            >下架</el-button
          >
          <el-button
            v-else
            size="mini"
            type="success"
            @click="upDownThis(slotScope.row)"
            >上架</el-button
          >
        </template>
      </template>
      <template slot="operateSlotTable" slot-scope="{ slotScope }">
        <template v-if="slotScope.row.status != 1">
          <el-button size="mini" type="warning" @click="editThis(slotScope.row)"
            >修改</el-button
          >
          <el-button
            v-if="slotScope.row.upDown == 1"
            size="mini"
            type="warning"
            @click="upDownThis(slotScope.row)"
            >下架</el-button
          >
          <el-button
            v-else
            size="mini"
            type="success"
            @click="upDownThis(slotScope.row)"
            >上架</el-button
          >
        </template>
      </template>
    </book-search>
    <template v-if="addEditModal">
      <book-add-edit
        :type="type"
        :title="title"
        :rules="rules"
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
  name: "Upload",
  components: {
    Pagination,
    "book-search": () => import("@/components/View/Book/search"),
    "book-add-edit": () => import("@/components/View/Book/index"),
  },
  directives: { waves },
  filters: {},
  props: {
    isShowAdd: {
      type: Boolean,
      default: true,
    },
    isShowHistory: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      categoryList:
        (localStorage.getItem("category") &&
          JSON.parse(localStorage.getItem("category"))) ||
        [],
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        keyword: "",
        categoryId: "",
      },
      // 弹窗中的数据
      rules: {},
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
  created() {},
  mounted() {},
  methods: {
    editThis(row) {
      this.$get("/api/book/getInfo/" + row.id).then((res) => {
        this.addEditModal = true;
        this.title = "资源编辑";
        this.type = 1;
        this.formData = res.data;
      });
    },
    detailThis(row) {
      this.detailModal = true;
      this.$get("/api/book/getInfo/" + row.id).then((res) => {
        this.modalData = res.data;
      });
    },
    upDownThis(row) {
      this.$confirm(
        `是否要${row.upDown == 1 ? "下架" : "上架"}当前资源`,
        "提示",
        {
          confirmButtonText: "是",
          cancelButtonText: "否",
          type: "warning",
        }
      )
        .then(() => {
          this.upDownThisComfirm(row);
        })
        .catch(() => {
          this.$message.info("操作取消");
        });
    },
    upDownThisComfirm(row) {
      this.$post("/api/book/upDown", {
        id: row.id,
        upDown: row.upDown == 1 ? 2 : 1,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success((row.upDown == 1 ? "下架" : "上架") + "成功");
        this.$refs.bookSearch.getList();
      });
    },
    deleteThis(row) {
      this.$confirm("是否要删除当前资源", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          this.deleteThisConfirm(row);
        })
        .catch(() => {
          this.$message.info("操作取消");
        });
    },
    deleteThisConfirm(row) {
      this.$delete("/api/book/delete/" + row.id).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success("删除成功");
        this.$refs.bookSearch.getList();
      });
    },
    addBookTrigger() {
      this.addEditModal = true;
      this.title = "资源添加";
      this.type = 0;
    },
    saveForm() {
      console.log(this.formData);
      var params = Object.assign({}, this.formData);
      params.cover = (params.cover && params.cover.join(",")) || "";
      params.categoryId = params.categoryId
        ? params.categoryId[params.categoryId.length - 1]
        : "";
      this.$post("/api/book/add", params).then((res) => {
        console.log(res);
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success("添加成功");
        this.addEditModal = false;
        this.$refs.bookSearch.getList();
      });
    },
    editForm() {
      console.log(this.formData);
      var params = Object.assign({}, this.formData);
      params.cover = (params.cover && params.cover.join(",")) || "";
      params.categoryId = params.categoryId
        ? params.categoryId[params.categoryId.length - 1]
        : "";
      this.$post("/api/book/edit", params).then((res) => {
        console.log(res);
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success("编辑成功");
        this.addEditModal = false;
        this.$refs.bookSearch.getList();
      });
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
