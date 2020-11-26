<template>
  <div class="statistic">
    <div class="total">
      <el-button-group>
        <el-button
          size="small"
          :type="activeType == 1 ? 'primary' : ''"
          @click="getTotalData(1)"
        >日</el-button>
        <el-button
          size="small"
          :type="activeType == 2 ? 'primary' : ''"
          @click="getTotalData(2)"
        >周</el-button>
        <el-button
          size="small"
          :type="activeType == 3 ? 'primary' : ''"
          @click="getTotalData(3)"
        >月</el-button>
        <el-button
          size="small"
          :type="activeType == 4 ? 'primary' : ''"
          @click="getTotalData(4)"
        >年</el-button>
      </el-button-group>
      <h3 class="total-count">
        <span @click="getTypeChart(1)">图书总量:<i>21234324234</i></span>
        <span @click="getTypeChart(2)">下载总量:<i>21234324234</i></span>
        <span @click="getTypeChart(3)">借阅总量:<i>21234324234</i></span>
        <span @click="getTypeChart(4)">上传总量:<i>21234324234</i></span>
      </h3>
    </div>
    <div class="chart">
      <div
        :id="id"
        :class="className"
        class="my-chart"
        :style="{ height: '300px', width: '50%' }"
      />
      <div class="category">
        <el-card class="box-card">
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
          </div>
          <div v-for="(v, i) in categoryList" :key="i" class="text item">
            <span>{{ v.name }}</span>
            <span>{{ v.count || 0 }}册</span>
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
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>借阅量排行</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            @click="$router.push('/ebook')"
          >
            查看更多
          </el-button>
        </div>
        <div v-for="(v, i) in rendList" :key="i" class="text item">
          <span>{{ v.bookName }}</span>
          <span>{{ v.downloadTimes || 0 }}次</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  data() {
    return {
      chart: null,
      id: 'myChart',
      className: 'my-chart',
      payList: [],
      pipData: [],
      activeType: 1,
      downloadList: [],
      rendList: [],
      categoryList: [],
      chartType: 1
    }
  },
  created() {
    this.getRankList()
    this.getDoomByStatus()
    this.getCategoryList()
  },
  mounted() {},
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    getTotalData(type) {
      if (this.activeType == type) return
      this.activeType = type
    },
    getTypeChart(type) {
      if (this.chartType == type) return
      this.chartType = type
    },
    getRankList() {
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
        },
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
        },
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
        },
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
      this.rendList = [
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
    getCategoryList() {
      this.categoryList = [
        {
          id: 1,
          name: '社会科学',
          count: 10000
        },
        {
          id: 1,
          name: '自然科学',
          count: 10000
        },
        {
          id: 1,
          name: '人文科学',
          count: 10000
        },
        {
          id: 1,
          name: '新闻',
          count: 10000
        }
      ]
    },
    getDoomByStatus() {
      this.$get('/api/getDoomByStatus').then((res) => {
        if (res.code != 200) {
          return this.$notify({
            title: '失败',
            message: res.message,
            type: 'error'
          })
        }
        this.pipData = res.data
        this.initPipChart()
      })
    },
    initPipChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        tooltip: {
          trigger: 'item'
          // formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['欠费停电', '正常使用']
        },
        series: [
          {
            name: '资源数量',
            type: 'pie',
            roseType: 'radius',
            radius: [80, 95],
            color: ['#65b687', '#409eff'],
            center: ['50%', '45%'],
            data: [
              {
                value: this.pipData.find((v) => v.status == 0).count || 0,
                name: '欠费停电'
              },
              {
                value: this.pipData.find((v) => v.status == 1).count || 0,
                name: '正常使用'
              }
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
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
    height: 300px;
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
