<template>
  <div class="container">
    <el-button-group>
      <el-button
        :type="!cardType ? 'primary' : ''"
        icon="el-icon-menu"
        @click="cardType = false"
      />
      <el-button
        :type="cardType ? 'primary' : ''"
        icon="el-icon-picture"
        @click="cardType = true"
      />
    </el-button-group>
    <div class="filter-container">
      <el-input
        v-if="isKeywordSearch"
        v-model="listQuery.keyword"
        placeholder="资源名"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-cascader
        v-model="listQuery.categoryId"
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
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
        >搜索</el-button
      >
      <el-button
        v-if="isShowAdd"
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-add"
        @click="$emit('handleAdd')"
        >添加</el-button
      >
    </div>
    <keep-alive>
      <template v-if="cardType">
        <el-row class="cardtype">
          <el-col
            v-for="(item, index) in list"
            :key="index"
            :span="6"
            class="hot-col"
          >
            <el-card :body-style="{ padding: '0px' }">
              <div class="card-info-wrapper">
                <div class="image">
                  <img
                    :src="item.cover && item.cover.split(',')[0]"
                    class="image"
                  />
                </div>
                <div style="padding: 14px">
                  <span>{{ item.bookName }}</span>
                  <div class="bottom clearfix">
                    <p>作者: {{ item.author || "无" }}</p>
                    <p>出版社: {{ item.press || "无" }}</p>
                    <slot name="cardSlot" :slot-scope="{ row: item }" />
                  </div>
                </div>
                <div class="btns">
                  <div class="btns-wrapper">
                    <el-button
                      v-if="isShowHistory"
                      size="mini"
                      @click="historyThis(item)"
                      >历史</el-button
                    >
                    <el-button
                      v-if="isShowDetail"
                      size="mini"
                      type="primary"
                      @click="detailThis(item)"
                      >查看</el-button
                    >
                    <el-button
                      v-if="isShowRend"
                      size="mini"
                      type="primary"
                      @click="rendThis(item)"
                      >借阅</el-button
                    >
                    <el-button
                      v-if="isShowDownload"
                      size="mini"
                      type="success"
                      @click="downloadThis(item)"
                      >下载</el-button
                    >
                    <slot :slot-scope="{ row: item }" name="operateSlotCard" />
                    <el-button
                      v-if="isShowDelete"
                      size="mini"
                      type="danger"
                      @click="deleteThis(item)"
                      >删除</el-button
                    >
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
      <template v-else>
        <div class="tabletype">
          <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            border
            fit
            highlight-current-row
            tooltip-effect="dark"
            show-overflow-tooltip
            style="width: 100%"
          >
            <el-table-column align="center" label="序号" width="80px">
              <template slot-scope="{ $index }">
                <span>{{
                  (listQuery.pageNum - 1) * listQuery.pageSize + $index + 1
                }}</span>
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
                    v-if="row.cover"
                    style="width: 50px; height: 50px"
                    :src="row.cover && row.cover.split(',')[0]"
                    lazy
                    :preview-src-list="row.cover && row.cover.split(',')"
                  />
                  <span v-else>-</span>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="分类" width="150px">
              <template slot-scope="{ row }">
                <span>{{ row.categoryName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="作者" width="150px" align="center">
              <template slot-scope="{ row }">
                <span>{{ row.author }}</span>
              </template>
            </el-table-column>
            <el-table-column label="出版社" align="center" width="200px">
              <template slot-scope="{ row }">
                <span>{{ row.press }}</span>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="200px" align="center">
              <template slot-scope="{ row }">
                <span>{{ row.remark }}</span>
              </template>
            </el-table-column>
            <el-table-column
              :show-overflow-tooltip="true"
              label="上传作者"
              width="150px"
              align="center"
            >
              <template slot-scope="{ row }">
                <span>{{ row.createUserName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              :width="opWidth || operateWidth"
              fixed="right"
              class-name="small-padding fixed-width"
            >
              <template slot-scope="{ row }">
                <el-button
                  v-if="isShowHistory"
                  size="mini"
                  @click="historyThis(row)"
                  >历史</el-button
                >
                <el-button
                  v-if="isShowDetail"
                  size="mini"
                  type="primary"
                  @click="detailThis(row)"
                  >查看</el-button
                >
                <el-button
                  v-if="isShowRend"
                  size="mini"
                  type="primary"
                  @click="rendThis(row)"
                  >借阅</el-button
                >
                <el-button
                  v-if="isShowDownload"
                  size="mini"
                  type="success"
                  @click="downloadThis(row)"
                  >下载</el-button
                >
                <slot :slot-scope="{ row: row }" name="operateSlotTable" />
                <el-button
                  v-if="isShowDelete"
                  size="mini"
                  type="danger"
                  @click="deleteThis(row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
            <slot name="tableSlot" />
          </el-table>
        </div>
      </template>
    </keep-alive>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />
    <el-dialog title="资源详情" :visible.sync="detailModal" width="600px">
      <book-detail
        :book-data="modalData"
        :is-show-history="false"
        @closeModal="detailModal = false"
      />
    </el-dialog>
    <el-dialog title="历次批示" :visible.sync="historyModal" width="600px">
      <audit-history :history-list="historyList" />
    </el-dialog>
    <template v-if="rendModal">
      <detail-frame
        :modal="rendModal"
        :modal-data="modalData"
        @closeModal="rendModal = false"
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
    "book-detail": () => import("@/components/View/Book/detail"),
    "book-add-edit": () => import("@/components/View/Book/index"),
    "detail-frame": () => import("@/components/View/detailFrame"),
    "audit-history": () => import("@/components/View/Book/auditHistory"),
  },
  directives: { waves },
  filters: {},
  props: {
    isKeywordSearch: {
      type: Boolean,
      default: true,
    },
    tableUrl: {
      type: String,
      default: "",
    },
    tableParams: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isShowHistory: {
      type: Boolean,
      default: true,
    },
    isShowDetail: {
      type: Boolean,
      default: true,
    },
    isShowRend: {
      type: Boolean,
      default: true,
    },
    isShowDownload: {
      type: Boolean,
      default: true,
    },
    isShowDelete: {
      type: Boolean,
      default: true,
    },
    isShowAdd: {
      type: Boolean,
      default: false,
    },
    opWidth: {
      type: Number,
      default: 0,
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
      cardType: true,
      // 弹窗中的数据
      rules: {},
      modalData: {},
      detailModal: false,
      historyModal: false,
      historyList: [],
      rendModal: false,
      formData: {},
      title: "",
      type: 0, // 0 添加 1 编辑
    };
  },
  computed: {
    operateWidth() {
      return (
        [
          this.isShowHistory,
          this.isShowDetail,
          this.isShowRend,
          this.isShowDownload,
          this.isShowDelete,
        ].filter((v) => v).length * 80
      );
    },
  },
  watch: {
    rendModal(newV) {
      if (!newV) this.modalData = {};
    },
    detailModal(newV) {
      if (!newV) this.modalData = {};
    },
    historyModal(newV) {
      if (!newV) this.modalData = {};
    },
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    detailThis(row) {
      this.$get("/api/book/getInfo/" + row.id).then((res) => {
        if (res.code != 200) return this.$message.error(res.msg);
        this.detailModal = true;
        this.modalData = row;
      });
    },
    rendThis(row) {
      this.$post("/api/book/addOrDelRecord", {
        bookId: row.id,
        createUser: this.$store.state.user.id,
        type: 1,
        delStatus: 1,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.rendModal = true;
        this.modalData = row;
      });
    },
    historyThis(row) {
      this.historyModal = true;
      this.$get("/api/book/getBookFindingsAll/" + row.id).then((res) => {
        this.historyList = res.data;
      });
    },
    downloadThis(row) {
      this.$emit("downloadThis", row);
    },
    deleteThis(row) {
      this.$emit("deleteThis", row);
    },
    handleFilter() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    getList() {
      this.listLoading = true;
      var params = { ...this.listQuery };
      params.categoryId = params.categoryId
        ? params.categoryId[params.categoryId.length - 1]
        : "";
      this.$get(this.tableUrl, {
        ...params,
        ...this.tableParams,
      })
        .then((res) => {
          this.listLoading = false;
          if (res.code != 200) {
            return this.$message.error(res.msg);
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
  },
};
</script>

<style lang="scss">
.filter-container {
  margin-top: 20px;
}
.cardtype {
  .hot-col {
    padding: 5px;
    cursor: pointer;
    position: relative;
  }
  .time {
    font-size: 13px;
    color: #999;
  }

  .bottom {
    margin-top: 13px;
    line-height: 16px;
    font-size: 14px;
    color: #999;
    p {
      margin: 0;
    }
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
    img {
      height: 100%;
      width: 100%;
      transition: 0.3s;
    }
    &:hover {
      img {
        transform: scale(1.1);
      }
    }
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both;
  }

  .btns {
    transition: 0.3s;
    width: 100%;
    text-align: center;
    position: absolute;
    left: 0;
    bottom: 0;
    opacity: 0;
    padding: 5px;
    .btns-wrapper {
      padding: 10px 0;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.8) 40%,
        rgba(255, 255, 255, 1) 100%
      );
    }
  }
  .card-info-wrapper:hover {
    .btns {
      opacity: 1;
    }
  }
}
</style>
