<template>
  <page-header-wrapper>
    <a-card style="margin-bottom:20px">
      <number-info :total="total" :sub-total="total">
        <span slot="subtitle">
          <span>用户总计</span>
          <a-tooltip title="用户统计" slot="action">
            <a-icon type="info-circle-o" :style="{ marginLeft: '8px' }" />
          </a-tooltip>
        </span>
      </number-info>

      <div>
        <mini-smooth-area
          :style="{ height: '45px' }"
          :dataSource="memberData"
          :scale="searchUserScale"
        />
      </div>
    </a-card>
    <a-card>
      <a-table
        row-key="index"
        size="small"
        :columns="searchTableColumns"
        :dataSource="data.memberMonthStatisticsDtos"
        :pagination="{ pageSize: 12 }"
      >
        <template slot="month" slot-scope="text, record">
          <span>{{text}}月</span>
        </template>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { MiniSmoothArea, NumberInfo } from '@/components'
import { getMemberStatistics } from '@/api/statistics'
import { notification } from 'ant-design-vue'
const searchUserScale = [
  {
    dataKey: 'x',
    alias: '时间',
  },
  {
    dataKey: 'y',
    alias: '用户数',
  },
]
export default {
  name: 'MemberStatistics',
  components: {
    MiniSmoothArea,
    NumberInfo,
  },
  data() {
    return {
      total: 0,
      searchUserScale: searchUserScale,
      data: [],
      memberData: [],
      searchTableColumns: [
        {
          dataIndex: 'index',
          title: '序号',
          width: 90,
          align: 'center',
          customRender: (value, row, index) => {
            return index + 1
          },
        },
        {
          dataIndex: 'month',
          title: '月份',
          align: 'center',
          scopedSlots: { customRender: 'month' },
        },
        {
          dataIndex: 'total',
          title: '每月用户量',
          align: 'center',
        },
        {
          dataIndex: 'increment',
          title: '用户增长量',
          align: 'center',
          sorter: (a, b) => a.increment - b.increment,
          scopedSlots: { customRender: 'increment' },
        },
      ],
    }
  },
  created() {
    this.getMemberStatistics()
  },
  methods: {
    getMemberStatistics() {
      getMemberStatistics().then((res) => {
        if (res.success) {
          this.data = res.data.data
          this.total = this.data.total
          this.data.memberMonthStatisticsDtos.forEach((item) => {
            this.memberData.push({
              x: item.month + '月',
              y: item.total + '',
            })
          })
        } else {
          notification.error({
            message: '错误',
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