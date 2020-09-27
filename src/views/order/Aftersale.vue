<template>
  <page-header-wrapper>
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="订单编号">
              <a-input placeholder="订单编号" v-model="queryParam.orderSn" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="售后状态">
              <a-select placeholder="请选择" v-model="queryParam.afterSaleStatus" allowClear>
                <a-select-option value="1">已申请未处理</a-select-option>
                <a-select-option value="2">审核通过</a-select-option>
                <a-select-option value="3">退款成功</a-select-option>
                <a-select-option value="4">未通过</a-select-option>
                <a-select-option value="5">用户取消</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="26">
            <a-form-item label="申请日期">
              <a-date-picker @change="onChange"></a-date-picker>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24" :offset="16">
            <span
              class="table-page-search-submitButtons"
              :style="{ float: 'right', overflow: 'hidden' }"
            >
              <a-button type="primary" @click="query">查询</a-button>
              <a-button style="margin-left: 8px" @click="() => {this.queryParam = {}}">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <a-table
      :dataSource="list"
      :loading="loading"
      :columns="columns"
      rowKey="orderId"
      :pagination="pagination"
    >
      <template slot="afterSaleStatus" slot-scope="text,record">
        <span
          v-if="text == afterSaleStatus.ALREADY_APPLIED.status"
        >{{afterSaleStatus.ALREADY_APPLIED.message}}</span>
        <span
          v-if="text == afterSaleStatus.ADMIN_PASSED.status"
        >{{afterSaleStatus.ADMIN_PASSED.message}}</span>
        <span
          v-if="text == afterSaleStatus.REFUND_SUCCESSFULLY.status"
        >{{afterSaleStatus.REFUND_SUCCESSFULLY.message}}</span>
        <span v-if="text == afterSaleStatus.UN_PASSED.status">{{afterSaleStatus.UN_PASSED.message}}</span>
        <span
          v-if="text==afterSaleStatus.USER_CANCELED.status"
        >{{afterSaleStatus.USER_CANCELED.message}}</span>
      </template>
      <template slot="refundAmount" slot-scope="text,record">
        <span>￥{{text}}</span>
      </template>
      <template slot="action" slot-scope="text,record">
        <a-button size="small" @click="openModal(record)">查看详情</a-button>
      </template>
    </a-table>
    <a-drawer :visible="visiable" keyboard title="退货详情" width="800" @close="()=>visiable=false">
      <a-descriptions bordered>
        <a-descriptions-item label="订单编号">
          {{detail.orderSn}}
          <a @click="viewOrder">查看</a>
        </a-descriptions-item>

        <a-descriptions-item label="用户昵称">{{detail.nickName}}</a-descriptions-item>
        <a-descriptions-item label="用户手机">{{detail.userMobile}}</a-descriptions-item>
        <a-descriptions-item label="申请时间">{{detail.applyAfterSaleTime}}</a-descriptions-item>
        <a-descriptions-item label="申请理由">{{detail.refundMessage}}</a-descriptions-item>
        <a-descriptions-item label="退款金额">￥{{detail.refundAmount}}元</a-descriptions-item>
        <a-descriptions-item label="申请状态">
          <a-badge
            v-if="detail.status == afterSaleStatus.ALREADY_APPLIED.status"
            status="processing"
            :text="afterSaleStatus.ALREADY_APPLIED.message"
          />
          <a-badge
            v-if="detail.status == afterSaleStatus.ADMIN_PASSED.status"
            status="processing"
            :text="afterSaleStatus.ADMIN_PASSED.message"
          />
          <a-badge
            v-if="detail.status == afterSaleStatus.REFUND_SUCCESSFULLY.status"
            status="success"
            :text="afterSaleStatus.REFUND_SUCCESSFULLY.message"
          />
          <a-badge
            v-if="detail.status == afterSaleStatus.UN_PASSED.status"
            status="error"
            :text="afterSaleStatus.UN_PASSED.message"
          />
          <a-badge
            v-if="detail.status == afterSaleStatus.USER_CANCELED.status"
            status="warning"
            :text="afterSaleStatus.USER_CANCELED.message"
          />
        </a-descriptions-item>
      </a-descriptions>
      <a-table
        :dataSource="detail.orderItemList"
        :pagination="false"
        :columns="detailColumns"
        rowKey="id"
      >
        <template slot="goodsImg" slot-scope="text,record">
          <img :src="text" style="width:80px;height:80px" />
        </template>
        <template slot="price" slot-scope="text,record">￥{{text}}</template>
        <template slot="subtotal" slot-scope="text,record">￥{{text}}</template>
      </a-table>
      <div class="btn" v-if="this.detail.status == this.afterSaleStatus.ALREADY_APPLIED.status">
        <a-button style="margin-right:20px" type="primary" @click="passed">通过</a-button>
        <a-button type="danger" @click="refuse">拒绝</a-button>
      </div>
      <div class="btn" v-if="this.detail.status == this.afterSaleStatus.ADMIN_PASSED.status">
        <a-button style="margin-right:20px" type="primary" >退款</a-button>
      </div>
    </a-drawer>
  </page-header-wrapper>
</template>

<script>
import { afterSaleList, afterSaleDetail, passedOrder, refuseOrder } from '@/api/order'
import { notification } from 'ant-design-vue'
export default {
  name: 'Aftersale',
  data() {
    return {
      afterSaleStatus: {
        ALREADY_APPLIED: { message: '已申请未处理', status: 1 },
        ADMIN_PASSED: { message: '审核通过', status: 2 },
        REFUND_SUCCESSFULLY: { message: '退款成功', status: 3 },
        UN_PASSED: { message: '未通过', status: 4 },
        USER_CANCELED: { message: '用户取消', status: 5 },
      },
      queryParam: {},
      detail: {},
      list: [],
      loading: false,
      visiable: false,
      detailColumns: [
        {
          title: '商品图片',
          dataIndex: 'goodsImg',
          align: 'center',
          scopedSlots: { customRender: 'goodsImg' },
        },
        {
          title: '商品名称',
          dataIndex: 'goodsName',
          align: 'center',
        },
        {
          title: '商品规格',
          dataIndex: 'specAndValue',
          align: 'center',
          scopedSlots: { customRender: 'spec' },
        },
        {
          title: '商品价格',
          dataIndex: 'price',
          align: 'center',
          scopedSlots: { customRender: 'price' },
        },
        {
          title: '数量',
          dataIndex: 'number',
          align: 'center',
        },
        {
          title: '小计',
          dataIndex: 'subtotal',
          align: 'center',
          scopedSlots: { customRender: 'subtotal' },
        },
      ],
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
          title: '售后状态',
          dataIndex: 'afterSaleStatus',
          align: 'center',
          scopedSlots: { customRender: 'afterSaleStatus' },
        },
        {
          title: '退款金额',
          dataIndex: 'refundAmount',
          align: 'center',
          scopedSlots: { customRender: 'refundAmount' },
        },
        {
          title: '退款备注',
          dataIndex: 'refundMessage',
          align: 'center',
        },
        {
          title: '申请时间',
          dataIndex: 'applyAfterSaleTime',
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
  mounted() {
    this.queryData(this.queryParam)
  },
  methods: {
    onChange(date, dateString) {
      this.queryParam.applyAfterSaleTime = date.format('YYYY-MM-DD HH:mm:ss')
    },
    query() {
      this.queryData(this.queryParam)
    },
    queryData(param) {
      this.loading = true
      afterSaleList(param).then((res) => {
        if (res.success) {
          this.list = res.data.page.list
        } else {
          notification.error({
            message: '失败',
            description: res.msg,
          })
        }
        this.loading = false
      })
    },
    viewOrder() {
      const id = this.detail.orderId
      this.$router.push(`/order/detail/${id}`)
    },
    passed() {
      const that = this
      this.$confirm({
        content: '是否执行该操作?',
        onOk() {
          passedOrder(that.detail.orderId).then((res) => {
            if (res.success) {
              that.visiable = false
              that.queryData(that.queryParam)
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    refuse() {
      const that = this
      this.$confirm({
        content: '是否执行该操作?',
        onOk() {
          refuseOrder(that.detail.orderId).then((res) => {
            if (res.success) {
              that.visiable = false
              that.queryData(that.queryParam)
            } else {
              notification.error({
                message: '失败',
                description: res.msg,
              })
            }
          })
        },
      })
    },
    openModal(record) {
      this.visiable = true
      afterSaleDetail(record.orderId).then((res) => {
        if (res.success) {
          this.detail = res.data.detail
          this.detail.orderItemList.forEach((item) => {
            let specAndValue = item.specAndValue
            let str = ''
            for (var i in specAndValue) {
              str = str.concat(i, ':', specAndValue[i], ';')
            }
            item.specAndValue = str.substring(0, str.length - 1)
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
.btn {
  margin-top: 20px;
  text-align: center;
}
</style>