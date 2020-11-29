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
      <el-table-column label="状态" width="100px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            (row.status == 1) | statusFilter(row.status, row.upDown)
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
              v-if="row.bookUrl"
              style="width: 50px; height: 50px"
              :src="row.bookUrl"
              lazy
              :preview-src-list="[row.bookUrl]"
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
        align="left"
        width="300"
        fixed="right"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            size="mini"
            type="primary"
            @click="detailThis(row)"
          >查看</el-button>
          <el-button
            size="mini"
            type="warning"
            @click="editThis(row)"
          >修改</el-button>
          <el-button
            v-if="row.status == 2"
            size="mini"
            :type="row.upDown == 1 ? 'warning' : 'success'"
            @click="upDownThis(row)"
          >{{ row.upDown == 1 ? "下架" : "上架" }}</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteThis(row)"
          >删除</el-button>
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
      <book-detail :book-data="modalData" :is-show-history="isShowHistory" />
    </el-dialog>
    <template v-if="addEditModal">
      <book-add-edit
        :type="type"
        :title="title"
        :rules="rules"
        :modal="addEditModal"
        :form-data="formData"
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
    'book-add-edit': () => import('@/components/View/Book/index')
  },
  directives: { waves },
  filters: {
    statusFilter(data, status, upDown) {
      if (status == 1) {
        return '待审核'
      } else if (status == 2 && upDown == 1) {
        return '审核通过-已上架'
      } else if (status == 2 && upDown == 2) {
        return '审核通过-已下架'
      } else {
        return '被驳回'
      }
    }
  },
  props: {
    isShowAdd: {
      type: Boolean,
      default: true
    },
    isShowHistory: {
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
      detailModal: false,
      addModal: false,
      editModal: false,
      addEditModal: false,
      formData: {},
      title: '',
      type: 0 // 0 添加 1 编辑
    }
  },
  watch: {
    detailModal(newV) {
      if (!newV) this.modalData = {}
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
    editThis(row) {
      this.$get('/api/book/getInfo/' + row.id).then((res) => {
        this.addEditModal = true
        this.title = '资源编辑'
        this.type = 1
        this.formData = res.data
      })
    },
    detailThis(row) {
      this.detailModal = true
      this.$get('/api/book/getInfo/' + row.id).then((res) => {
        this.modalData = res.data
      })
    },
    upDownThis(row) {
      this.$confirm('是否要删除下架当前资源', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          this.upDownThisComfirm(row)
        })
        .catch(() => {
          this.$message.info('操作取消')
        })
    },
    upDownThisComfirm(row) {
      this.$post('/api/book/upDown', {
        id: row.id,
        upDown: row.upDown == 1 ? 2 : 1
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg)
        }
        this.$message.success((row.upDown == 1 ? '下架' : '上架') + '成功')
        this.getList()
      })
    },
    deleteThis(row) {
      this.$confirm('是否要删除当前资源', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          this.deleteThisConfirm(row)
        })
        .catch(() => {
          this.$message.info('操作取消')
        })
    },
    deleteThisConfirm(row) {
      this.$delete('/api/book/delete/' + row.id).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg)
        }
        this.$message.success('删除成功')
        this.getList()
      })
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
        status: '',
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
    editForm() {
      console.log(this.formData)
      var params = Object.assign({}, this.formData)
      params.cover = (params.cover && params.cover.join(',')) || ''
      params.categoryId = params.categoryId
        ? params.categoryId[params.categoryId.length - 1]
        : ''
      this.$post('/api/book/edit', params).then((res) => {
        console.log(res)
        if (res.code != 200) {
          return this.$message.error(res.msg)
        }
        this.$message.success('编辑成功')
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
