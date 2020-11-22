<template>
  <div class="statistic">
    <div style="padding:10px">
      <div :id="id" :class="className" :style="{height:'300px',width:'100%'}" />
    </div>
    <div style="display:flex;margin:20px 0">
      <div
        :id="id2"
        :class="className"
        class="chart-2"
        :style="{height:'300px',width:'calc(50% - 20px)'}"
      />
      <div class="todo-list">
        <ul>
          <li
            v-for="(item, i) in payList"
            :key="i"
            :title="item.doomInfo + (item.payType == 1 ? '现金' : item.payType == 2 ? '支付宝' : item.payType == 3 ? '微信' : '校园卡') + (item.amount >= 0 ? '缴费' : '扣款') + item.amount + '元'"
          >
            <strong
              style="color:#999"
            >{{item.doomInfo}} {{item.payType == 1 ? "现金" : item.payType == 2 ? "支付宝" : item.paytype == 3 ? "微信" : "校园卡" }}</strong>
            <span v-if="item.amount >= 0">
              <strong style="color:green">缴费 {{Math.abs(item.amount)}}</strong>元
            </span>
            <span v-else>
              <strong style="color:#f22424">扣款 {{Math.abs(item.amount)}}</strong>元
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";

export default {
  data() {
    return {
      chart: null,
      chart2: null,
      id: "myChart",
      className: "my-chart",
      id2: "myChart2",
      timer: null,
      payList: [],
      chartXaxisData: [],
      chartYaxisData: [],
      pipData: []
    };
  },
  created() {
    this.getPayList();
  },
  mounted() {
    this.getPayByDate();
    this.getDoomByStatus();
    var i = 0;
    this.timer = setInterval(() => {
      document.querySelector(".todo-list ul").style.transform =
        "translateY(" + "-" + i * 50 + "px)";
      this.payList.push(this.payList[i]);
      i++;
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    if (!this.chart) {
      return;
    }
    if (!this.chart2) {
      return;
    }
    this.chart.dispose();
    this.chart2.dispose();
    this.chart = null;
    this.chart2 = null;
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id));
      this.chart.setOption({
        backgroundColor: "#fff",
        title: {
          top: 20,
          text: "缴费总量",
          textStyle: {
            fontWeight: "normal",
            fontSize: 14,
            color: "#3989c7"
          },
          left: "1%"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            lineStyle: {
              color: "#57617B"
            }
          }
        },
        legend: {
          top: 20,
          icon: "rect",
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          data: ["缴费统计"],
          right: "4%",
          textStyle: {
            fontSize: 12,
            color: "#3989c7"
          }
        },
        grid: {
          top: 100,
          left: "2%",
          right: "2%",
          bottom: "2%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: "#3989c7"
              }
            },
            data: this.chartXaxisData
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "(元)",
            axisTick: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: "#3989c7"
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
                color: "#3989c7"
              }
            }
          }
        ],
        series: [
          {
            name: "缴费统计",
            type: "line",
            smooth: true,
            symbol: "circle",
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
                      color: "rgba(137, 189, 27, 0.3)"
                    },
                    {
                      offset: 0.8,
                      color: "rgba(137, 189, 27, 0)"
                    }
                  ],
                  false
                ),
                shadowColor: "rgba(0, 0, 0, 0.1)",
                shadowBlur: 10
              }
            },
            itemStyle: {
              normal: {
                color: "rgb(137,189,27)",
                borderColor: "rgba(137,189,2,0.27)",
                borderWidth: 12
              }
            },
            data: this.chartYaxisData
          }
        ]
      });
    },
    initPipChart() {
      this.chart2 = echarts.init(document.getElementById(this.id2));
      this.chart2.setOption({
        tooltip: {
          trigger: "item"
          // formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          left: "center",
          bottom: "10",
          data: ["欠费停电", "正常使用"]
        },
        series: [
          {
            name: "宿舍数",
            type: "pie",
            roseType: "radius",
            radius: [15, 95],
            color: ["#f22424", "#65b687"],
            center: ["50%", "45%"],
            data: [
              {
                value: this.pipData.find(v => v.status == 0).count || 0,
                name: "欠费停电"
              },
              {
                value: this.pipData.find(v => v.status == 1).count || 0,
                name: "正常使用"
              }
            ],
            animationEasing: "cubicInOut",
            animationDuration: 2600
          }
        ]
      });
    },
    getPayByDate() {
      this.$get("/api/getPayByDate").then(res => {
        if (res.code != 200) {
          return this.$notify({
            title: "失败",
            message: res.message,
            type: "error"
          });
        }
        this.chartXaxisData = res.data.date.reverse();
        this.chartYaxisData = res.data.amount.reverse();
        this.initChart();
      });
    },
    getDoomByStatus() {
      this.$get("/api/getDoomByStatus").then(res => {
        if (res.code != 200) {
          return this.$notify({
            title: "失败",
            message: res.message,
            type: "error"
          });
        }
        this.pipData = res.data;
        this.initPipChart();
      });
    },
    getPayList() {
      this.$get("/api/payment/paylist")
        .then(res => {
          if (res.code != 200) {
            return this.$notify({
              title: "失败",
              message: res.message,
              type: "error"
            });
          }
          this.payList = res.data;
        })
        .catch(err => {
          this.$message({
            message: "网络错误，请稍后再试",
            type: "warning"
          });
          console.log(err);
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.my-chart {
  box-shadow: 0 0 10px #ccc;
}
.chart-2 {
  margin-left: 10px;
}
.todo-list {
  width: calc(50% - 20px);
  margin-left: 20px;
  height: 300px;
  overflow: hidden;
  box-shadow: 0 0 10px #ccc;
}
.todo-list ul {
  list-style: none;
  padding-right: 20px;
  transition: 0.6s;
  margin-top: 0;
}
.todo-list ul li {
  border-bottom: 1px solid #f5f5f5;
  height: 50px;
  line-height: 50px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #999;
}
.todo-list ul li span:nth-of-type(1) {
  color: #666;
}
.todo-list ul li span:nth-of-type(2) {
  color: #f22424;
}
</style>