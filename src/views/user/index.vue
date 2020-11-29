<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.userNo"
        placeholder="编号"
        style="width: 150px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.name"
        placeholder="姓名"
        style="width: 150px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.type"
        placeholder="用户类型"
        clearable
        class="filter-item"
        style="width: 150px"
      >
        <el-option
          v-for="(item, i) in typeList"
          :key="i"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select
        v-model="listQuery.gender"
        placeholder="用户性别"
        clearable
        class="filter-item"
        style="width: 150px"
      >
        <el-option
          v-for="(item, i) in genderList"
          :key="i"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="addUserTrigger"
      >添加</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
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
      <el-table-column label="用户类型" width="150px">
        <template slot-scope="{ row }">
          <span>{{ row.type | typeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="账号" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :show-overflow-tooltip="true"
        label="昵称"
        width="150px"
        align="center"
      >
        <template slot-scope="{ row }">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center" width="120px">
        <template slot-scope="{ row }">
          <span>
            <el-image
              v-if="row.avatar"
              style="width: 50px; height: 50px"
              :src="row.avatar"
              lazy
              :preview-src-list="[row.avatar]"
            />
            <span v-else>-</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.sex | genderFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出生年月" align="center" width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.birth | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.phone_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上传数" align="center" width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.up_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下载数" align="center" width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.down_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="借阅书" align="center" width="80px">
        <template slot-scope="{ row }">
          <span>{{ row.read_number }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.createTime | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="350"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="row.status != 'published'"
            size="mini"
            type="primary"
            @click="detailThis(row)"
          >详情</el-button>
          <el-button
            v-if="row.status != 'published'"
            size="mini"
            type="warning"
            @click="passwordReset(row)"
          >重置密码</el-button>
          <el-button
            type="warning"
            size="mini"
            @click="editThis(row)"
          >编辑</el-button>
          <el-button
            v-if="row.status != 'deleted'"
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
      <user-detail :user-info="modalData" />
    </el-dialog>
    <template v-if="addEditModal">
      <user-add-edit
        :rules="rules"
        :type="type"
        :title="title"
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
    'user-detail': () => import('@/components/View/User/detail'),
    'user-add-edit': () => import('@/components/View/User/index')
  },
  directives: { waves },
  filters: {
    typeFilter(data) {
      return data == 0 ? '管理员' : '普通用户'
    },
    genderFilter(data) {
      return data == 0 ? '男' : data == 1 ? '女' : '保密'
    }
  },
  data() {
    const validateUserNo = (rule, value, callback) => {
      if (!validUserNo(value)) {
        callback(new Error('编号由8～20位数字组成，请检查编号'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!value) return callback()
      if (!validPhone(value)) {
        callback(new Error('手机号格式不正确，请检查手机号'))
      } else {
        callback()
      }
    }
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(
          new Error('用户名由字母开头，长度8～20的数字、字母组成，请检查用户名')
        )
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error('密码由8～20位数字、字母组成，请检查格式'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value != this.formData.password) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    }
    return {
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
      downloadLoading: false,
      typeList: [
        { label: '管理员', value: 0 },
        { label: '普通用户', value: 1 }
      ],
      genderList: [
        { label: '全部', value: '' },
        { label: '男', value: 0 },
        { label: '女', value: 1 },
        { label: '保密', value: 2 }
      ],

      // 弹窗中的数据
      rules: {
        username: [
          { required: true, message: '用户账号不能为空' },
          { trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, message: '用户密码不能为空' },
          { trigger: 'blur', validator: validatePassword }
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空' },
          { trigger: 'blur', validator: validateConfirmPassword }
        ],
        type: [{ required: true, message: '用户类型不能为空' }]
      },
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
    addUserTrigger() {
      this.addEditModal = true
      this.title = '用户添加'
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
    },
    deleteThis(row) {
      this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('删除成功')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作取消'
          })
        })
    },
    editThis(row) {
      this.addEditModal = true
      this.title = '用户编辑'
      this.formData = Object.assign({}, row)
      this.type = 1
    },
    detailThis(row) {
      this.detailModal = true
      this.modalData = row
    },
    passwordReset(row) {
      this.$confirm('此操作将重置该用户密码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('重置成功')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '操作取消'
          })
        })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.$get('/api/usere/findUserList', {
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
          '用户账号',
          '用户昵称',
          '用户性别',
          '邮箱',
          '头像地址',
          '联系方式',
          '上传量',
          '下载量',
          '借阅量',
          '注册时间',
          '修改时间'
        ]
        const filterVal = [
          'type',
          'username',
          'nickname',
          'sex',
          'email',
          'avatar',
          'phone_number',
          'up_number',
          'down_number',
          'read_number',
          'createTime',
          'modifiedTime'
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
          } else if (j === 'gender') {
            return v[j] == 0 ? '男' : v[j] == 1 ? '女' : '保密'
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
