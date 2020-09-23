<template>
  <page-header-wrapper :title="title">
    <template v-slot:content>
      <a-descriptions size="small">
        <a-descriptions-item label="用户手机">{{detail.mobile}}</a-descriptions-item>
        <a-descriptions-item label="用户留言">{{detail.message}}</a-descriptions-item>
        <a-descriptions-item label="支付方式">
          <span v-if="detail.payType">{{detail.payType}}</span>
          <span v-else>暂无</span>
        </a-descriptions-item>
        <a-descriptions-item label="支付时间">
          <span v-if="detail.payTime">{{detail.payTime}}</span>
          <span v-else>暂无</span>
        </a-descriptions-item>
        <a-descriptions-item label="物流单号">
          <span v-if="detail.shipSn">{{detail.shipSn}}</span>
          <span v-else>暂无</span>
        </a-descriptions-item>
        <a-descriptions-item label="配送物流">
          <span v-if="detail.shipChannel">{{detail.shipChannel}}</span>
          <span v-else>暂无</span>
        </a-descriptions-item>
        <a-descriptions-item label="发货时间">
          <span v-if="detail.shipTime">{{detail.shipTime}}</span>
          <span v-else>暂无</span>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{detail.createTime}}</a-descriptions-item>
        <a-descriptions-item label="确认收货时间">
          <span v-if="detail.confirmTime">{{detail.confirmTime}}</span>
          <span v-else>暂无</span>
        </a-descriptions-item>
        <a-descriptions-item label="订单关闭时间">
          <span v-if="detail.endTime">{{detail.endTime}}</span>
          <span v-else>暂无</span>
        </a-descriptions-item>
      </a-descriptions>
    </template>
    <template v-slot:extra>
      <a-button type="primary" @click="print()">打印</a-button>
    </template>
    <template v-slot:extraContent>
      <a-row class="status-list">
        <a-col :xs="12" :sm="12">
          <div class="text">状态</div>
          <div class="heading">{{detail.status}}</div>
        </a-col>
        <a-col :xs="12" :sm="12">
          <div class="text">订单金额</div>
          <div class="heading">¥{{detail.orderPrice}}</div>
        </a-col>
      </a-row>
    </template>
    <a-card style="margin-top: 24px" :bordered="false" title="收货信息">
      <a-descriptions>
        <a-descriptions-item label="收货人">{{detail.receiver}}</a-descriptions-item>
        <a-descriptions-item label="联系方式">{{detail.mobile}}</a-descriptions-item>
        <a-descriptions-item label="详细地址">{{detail.address}}</a-descriptions-item>
      </a-descriptions>
    </a-card>
    <a-card style="margin-top: 24px" :bordered="false" title="商品信息">
      <a-table
        :dataSource="detail.orderItemList"
        :pagination="false"
        :columns="columns"
        rowKey="id"
      >
        <template slot="goodsImg" slot-scope="text,record">
          <img :src="text" style="width:80px;height:80px" />
        </template>
        <template slot="price" slot-scope="text,record">￥{{text}}</template>
        <template slot="subtotal" slot-scope="text,record">￥{{text}}</template>
      </a-table>
      <div class="footer">
        <div>
          合计:
          <span class="total_price">￥{{detail.goodsPrice}}</span>
        </div>
        <div>
          运费:
          <span class="total_price">￥{{detail.freightPrice}}</span>
        </div>
        <div>
          优惠券优惠:
          <span class="total_price">-￥{{detail.couponPrice}}</span>
        </div>
        <div>
          实付金额:
          <span class="total_price">￥{{detail.actualPayment}}</span>
        </div>
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { getDetail } from '@/api/order'
import { notification } from 'ant-design-vue'
export default {
  name: 'OrderDetail',

  data() {
    return {
      detail: {},
      tabActiveKey: 'detail',
      title: '',
      columns: [
        //   {
        //   title: '序号',
        //   align: 'center',
        //   width: '40px',
        //   customRender: (value, row, index) => {
        //     return `${(this.pagination.defaultCurrent - 1) * this.pagination.defaultPageSize + index + 1}`
        //   },
        // },
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
    }
  },
  created() {
    this.getData(this.$route.params.id)
  },
  methods: {
    getData(id) {
      getDetail(id).then((res) => {
        if (res.success) {
          this.detail = res.data.detail
          this.title = `订单号: ${this.detail.orderSn}`
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
    print() {
        window.print()
    }
  },
}
</script>

<style scoped>
.detail-layout {
  margin-left: 44px;
}
.text {
  color: rgba(0, 0, 0, 0.45);
}

.heading {
  color: rgba(0, 0, 0, 0.85);
  font-size: 20px;
}
.footer {
  text-align: right;
  font-size: 17px;
  margin-top: 10px;
}
.total_price {
  color: red;
}
</style>