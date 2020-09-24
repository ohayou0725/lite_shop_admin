<template>
  <page-header-wrapper :title="title">
    <template v-slot:content>
      <a-descriptions size="small">
        <a-descriptions-item label="用户昵称">{{detail.nickName}}</a-descriptions-item>
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
      <a-button-group style="margin-right: 4px;">
        <a-button type="primary" @click="()=>visiable=true" :disabled="isShip">发货</a-button>
        <a-button type="warning" @click="clickQuery" :disabled="detail.shipSn == null">物流跟踪</a-button>
      </a-button-group>
      <!-- <a-button type="danger">取消订单</a-button> -->
    </template>
    <a-modal v-model="trackVisiable">
        <a-spin :spinning="this.track.length < 1">
            <a-steps direction="vertical" size="small" :current="track.length-1">
                <a-step 
                v-for="(item,index) in track" :key="index"
                :title="item.AcceptStation"
                :description="item.AcceptTime" ></a-step>
            </a-steps>
        </a-spin>
    </a-modal>
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
    <a-modal v-model="visiable" @cancel="()=>visiable=false" title="订单发货" @ok="submitShip">
      <a-form :form="form" v-bind="formItemLayout">
        <a-form-item label="收货人">
          <span class="ant-form-text">{{detail.receiver}}</span>
        </a-form-item>
        <a-form-item label="收货地址">
          <span class="ant-form-text">{{detail.address}}</span>
        </a-form-item>
        <a-form-item label="联系方式">
          <span class="ant-form-text">{{detail.mobile}}</span>
        </a-form-item>
        <a-form-item label="物流商" required>
          <a-select
            placeholder="请选择"
            v-decorator="['shipChannel', { rules: [{ required: true, message: '还未选择物流商' }] }]"
          >
            <a-select-option v-for="(item,index) in shipChannel" :key="index" :value="item">{{item}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="快递单号" required>
          <a-input v-decorator="['shipSn', { rules: [{ required: true, message: '必须输入快递单号' }] }]"></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import { getDetail, ship, queryTrack} from '@/api/order'
import { notification } from 'ant-design-vue'

export default {
  name: 'OrderDetail',

  data() {
    return {
      detail: {},
      visiable: false,
      tabActiveKey: 'detail',
      title: '',
      track : [],
      trackVisiable : false,
      form: this.$form.createForm(this),
      formItemLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 },
      },
      columns: [
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
      shipChannel: ['顺丰速运', '圆通快递', '天天快递', '中通快递', '韵达快递'],
    }
  },
  created() {
    this.getData(this.$route.params.id)
  },
  computed: {
      isShip() {
          return this.detail.status !== "已付款"
      }
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
    clickQuery() {
        this.trackVisiable = true
        this.queryTrack()
    },
    queryTrack() {
        queryTrack(this.detail.orderId).then(res=>{
            if (res.success) {
                this.track = res.data.data.Traces
            } else {
                notification({
                    message : "失败",
                    description : res.msg
                })
            }
        })
    },
    submitShip() {
      this.form.validateFields((err, values) => {
        if (!err) {
            let data = {}
            data.orderId = this.detail.orderId
            data.shipChannel = values.shipChannel
            data.shipSn = values.shipSn
            ship(data).then(res=>{
                if (res.success) {
                    notification.success({
                        message : "成功",
                        description : "发货成功"
                    })
                  this.visiable = false
                  this.getData(data.orderId)
                } else {
                    notification.error({
                        message : "失败",
                        description : res.msg
                    })
                }
            })
        }
      })
    },
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