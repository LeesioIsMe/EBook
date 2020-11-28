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
          <span>{{ (listQuery.pageNum - 1) * listQuery.pageSize + $index + 1 }}</span>
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
            type="primary"
            @click="detailThis(row)"
          >查看</el-button>
          <el-button
            size="mini"
            type="warning"
            @click="editThis(row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="warning"
            @click="upDownThis(row)"
          >下架</el-button>
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
  filters: {},
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
        pageNum: 1,
        pageSize: 20,
        keyword: '', categoryId: ''
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
      this.addEditModal = true
      this.title = '资源编辑'
      this.formData = Object.assign(row, {})
      this.type = 1
    },
    detailThis(row) {
      this.detailModal = true
      this.modalData = row
    },
    upDownThis(row) {
      this.$confirm('是否要删除下架当前资源', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('下架成功')
          this.getList()
        })
        .catch(() => {
          this.$message.info('操作取消')
        })
    },
    deleteThis(row) {
      this.$confirm('是否要删除当前资源', '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
        .catch(() => {
          this.$message.info('操作取消')
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
    addBookTrigger() {
      this.addEditModal = true
      this.title = '资源添加'
      this.type = 0
    },
    saveForm() {
      console.log(this.formData)
      this.$message.success('添加成功')
      this.addEditModal = false
    },
    editForm() {
      console.log(this.formData)
      this.$message.success('编辑成功')
      this.addEditModal = false
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
