<template>
  <page-header-wrapper>
    <a-card style="margin-bottom:20px">
      <template slot="extra">
        <a-range-picker
          :defaultValue="timeRange"
          @change="(dates,dateStrings)=>onChange(dates,dateStrings)"
        />
      </template>

      <div>
        <mini-smooth-area :style="{ height: '120px' }" :dataSource="data" :scale="scale" />
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { MiniSmoothArea } from '@/components'
import { getOrderStatistics } from '@/api/statistics'
import { notification } from 'ant-design-vue'
export default {
  name: 'OrderStatistics',
  components: { MiniSmoothArea },
  created() {
    const params = {
      startTime: this.timeRange[0].format("YYYY-MM-DD"),
      endTime: this.timeRange[1].format("YYYY-MM-DD"),
    }
    this.getOrderStatistics(params)
  },
  data() {
    return {
      timeRange: [moment().subtract(7, 'days'), moment()],
      data: [],
      scale: [
        {
          dataKey: 'x',
          alias: '时间',
        },
        {
          dataKey: 'y',
          alias: '订单量',
        },
      ],
    }
  },
  methods: {
    onChange(dates, dateStrings) {
      const params = {
          startTime : dateStrings[0],
          endTime : dateStrings[1]
      }
      this.data = []
      this.getOrderStatistics(params)
    },
    getOrderStatistics(params) {
      getOrderStatistics(params).then((res) => {
        if (res.success) {
          const data = res.data.data
          data.forEach(item=>{
              this.data.push({
                  x : item.orderDate,
                  y : `${item.count},销售额:${item.amount}`,
              })
          })
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
      })
    },
  },
}
</script>

<style scoped>
</style>