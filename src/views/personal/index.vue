<template>
  <div class="container">
    <div class="detail">
      <div class="left">
        <div class="avatar">
          <img :src="userDetail.avatar" alt="用户头像" />
          <el-upload
            action="/api/upload/image"
            :headers="{
              Authorization: $store.state.user.token,
            }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <el-button size="small" style="width: 250px" type="success" plain
              >更换头像</el-button
            >
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
              <el-date-picker
                v-else
                type="date"
                v-model="userDetail.birth"
                size="small"
              />
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
              <el-select v-else v-model="userDetail.sex" size="small">
                <el-option
                  v-for="(v, i) in genderList"
                  :key="i"
                  :value="v.value"
                  :label="v.label"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="联系方式">
              <template v-if="!editInfo">
                {{ userDetail.phoneNumber }}
              </template>
              <el-input v-else v-model="userDetail.phoneNumber" size="small" />
            </el-form-item>
            <el-form-item label="资源上传量">
              {{ userDetail.upCount }}
            </el-form-item>
            <el-form-item label="资源下载量">
              {{ userDetail.downCount }}
            </el-form-item>
            <el-form-item label="注册时间">
              {{ userDetail.createTime | parseTime }}
            </el-form-item>
            <el-button
              v-if="editInfo"
              size="small"
              type="primary"
              @click="saveBasicInfo"
              >保存</el-button
            >
            <el-button v-if="editInfo" size="small" @click="getUserInfo"
              >取消</el-button
            >
          </el-form>
        </div>
      </div>
      <div class="download">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人资源被下载量排行</span>
          </div>
          <div v-for="(v, i) in downloadList" :key="i" class="text item">
            <span>{{ v.bookName }}</span>
            <span>{{ v.occ || 0 }}次</span>
          </div>
          <p
            v-if="downloadList.length == 0"
            style="text-align: center; font-size: 14px; color: #999"
          >
            暂无数据
          </p>
        </el-card>
      </div>
    </div>
    <div class="read">
      <el-button-group>
        <el-button
          :type="activeType == 1 ? 'primary' : ''"
          @click="getCountByDay(1)"
          >一周内</el-button
        >
        <el-button
          :type="activeType == 2 ? 'primary' : ''"
          @click="getCountByDay(2)"
          >一月内</el-button
        >
        <el-button
          :type="activeType == 3 ? 'primary' : ''"
          @click="getCountByDay(3)"
          >半年内</el-button
        >
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
import echarts from "echarts";
import {
  validUsername,
  validPhone,
  validUserNo,
  validPassword,
} from "@/utils/validate";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
export default {
  name: "Personal",
  directives: { waves },
  filters: {
    typeFilter(data) {
      return data == 0 ? "管理员" : "普通用户";
    },
    genderFilter(data) {
      return data == 0 ? "男" : data == 1 ? "女" : "保密";
    },
  },
  data() {
    const validateUserNo = (rule, value, callback) => {
      if (!validUserNo(value)) {
        callback(new Error("编号由8～20位数字组成，请检查编号"));
      } else {
        callback();
      }
    };
    const validatePhone = (rule, value, callback) => {
      if (!value) return callback();
      if (!validPhone(value)) {
        callback(new Error("手机号格式不正确，请检查手机号"));
      } else {
        callback();
      }
    };
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        new Error("用户名由字母开头，长度8～20的数字、字母组成，请检查用户名");
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error("密码由8～20位数字、字母组成，请检查格式"));
      } else {
        callback();
      }
    };
    return {
      genderList: [
        { label: "男", value: 0 },
        { label: "女", value: 1 },
        { label: "保密", value: 2 },
      ],
      userDetail: {},
      editInfo: false,
      id: "myChart",
      className: "my-chart",
      chart: null,
      chartXaxisData: [],
      chartYaxisData: [],
      downloadList: [],
      activeType: 0,
    };
  },
  computed: {
    userInfo() {
      return localStorage.getItem("userInfo");
    },
  },
  created() {
    this.getUserInfo();
    this.getDownList();
    this.getCountByDay(1);
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this.timer);
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    saveBasicInfo() {
      this.editInfo = false;
      this.$post("/api/user/update", this.userDetail).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        localStorage.setItem("userInfo", JSON.stringify(this.userDetail));
        this.$store.dispatch("user/getInfo", JSON.stringify(this.userDetail));
        this.getUserInfo();
      });
    },
    getDownList() {
      this.$get("/api/rank/findRanking", {
        type: 2,
        createUser: this.$store.state.id,
      }).then((res) => {
        if (res.code != 200) {
          return this.$notify({
            title: "失败",
            message: res.msg,
            type: "error",
          });
        }
        this.downloadList = res.data;
      });
    },
    getUserInfo() {
      this.editInfo = false;
      this.$post("/api/user/info", {
        id: this.$store.state.user.id,
      }).then((res) => {
        if (res.code != 200) {
          this.$message.error(res.msg);
          return;
        }
        this.userDetail = res.data;
      });
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === "createTime") {
            return parseTime(v[j]);
          } else if (j === "type") {
            return v[j] == 0 ? "管理员" : "普通用户";
          } else if (j === "sex") {
            return v[j] == 0 ? "男" : v[j] == 1 ? "女" : "保密";
          } else {
            return v[j];
          }
        })
      );
    },
    handleAvatarSuccess(res, file) {
      if (res.code != 200) return this.$message.error(res.msg);
      this.userDetail.avatar = res.data.url;
      this.saveBasicInfo();
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 1;
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 1MB!");
      }
      return isLt2M;
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id));
      this.chart.setOption({
        backgroundColor: "#fff",
        title: {
          top: 20,
          text: "被阅读总量",
          textStyle: {
            fontWeight: "normal",
            fontSize: 14,
            color: "#3989c7",
          },
          left: "1%",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            lineStyle: {
              color: "#57617B",
            },
          },
        },
        legend: {
          top: 20,
          icon: "rect",
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          data: ["阅读数量"],
          right: "4%",
          textStyle: {
            fontSize: 12,
            color: "#3989c7",
          },
        },
        grid: {
          top: 100,
          left: "2%",
          right: "2%",
          bottom: "2%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: true,
            axisLine: {
              lineStyle: {
                color: "#3989c7",
              },
            },
            data: this.chartXaxisData,
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "(次)",
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: "#3989c7",
              },
            },
            axisLabel: {
              margin: 10,
              textStyle: {
                fontSize: 14,
              },
            },
            splitLine: {
              show: false,
              lineStyle: {
                color: "#3989c7",
              },
            },
          },
        ],
        series: [
          {
            name: "日期",
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 5,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1,
              },
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
                      color: "rgba(137, 189, 27, 0.3)",
                    },
                    {
                      offset: 0.8,
                      color: "rgba(137, 189, 27, 0)",
                    },
                  ],
                  false
                ),
                shadowColor: "rgba(0, 0, 0, 0.1)",
                shadowBlur: 10,
              },
            },
            itemStyle: {
              normal: {
                color: "rgb(137,189,27)",
                borderColor: "rgba(137,189,2,0.27)",
                borderWidth: 12,
              },
            },
            data: this.chartYaxisData,
          },
        ],
      });
    },
    getCountByDay(type) {
      if (this.activeType == type) return;
      this.activeType = type;
      var day = 0;
      if (type == 1) day = 7;
      if (type == 2) day = 30;
      if (type == 3) day = 183;
      this.$get("/api/rank/coverReadCount", {
        type: 1,
        day,
      }).then((res) => {
        if (res.code != 200) {
          return this.$notify({
            title: "失败",
            message: res.msg,
            type: "error",
          });
        }
        this.chartXaxisData = [];
        this.chartYaxisData = [];
        res.data.map((v) => {
          this.chartXaxisData.push(v.sdate);
          this.chartYaxisData.push(v.coverRead);
        });
        this.initChart();
      });
    },
  },
};
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
      height: 320px;
      /deep/ .el-card__body {
        height: 270px;
        overflow: auto;
      }
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
  width: 280px;
  height: 280px;
  display: block;
}
</style>
