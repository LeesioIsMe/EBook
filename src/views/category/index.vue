<template>
  <div class="app-container">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item title="热搜榜" name="1">
        <div class="hot">
          <el-row>
            <el-col
              v-for="(item, index) in hotSearchList"
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
                      <time class="time">{{ item.createTime }}</time>
                    </div>
                  </div>
                  <div class="btns">
                    <div class="btns-wrapper">
                      <el-button
                        size="mini"
                        type="primary"
                        @click="detailThis(item)"
                        >查看</el-button
                      >
                      <el-button
                        size="mini"
                        type="primary"
                        @click="rendThis(item)"
                        >借阅</el-button
                      >
                      <el-button
                        size="mini"
                        type="success"
                        @click="downloadThis(item)"
                        >下载</el-button
                      >
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>
      <el-collapse-item title="为您推荐" name="2">
        <div class="recommend">
          <el-row>
            <el-col
              v-for="(item, index) in downloadList"
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
                      <time class="time">{{ item.createTime }}</time>
                    </div>
                  </div>
                  <div class="btns">
                    <div class="btns-wrapper">
                      <el-button
                        size="mini"
                        type="primary"
                        @click="detailThis(item)"
                        >查看</el-button
                      >
                      <el-button
                        size="mini"
                        type="primary"
                        @click="rendThis(item)"
                        >借阅</el-button
                      >
                      <el-button
                        size="mini"
                        type="success"
                        @click="downloadThis(item)"
                        >下载</el-button
                      >
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>
      <el-collapse-item title="图书检索" name="3">
        <book-search
          ref="bookSearch"
          :tableUrl="'/api/book/findBookList'"
          :tableParams="{ status: 2, upDown: 1 }"
          :is-show-delete="false"
          :is-show-history="false"
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
        </book-search>
      </el-collapse-item>
    </el-collapse>
    <el-dialog title="资源详情" :visible.sync="detailModal" width="600px">
      <book-detail
        :book-data="modalData"
        :is-show-history="false"
        @closeModal="detailModal = false"
      />
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
  name: "Catetogy",
  components: {
    Pagination,
    "book-search": () => import("@/components/View/Book/search"),
    "book-detail": () => import("@/components/View/Book/detail"),
    "book-add-edit": () => import("@/components/View/Book/index"),
    "detail-frame": () => import("@/components/View/detailFrame"),
  },
  directives: { waves },
  filters: {},
  data() {
    return {
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
      downloadLoading: false,
      activeNames: ["3"],
      isShowHistory: false,
      isShowAdd: false,
      modalData: {},
      detailModal: false,
      rendModal: false,
      formData: {},
      hotSearchList: [],
      downloadList: [],
    };
  },
  watch: {
    rendModal(newV) {
      if (!newV) this.modalData = {};
    },
    detailModal(newV) {
      if (!newV) this.modalData = {};
    },
  },
  created() {
    this.getHotSearchList();
    this.getRecommendList();
  },
  mounted() {},
  methods: {
    getHotSearchList() {
      this.$get("/api/rank/findRanking", {
        type: 1,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.hotSearchList = res.data.filter((v, i) => i < 4);
      });
    },
    getRecommendList() {
      this.$get("/api/rank/findRanking", {
        type: 2,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.downloadList = res.data.filter((v, i) => i < 4);
      });
    },
    handleChange(val) {
      console.log(val);
    },
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
    downloadThisConfirm(row) {},
  },
};
</script>

<style lang="scss">
.hot,
.recommend {
  h3 {
    margin-top: 0;
  }
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
    line-height: 12px;
  }

  .button {
    padding: 0;
    float: right;
  }

  .image {
    width: 100%;
    display: block;
    transition: 0.3s;
    overflow: hidden;
    &:hover img {
      transform: scale(1.1);
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
