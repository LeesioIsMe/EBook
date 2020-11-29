<template>
  <div class="container">
    <div class="detail">
      <div class="left">
        <div class="avatar">
          <img :src="userDetail.avatar" alt="用户头像">
          <el-upload
            action="/api/upload/image"
            :headers="{
              Authorization: $store.state.user.token,
            }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <el-button
              size="small"
              style="width: 250px"
              type="success"
              plain
            >更换头像</el-button>
          </el-upload>
        </div>
        <div class="basic">
          <el-form
            label-width="90px"
            :model="userDetail"
            @submit.prevent.native="() => false"
          >
            <el-form-item label="昵称">
              <template v-if="!editInfo">
                <span>{{ userDetail.nickname }}</span>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="editInfo = true"
                />
              </template>
              <el-input v-else v-model="userDetail.nickname" size="small" />
            </el-form-item>
            <el-form-item label="出生年月">
              <template v-if="!editInfo">
                {{ userDetail.birth }}
              </template>
              <el-input v-else v-model="userDetail.birth" size="small" />
            </el-form-item>
            <el-form-item label="邮箱">
              <template v-if="!editInfo">
                {{ userDetail.email }}
              </template>
              <el-input v-else v-model="userDetail.email" size="small" />
            </el-form-item>
            <el-form-item label="性别">
              <template v-if="!editInfo">
                {{ userDetail.sex | genderFilter }}
              </template>
              <el-input v-else v-model="userDetail.sex" size="small" />
            </el-form-item>
            <el-form-item label="联系方式">
              <template v-if="!editInfo">
                {{ userDetail.phoneNumber }}
              </template>
              <el-input v-else v-model="userDetail.phoneNumber" size="small" />
            </el-form-item>
            <el-form-item label="资源上传量">
              {{ userDetail.upNumber }}
            </el-form-item>
            <el-form-item label="资源下载量">
              {{ userDetail.downNumber }}
            </el-form-item>
            <el-form-item label="注册时间">
              {{ userDetail.createTime | parseTime }}
            </el-form-item>
            <el-button
              v-if="editInfo"
              size="small"
              type="primary"
              @click="saveBasicInfo"
            >保存</el-button>
            <el-button
              v-if="editInfo"
              size="small"
              @click="getUserInfo"
            >取消</el-button>
          </el-form>
        </div>
      </div>
      <div class="download">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>资源下载排行</span>
            <el-button
              style="float: right; padding: 3px 0"
              type="text"
              @click="$router.push('/ebook')"
            >
              查看更多
            </el-button>
          </div>
          <div v-for="(v, i) in downloadList" :key="i" class="text item">
            <span>{{ v.bookName }}</span>
            <span>{{ v.downloadTimes || 0 }}次</span>
          </div>
        </el-card>
      </div>
    </div>
    <div class="read">
      <el-button-group>
        <el-button type="primary" @click="getPayByDate(1)">今日</el-button>
        <el-button type="primary" @click="getPayByDate(2)">一周内</el-button>
        <el-button type="primary" @click="getPayByDate(3)">一月内</el-button>
      </el-button-group>
      <div
        :id="id"
        :class="className"
        :style="{ height: '300px', width: '100%' }"
      />
    </div>
  </div>
</template>
<script>
import echarts from 'echarts'
import {
  validUsername,
  validPhone,
  validUserNo,
  validPassword
} from '@/utils/validate'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
export default {
  name: 'User',
  directives: { waves },
  filters: {
    typeFilter(data) {
      return data == 0 ? '管理员' : '普通用户'
    },
    genderFilter(data) {
      return data == 1 ? '男' : '女'
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
        new Error('用户名由字母开头，长度8～20的数字、字母组成，请检查用户名')
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
    return {
      userDetail: {},
      editInfo: false,
      id: 'myChart',
      className: 'my-chart',
      chart: null
    }
  },
  computed: {
    userInfo() {
      return localStorage.getItem('userInfo')
    }
  },
  created() {
    this.getUserInfo()
    this.getDownList()
    this.getPayByDate(1)
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this.timer)
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    saveBasicInfo() {
      this.editInfo = false
      this.$message.success('修改成功')
    },
    getDownList() {
      this.downloadList = [
        {
          id: 1,
          bookName: '钢铁怎样练成的',
          downloadTimes: 2500
        },
        {
          id: 2,
          bookName: '菊花与锚',
          downloadTimes: 102200
        },
        {
          id: 3,
          bookName: '环球网-环球军事网',
          downloadTimes: 10000000
        },
        {
          id: 4,
          bookName: '舰载武器',
          downloadTimes: 2000
        },
        {
          id: 5,
          bookName: '制式武器',
          downloadTimes: 100000
        }
      ]
    },
    getUserInfo() {
      this.editInfo = false
      this.$get('/api/user/info').then((res) => {
        if (res.code != 200) {
          this.$message.error(res.msg)
          return
        }
        this.userDetail = res.data
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
            return v[j] == 0 ? '男' : '女'
          } else {
            return v[j]
          }
        })
      )
    },
    handleAvatarSuccess(res, file) {
      if (res.code != 200) return this.$message.error(res.msg)
      this.userDetail.avatar = res.data.url
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 1
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 1MB!')
      }
      return isLt2M
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        backgroundColor: '#fff',
        title: {
          top: 20,
          text: '阅读总量',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 14,
            color: '#3989c7'
          },
          left: '1%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#57617B'
            }
          }
        },
        legend: {
          top: 20,
          icon: 'rect',
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          data: ['阅读数量'],
          right: '4%',
          textStyle: {
            fontSize: 12,
            color: '#3989c7'
          }
        },
        grid: {
          top: 100,
          left: '2%',
          right: '2%',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: true,
            axisLine: {
              lineStyle: {
                color: '#3989c7'
              }
            },
            data: this.chartXaxisData
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '(次)',
            axisTick: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#3989c7'
              }
            },
            axisLabel: {
              margin: 10,
              textStyle: {
                fontSize: 14
              }
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: '#3989c7'
              }
            }
          }
        ],
        series: [
          {
            name: '日期',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0,
                  0,
                  0,
                  1,
                  [
                    {
                      offset: 0,
                      color: 'rgba(137, 189, 27, 0.3)'
                    },
                    {
                      offset: 0.8,
                      color: 'rgba(137, 189, 27, 0)'
                    }
                  ],
                  false
                ),
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
              }
            },
            itemStyle: {
              normal: {
                color: 'rgb(137,189,27)',
                borderColor: 'rgba(137,189,2,0.27)',
                borderWidth: 12
              }
            },
            data: this.chartYaxisData
          }
        ]
      })
    },
    getPayByDate(type) {
      this.$get('/api/getPayByDate', {
        type
      }).then((res) => {
        if (res.code != 200) {
          return this.$notify({
            title: '失败',
            message: res.msg,
            type: 'error'
          })
        }
        // this.chartXaxisData = res.data.date.reverse();
        // this.chartYaxisData = res.data.amount.reverse();
        if (type == 1) {
          this.chartXaxisData = [
            '00:00',
            '01:00',
            '02:00',
            '03:00',
            '04:00',
            '05:00',
            '06:00',
            '07:00',
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00',
            '21:00',
            '22:00',
            '23:00'
          ]
        } else if (type == 2) {
          this.chartXaxisData = [
            '11-01',
            '11-02',
            '11-03',
            '11-04',
            '11-05',
            '11-06',
            '11-07'
          ]
        } else if (type == 3) {
          this.chartXaxisData = [
            '2020-06',
            '2020-07',
            '2020-08',
            '2020-09',
            '2020-10',
            '2020-11',
            '2020-12'
          ]
        } else {
          this.chartXaxisData = [
            '2020-06',
            '2020-07',
            '2020-08',
            '2020-09',
            '2020-10',
            '2020-11',
            '2020-12'
          ]
        }

        this.chartYaxisData = [100, 2000, 30000, 1, 123, 40593, 12111]
        this.initChart()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
}
.detail {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .left {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    .avatar {
      width: 280px;
      padding-right: 30px;
      position: relative;
      img {
        width: 100%;
        height: 250px;
        display: block;
        box-shadow: 0 0 4px #999;
        border-radius: 4px;
      }
      &::after {
        content: "";
        position: absolute;
        right: 0;
        top: 1px;
        height: 280px;
        width: 1px;
        background: linear-gradient(
          to bottom,
          rgb(233, 233, 233),
          rgb(0, 0, 0),
          rgb(233, 233, 233)
        );
      }
    }
  }
  .basic {
    padding-left: 30px;
    .el-form-item {
      margin-bottom: 0;
    }
  }
  .download {
    min-width: 380px;
    // width: 100%;
    margin-bottom: 20px;
    .text {
      font-size: 14px;
    }
    .item {
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      span:nth-of-type(1) {
        display: inline-block;
        width: calc(100% - 100px);
        overflow: hidden;
        text-overflow: ellipsis;
      }
      span:nth-of-type(2) {
        display: inline-block;
        width: 100px;
        text-align: right;
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
    .box-card {
      width: 100%;
    }
  }
}
.read {
  padding: 20px;
}

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
