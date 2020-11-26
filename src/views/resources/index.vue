<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keywords"
        placeholder="书名/作者/出版社"
        style="width: 200px"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-cascader
        v-model="listQuery.category"
        :options="categoryList"
        :props="{ checkStrictly: true }"
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
      >搜索</el-button>
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
            />
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
          <el-button
            size="mini"
            @click="historyThis(row)"
          >历史</el-button>
          <el-button
            size="mini"
            type="primary"
            @click="detailThis(row)"
          >查阅</el-button>
          <el-button
            size="mini"
            type="success"
            @click="passThis(row)"
          >通过</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="backThis(row)"
          >驳回</el-button>
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
    <el-dialog title="历史记录" :visible.sync="historyModal" width="600px">
      <audit-history :history-list="historyList" />
    </el-dialog>
    <el-dialog title="资源详情" :visible.sync="detailModal" width="600px">
      <book-detail :book-data="modalData" :is-show-history="true" />
    </el-dialog>
    <el-dialog title="驳回批示信息录入" :visible.sync="backModal" width="600px">
      <el-input
        v-model="backInfo"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="请输入驳回意见"
      />
      <div slot="footer">
        <el-button
          type="primary"
          size="small"
          @click="confirmBack"
        >确定</el-button>
        <el-button size="small" @click="backModal = false">取消</el-button>
      </div>
    </el-dialog>
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
    'book-detail': () => import('@/components/View/Book/detail'),
    'audit-history': () => import('@/components/View/Book/auditHistory')
  },
  directives: { waves },
  filters: {},
  data() {
    return {
      categoryList: [
        {
          id: '1',
          label: '一级分类',
          value: '1',
          children: [
            {
              id: '1-1',
              label: '二级分类1',
              value: '1-1',
              children: [
                {
                  id: '1-1-1',
                  label: '三级分类1',
                  value: '1-1-1'
                },
                {
                  id: '1-1-2',
                  label: '三级分类2',
                  value: '1-1-2'
                }
              ]
            },
            {
              id: '1-2',
              label: '二级分类2',
              value: '1-2'
            }
          ]
        },
        {
          id: '2',
          label: '一级分类2',
          value: '2'
        }
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
        type: undefined
      },
      // 弹窗中的数据
      rules: {},
      modalData: {},
      historyModal: false,
      historyList: [],
      detailModal: false,
      backModal: false,
      backInfo: ''
    }
  },
  watch: {
    historyModal(newV) {
      if (!newV) this.modalData = {}
    },
    detailModal(newV) {
      if (!newV) this.modalData = {}
    },
    backModal(newV) {
      if (!newV) (this.modalData = {}), (this.backInfo = '')
    }
  },
  created() {
    this.getList()
  },
  mounted() {},
  methods: {
    historyThis(row) {
      this.historyModal = true
      this.historyList = [
        {
          content: '包含敏感信息或广告, 予以删除',
          createTime: '2020-11-21 20:46',
          type: 'danger'
        },
        {
          content: '资料缺失',
          createTime: '2018-04-03 20:46',
          type: 'danger'
        },
        {
          content: '标题违规',
          createTime: '2018-04-03 20:46',
          type: 'danger'
        },
        {
          content: '信息不充分',
          createTime: '2018-04-03 20:46',
          type: 'danger'
        }
      ]
    },
    detailThis(row) {
      this.detailModal = true
      this.modalData = {
        poster:
          'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        bookName: '钢铁是怎样炼成的',
        createTime: new Date(),
        author: '李大壮',
        publishOrgName: '中国人民出版社'
      }
    },
    passThis(row) {
      this.$confirm('是否通过审核', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('审核通过')
          this.getList()
        })
        .catch(() => {
          this.$message.info('操作取消')
        })
    },
    backThis(row) {
      this.backModal = true
      this.modalData = row
    },
    confirmBack() {
      if (this.backInfo.trim().length == 0) {
        return this.$message.warning('驳回信息不能改为空')
      }
      this.$message.success('资源驳回成功')
      this.$store.state.color = '1'
      this.backModal = false
      this.getList()
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.$get('/api/users/getAll', {
        pageNow: this.listQuery.page,
        pageSize: this.listQuery.limit,
        ...this.listQuery
      })
        .then((res) => {
          this.listLoading = false
          if (res.code != 200) {
            return this.$notify({
              title: '失败',
              message: res.message,
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
    handleAvatarSuccess(res, file) {
      this.$nextTick(() => {
        this.isAddModal
          ? (this.addFormData.logo = res.data)
          : (this.editFormData.logo = res.data)
      })
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 1

      if (!isLt2M) {
        this.$message.error('上传预览图大小不能超过 1MB!')
      }
      return isLt2M
    }
  }
}
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
