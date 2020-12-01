<template>
  <div class="statistic">
    <div class="total">
      <h3 class="total-count">
        <span @click="getTypeChart(1)"
          >图书总量:<i>{{ totalCount }}</i></span
        >
        <span @click="getTypeChart(2)"
          >下载总量:<i>{{ downCount }}</i></span
        >
        <span @click="getTypeChart(3)"
          >借阅总量:<i>{{ readCount }}</i></span
        >
      </h3>
    </div>
    <div class="chart">
      <div
        :id="id"
        :class="className"
        class="my-chart"
        :style="{ height: '500px', width: '50%' }"
      />
      <div class="category">
        <el-card class="box-card">
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span
              >{{
                v[
                  activeType == 1
                    ? "readCount"
                    : activeType == 2
                    ? "downCount"
                    : "addCount"
                ] || 0
              }}册</span
            >
          </div>
        </el-card>
      </div>
    </div>
    <div class="rank">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>资源下载排行</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            @click="$router.push('/category')"
          >
            查看更多资源
          </el-button>
        </div>
        <div v-for="(v, i) in downloadList" :key="i" class="text item">
          <span>{{ v.bookName }}</span>
          <span>{{ v.occ || 0 }}次</span>
        </div>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>借阅量排行</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            @click="$router.push('/category')"
          >
            查看更多资源
          </el-button>
        </div>
        <div v-for="(v, i) in rendList" :key="i" class="text item">
          <span>{{ v.bookName }}</span>
          <span>{{ v.occ || 0 }}次</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";

export default {
  name: "Statistic",
  data() {
    return {
      chart: null,
      id: "myChart",
      className: "my-chart",
      payList: [],
      pipData: [],
      activeType: 1,
      downloadList: [],
      rendList: [],
      categoryList:
        (localStorage.getItem("category") &&
          JSON.parse(localStorage.getItem("category"))) ||
        [],
      chartType: 1,
      totalCount: 0,
      downCount: 0,
      readCount: 0,
    };
  },
  created() {
    this.getReadRankList();
    this.getDownloadRankList();
    this.getTotalData();
    this.getCategoryList();
  },
  mounted() {},
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    getTotalData(type) {
      this.$get("/api/book/bookAllCount").then((res) => {
        this.totalCount = res.code != 200 ? 0 : res.data.addCount;
        this.readCount = res.code != 200 ? 0 : res.data.readCount;
        this.downCount = res.code != 200 ? 0 : res.data.downCount;
      });
    },
    getTypeChart(type) {
      if (this.activeType == type) return;
      this.activeType = type;
      console.dir(this.chart);
      this.chart.dispose();
      this.initPipChart();
    },
    getDownloadRankList() {
      this.$get("/api/rank/findRanking", {
        type: 2,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.downloadList = res.data;
      });
    },
    getReadRankList() {
      this.$get("/api/rank/findRanking", {
        type: 1,
      }).then((res) => {
        if (res.code != 200) {
          return this.$message.error(res.msg);
        }
        this.rendList = res.data;
      });
    },
    getCategoryList() {
      this.$get("/api/book/bookCategoryCount").then((res) => {
        this.categoryList = res.data || [];
        this.initPipChart();
      });
    },
    initPipChart() {
      this.chart = echarts.init(document.getElementById(this.id));
      this.chart.setOption({
        notMerge: true,
        tooltip: {
          trigger: "item",
          // formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          left: "center",
          bottom: "10",
          data: (this.categoryList &&
            this.categoryList
              .filter(
                (v) =>
                  (this.activeType == 1
                    ? v.readCount
                    : this.activeType == 2
                    ? v.downCount
                    : v.addCount) != 0
              )
              .reduce((prev, next) => prev.concat([next.name]), [])) || [
            "暂无数据",
          ],
        },
        series: [
          {
            name: "资源数量",
            type: "pie",
            roseType: "radius",
            radius: [80, 95],
            color: ["#65b687", "#409eff"],
            center: ["50%", "45%"],
            data: this.categoryList
              .filter(
                (v) =>
                  (this.activeType == 1
                    ? v.readCount
                    : this.activeType == 2
                    ? v.downCount
                    : v.addCount) != 0
              )
              .reduce(
                (prev, next) =>
                  prev.concat([
                    {
                      value:
                        this.activeType == 1
                          ? next.readCount
                          : this.activeType == 2
                          ? next.downCount
                          : next.addCount,
                      name: next.name,
                    },
                  ]),
                []
              ) || [{ value: 0, name: "暂无数据" }],
            animationEasing: "cubicInOut",
            animationDuration: 2600,
          },
        ],
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.chart {
  margin-top: 20px;
  padding-top: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 0 2px #ccc;
  border-radius: 4px;
  .category {
    width: 50%;
    height: 500px;
    .box-card {
      height: 100%;
      border: none;
      box-shadow: none;
      /deep/ .el-card__body {
        display: flex;
        flex-wrap: wrap;
        height: 100%;
        overflow: scroll;
        .item {
          height: 30px;
          line-height: 30px;
          font-size: 14px;
          color: #999;
          width: 200px;
        }
      }
    }
  }
}

.statistic {
  padding: 20px;
}
.total {
  .total-count {
    margin-top: 0;
    span {
      padding: 5px 5px;
      border-radius: 4px;
      cursor: pointer;
      &:hover {
        background: rgba(#999, 0.3);
      }
    }
    font-size: 18px;
    display: flex;
    justify-content: space-between;
    i {
      font-style: normal;
      margin-left: 5px;
      color: #409eff;
    }
  }
}
.rank {
  display: flex;
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
    width: 50%;
    /deep/ .el-card__body {
      height: 200px;
      overflow: auto;
    }
  }
}
</style>
