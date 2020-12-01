<template>
  <div class="app-container">
    <book-search
      ref="bookSearch"
      :tableUrl="'/api/book/findBookRecondList'"
      :tableParams="{ createUser: $store.state.user.id, type: 1 }"
      :is-show-history="false"
      :is-keyword-search="false"
      :is-show-rend="false"
      @deleteThis="deleteThis"
      @downloadThis="downloadThis"
    >
      <template slot="tableSlot">
        <el-table-column label="借阅时间" width="150px" align="center">
          <template slot-scope="{ row }">
            <span>{{
              row.recordTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
          </template>
        </el-table-column>
      </template>
      <template slot="cardSlot" slot-scope="{ slotScope }">
        <span
          >借阅时间:
          {{
            slotScope.row.recordTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
          }}</span
        >
      </template>
    </book-search>
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
  name: "Rend",
  components: {
    Pagination,
    "book-search": () => import("@/components/View/Book/search"),
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
      listUrl: "/api/book/findBookRecondList",
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
    detailThis(row) {
      this.detailModal = true;
      this.$get("/api/book/getInfo/" + row.id).then((res) => {
        this.modalData = res.data;
      });
    },
    downloadThis(row) {
      this.$confirm("是否要下载当前资源", "提示", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning",
      })
        .then(() => {
          this.downloadThisConfirm(row);
        })
        .catch(() => {
          this.$message.info("操作取消");
        });
    },
    downloadThisConfirm(row) {
      this.$post("/api/book/addOrDelRecord", {
        bookId: row.id,
        createUser: this.$store.state.user.id,
        type: 2,
        delStatus: 1,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        var a = document.createElement("a");
        if (document.createEvent) {
          var evObj = document.createEvent("MouseEvents");
          evObj.initEvent("click", true, false);
          a.href = row.bookUrl;
          a.download = "";
          a.target = "_blank";
          a.dispatchEvent(evObj);
          console.log("wdawd");
        } else if (document.createEventObject) {
          a.fireEvent("onclick");
        }
        this.$message.success("下载成功");
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
      this.$post("/api/book/addOrDelRecord", {
        bookId: row.id,
        createUser: this.$store.state.user.id,
        type: 1,
        delStatus: 2,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.$message.success("删除成功");
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
