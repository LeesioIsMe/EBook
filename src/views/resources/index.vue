<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
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
      >搜索</el-button>
      <el-button
        v-if="isShowAdd"
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="addBookTrigger"
      >添加</el-button>
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
              :src="row.cover"
              lazy
              :preview-src-list="[row.cover]"
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
        label="上传用户"
        width="150px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.createUserName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.createTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.modifiedTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
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
          <el-button size="mini" @click="historyThis(row)">历史</el-button>
          <el-button
            size="mini"
            type="primary"
            @click="detailThis(row)"
          >查看</el-button>
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
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
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
    <template v-if="addEditModal">
      <book-add-edit
        :type="type"
        :title="title"
        :rules="rules"
        :modal="addEditModal"
        :form-data="formData"
        @saveForm="saveForm"
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
    'audit-history': () => import('@/components/View/Book/auditHistory'),
    'book-add-edit': () => import('@/components/View/Book/index')
  },
  directives: { waves },
  filters: {},
  props: {
    isShowAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      categoryList:
        (localStorage.getItem('category') &&
          JSON.parse(localStorage.getItem('category'))) ||
        [],
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        keyword: '',
        categoryId: ''
      },
      // 弹窗中的数据
      rules: {},
      modalData: {},
      historyModal: false,
      historyList: [],
      detailModal: false,
      backModal: false,
      backInfo: '',
      title: '',
      addEditModal: false,
      formData: {}
    }
  },
  watch: {
    historyModal(newV) {
      if (!newV) (this.modalData = {}), (this.historyList = [])
    },
    detailModal(newV) {
      if (!newV) this.modalData = {}
    },
    backModal(newV) {
      if (!newV) (this.modalData = {}), (this.backInfo = '')
    },
    addEditModal(newV) {
      if (!newV) (this.formData = {}), (this.title = ''), (this.type = 0)
    }
  },
  created() {
    this.getList()
  },
  mounted() {},
  methods: {
    historyThis(row) {
      this.historyModal = true
      this.$get('/api/book/getBookFindingsAll/' + row.id).then((res) => {
        this.historyList = res.data
      })
    },
    detailThis(row) {
      this.detailModal = true
      this.$get('/api/book/getInfo/' + row.id).then((res) => {
        this.modalData = res.data
      })
    },
    passThis(row) {
      this.$confirm('是否通过审核', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          this.auditThisConnfirm(row)
        })
        .catch(() => {
          this.$message.info('操作取消')
        })
    },
    auditThisConnfirm(row, backStatus) {
      this.$post('/api/book/examine', {
        status: backStatus ? 3 : 2,
        bookId: row.id,
        createUser: this.$store.state.user.id,
        findings: backStatus ? this.backInfo : '通过'
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg)
        }
        this.$message.success(backStatus ? '驳回成功' : '审核通过')
        this.getList()
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
      this.auditThisConnfirm(this.modalData, true)
      this.backModal = false
      this.getList()
    },

    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    getList() {
      console.log(this.listQuery)
      var params = { ...this.listQuery }
      params.categoryId = params.categoryId
        ? params.categoryId[params.categoryId.length - 1]
        : ''
      this.listLoading = true
      this.$get('/api/book/findBookList', {
        status: 1,
        ...params
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
          this.list = res.data.rows
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
          ? (this.addFormData.logo = res.data.url)
          : (this.editFormData.logo = res.data.url)
      })
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 1

      if (!isLt2M) {
        this.$message.error('上传预览图大小不能超过 1MB!')
      }
      return isLt2M
    },
    addBookTrigger() {
      this.addEditModal = true
      this.title = '资源添加'
      this.type = 0
    },
    saveForm() {
      console.log(this.formData)
      var params = Object.assign({}, this.formData)
      params.cover = (params.cover && params.cover.join(',')) || ''
      params.categoryId = params.categoryId
        ? params.categoryId[params.categoryId.length - 1]
        : ''
      this.$post('/api/book/add', params).then((res) => {
        console.log(res)
        if (res.code != 200) {
          return this.$message.error(res.msg)
        }
        this.$message.success('添加成功')
        this.addEditModal = false
        this.getList()
      })
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
