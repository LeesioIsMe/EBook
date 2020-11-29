<template>
  <div class="app-container">
    <book-search :is-show-history="false">
      <template slot="tableSlot">
        <el-table-column label="借阅时间" width="150px" align="center">
          <template slot-scope="{ row }">
            <span>{{
              row.createTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
          </template>
        </el-table-column>
      </template>
    </book-search>
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
    'book-search': () => import('@/components/View/Book/search')
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
      this.addEditModal = true
      this.title = '资源编辑'
      this.formData = Object.assign({}, row)
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
