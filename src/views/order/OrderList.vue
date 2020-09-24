<template>
  <page-header-wrapper>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="会员手机">
              <a-input placeholder="会员手机" v-model="queryParam.userMobile" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="订单编号">
              <a-input placeholder="订单编号" v-model="queryParam.orderSn" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="订单状态">
              <a-select placeholder="请选择" v-model="queryParam.status" allowClear>
                <a-select-option value="0">待付款</a-select-option>
                <a-select-option value="1">已付款</a-select-option>
                <a-select-option value="2">已发货</a-select-option>
                <a-select-option value="3">已完成</a-select-option>
                <a-select-option value="4">已关闭</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="16" :sm="24">
            <a-form-item label="选择时间">
              <a-range-picker
               v-model="date"
                :show-time="{
        hideDisabledOptions: true,
        defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
      }"
                format="YYYY-MM-DD HH:mm:ss"
              />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span
              class="table-page-search-submitButtons"
              :style="{ float: 'right', overflow: 'hidden' }"
            >
              <a-button type="primary" @click='query'>查询</a-button>
              <a-button style="margin-left: 8px" @click="() => {this.queryParam = {};this.date=null}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-table
      borderd
      :dataSource="orderList"
      :loading="loading"
      :columns="columns"
      rowKey="orderId"
      :pagination="pagination"
    >
    <template slot="orderPrice" slot-scope="text,record">
        <span>￥{{text}}</span>
    </template>
    <template slot="actualPayment" slot-scope="text,record">
        <span>￥{{text}}</span>
    </template>
    <template slot="status" slot-scope="text,record">
        <a-tag  v-if="text == orderStatus.UNPAID.status">{{orderStatus.UNPAID.description}}</a-tag>
        <a-tag  v-else-if="text == orderStatus.PAID.status" color="#108ee9">{{orderStatus.PAID.description}}</a-tag>
        <a-tag  v-else-if="text == orderStatus.SHIPPED.status" color="#87d068">{{orderStatus.SHIPPED.description}}</a-tag>
        <a-tag  v-else-if="text == orderStatus.COMPLETED.status" color="#87d068">{{orderStatus.COMPLETED.description}}</a-tag>
        <a-tag  v-else color="#f50">{{orderStatus.CLOSED.description}}</a-tag>
    </template>

    <template slot="payTime" slot-scope="text,record">
        <span v-if="text == null">未支付</span>
        <span v-else>{{text}}</span>
    </template>
    <template slot="payType" slot-scope="text,record">
        <a-icon v-if="text == 1" type="wechat" theme="filled" style="fontSize:25px"/>
        <a-icon v-else-if="text == 2" type="alipay-circle" theme="filled"   style="fontSize:25px" />
        <span v-else>未支付</span>
    </template>
    <template slot="action" slot-scope="text,record">
        <a-button size="small" @click="openDetail(record)">查看订单</a-button>
        <a-divider type="vertical" />
        <a-button size="small" type="danger" @click="deleteOrder(record)">删除订单</a-button>
    </template>
    </a-table>
    
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { getList, deleteOrder } from '@/api/order'
import { notification } from 'ant-design-vue'

export default {
  name: 'OrderList',

  data() {
    return {
      queryParam: {},
      visiable : false,
      loading: false,
      orderList: [],
      orderStatus : {
    UNPAID  : {status : 0, description : '待付款'},
    PAID : {status : 1, description : '已付款'},
    SHIPPED : {status : 2 , description : '已发货'},
    COMPLETED : {status : 3 , description : '已完成'},
    CLOSED : {status : 4, description : '已关闭'},
},
      visible : false,
      date : null,
      columns: [
          {
          title: '序号',
          align: 'center',
          width: '40px',
          customRender: (value, row, index) => {
            return `${(this.pagination.defaultCurrent - 1) * this.pagination.defaultPageSize + index + 1}`
          },
        },
        {
          title: '订单编号',
          dataIndex: 'orderSn',
          align: 'center',
        },
        {
          title: '用户手机',
          dataIndex: 'userMobile',
          align: 'center',
        },
        {
          title: '订单总价',
          dataIndex: 'orderPrice',
          align: 'center',
          scopedSlots: { customRender: 'orderPrice' },
        },
        {
          title: '实付款',
          dataIndex: 'actualPayment',
          align: 'center',
          scopedSlots: { customRender: 'actualPayment' },
        },
        {
          title: '订单状态',
          dataIndex: 'status',
          align: 'center',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '支付时间',
          dataIndex: 'payTime',
          align: 'center',
          scopedSlots: { customRender: 'payTime' },
        },
        {
          title: '支付类型',
          dataIndex: 'payType',
          align: 'center',
          scopedSlots: { customRender: 'payType' },
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          align: 'center',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },

      ],
      pagination: {
        defaultCurrent: 1,
        defaultPageSize: 10,
        total: 0,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total) => `共${total}条记录`,
        onShowSizeChange: (current, pageSize) => {
          this.pagination.defaultCurrent = 1
          this.pagination.defaultPageSize = pageSize
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.queryData(this.queryParam)
        },
        onChange: (current, size) => {
          this.pagination.defaultCurrent = current
          this.pagination.defaultPageSize = size
          this.queryParam.page = this.pagination.defaultCurrent
          this.queryParam.size = this.pagination.defaultPageSize
          this.queryData(this.queryParam)
        },
      },
    }
  },
  created() {
    this.queryData(this.queryParam)
  },
  methods: {
    moment,
    query() {
        if (this.date) {
            this.queryParam.startTime = this.date[0].format("YYYY-MM-DD HH:mm:ss")
            this.queryParam.endTime = this.date[1].format("YYYY-MM-DD HH:mm:ss")
        }
        this.queryData(this.queryParam)
    },
    queryData(param) {
      this.loading = true
      getList(param).then((res) => {
        if (res.success) {
          this.orderList = res.data.page.list
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
        this.loading = false
      })
    },
    openDetail(record) {
        const id = record.orderId
        this.$router.push(`/order/detail/${id}`)
    },
    deleteOrder(record) {
      const that = this
      this.$confirm({
        title : "删除订单",
        content : "删除后将不可恢复,是否删除该订单?",
        onOk() {
          deleteOrder(record.orderId).then(res=>{
            if (res.success) {
              notification.success({
                message : '成功',
                description : "删除订单成功"
              })
              that.queryData(that.queryParam)
            } else {
              notification.error({
                message : '失败',
                description : res.msg
              })
            }
          })
        }
      })
    }
  },
}
</script>

<style scoped>
</style>