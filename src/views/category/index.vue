<template>
  <div class="app-container">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item title="热搜榜" name="1">
        <div class="hot">
          <el-row>
            <el-col v-for="(o, index) in 4" :key="o" :span="6" class="hot-col">
              <el-card :body-style="{ padding: '0px' }">
                <div class="card-info-wrapper">
                  <div class="image">
                    <img
                      src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                      class="image"
                    >
                  </div>
                  <div style="padding: 14px">
                    <span>好吃的汉堡</span>
                    <div class="bottom clearfix">
                      <time class="time">{{
                        new Date().toLocaleString()
                      }}</time>
                    </div>
                  </div>
                  <div class="btns">
                    <div class="btns-wrapper">
                      <el-button
                        size="mini"
                        type="primary"
                        @click="detailThis(item)"
                      >查看</el-button>
                      <el-button
                        size="mini"
                        type="primary"
                        @click="rendThis(item)"
                      >借阅</el-button>
                      <el-button
                        size="mini"
                        type="success"
                        @click="downloadThis(item)"
                      >下载</el-button>
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
            <el-col v-for="(o, index) in 4" :key="o" :span="6" class="hot-col">
              <el-card :body-style="{ padding: '0px' }">
                <div class="card-info-wrapper">
                  <div class="image">
                    <img
                      src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                      class="image"
                    >
                  </div>
                  <div style="padding: 14px">
                    <span>好吃的汉堡</span>
                    <div class="bottom clearfix">
                      <time class="time">{{
                        new Date().toLocaleString()
                      }}</time>
                    </div>
                  </div>
                  <div class="btns">
                    <div class="btns-wrapper">
                      <el-button
                        size="mini"
                        type="primary"
                        @click="detailThis(item)"
                      >查看</el-button>
                      <el-button
                        size="mini"
                        type="primary"
                        @click="rendThis(item)"
                      >借阅</el-button>
                      <el-button
                        size="mini"
                        type="success"
                        @click="downloadThis(item)"
                      >下载</el-button>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>
      <el-collapse-item title="图书检索" name="3">
        <book-search :is-show-delete="false" :is-show-history="false">
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
  validPassword
} from '@/utils/validate'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'User',
  components: {
    Pagination,
    'book-search': () => import('@/components/View/Book/search'),
    'book-detail': () => import('@/components/View/Book/detail'),
    'book-add-edit': () => import('@/components/View/Book/index'),
    'detail-frame': () => import('@/components/View/detailFrame')
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
        keyword: '', categoryId: ''
      },
      downloadLoading: false,
      activeNames: ['3'],
      isShowHistory: false,
      isShowAdd: false,
      modalData: {},
      detailModal: false,
      rendModal: false,
      formData: {}
    }
  },
  watch: {
    rendModal(newV) {
      if (!newV) this.modalData = {}
    },
    detailModal(newV) {
      if (!newV) this.modalData = {}
    }
  },
  created() {
    this.getList()
  },
  mounted() {},
  methods: {
    handleChange(val) {
      console.log(val)
    },
    detailThis(row) {
      this.detailModal = true
      this.modalData = row
    },
    rendThis(row) {
      this.rendModal = true
      this.modalData = row
    },
    downloadThis(row) {
      this.$confirm(
        '您确认下载当资源么, 下载记录将在"下载记录"菜单中展示',
        '提示',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'info'
        }
      )
        .then((res) => {
          this.$message.success('下载成功')
        })
        .catch(() => {
          this.$message.info('取消下载')
        })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.$get('/api/users/getAll', {
        pageNow: this.listQuery.pageNum,
        pageSize: this.listQuery.pageSize,
        ...this.listQuery
      })
        .then((res) => {
          this.listLoading = false
          if (res.code != 200) {
            return this.$notify({
              title: '失败',
              message: res.msg,
              type: 'error'
            })
          }
          this.list = res.data.list
          this.total = res.data.total
        })
        .catch((err) => {
          this.listLoading = false
          this.$message({
            message: '网络错误，请稍后再试',
            type: 'warning'
          })
          console.log(err)
        })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = [
          '用户类型',
          '禁启用状态',
          '用户编号',
          '用户姓名',
          '用户性别',
          '头像地址',
          '用户账号',
          '手机号',
          '注册时间'
        ]
        const filterVal = [
          'type',
          'status',
          'userNo',
          'name',
          'gender',
          'logo',
          'account',
          'phone',
          'createTime'
        ]
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '用户信息表'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'createTime') {
            return parseTime(v[j])
          } else if (j === 'type') {
            return v[j] == 0 ? '管理员' : '普通用户'
          } else if (j === 'status') {
            return v[j] == 0 ? '禁用' : '启用'
          } else if (j === 'gender') {
            return v[j] == 0 ? '男' : '女'
          } else {
            return v[j]
          }
        })
      )
    }
  }
}
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
    &:hover {
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
