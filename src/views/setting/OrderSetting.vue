<template>
  <page-header-wrapper>
    <a-card>
      <a-form :form="form">
        <a-form-item
          label="订单未付款自动取消时间"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
        >
          <a-input
            v-decorator="[
              'expireTime',
              {rules: [{ required: true, message: '请输入超时时间' }]}
            ]"
            name="expireTime"
            placeholder="用户未付款，则订单自动取消"
          >
            <a-select slot="addonAfter" v-model="timeUnit" style="width: 80px">
              <a-select-option value="分钟">分钟</a-select-option>
              <a-select-option value="小时">小时</a-select-option>
              <a-select-option value="天">天</a-select-option>
            </a-select>
          </a-input>
        </a-form-item>

        <a-form-item
          label="订单发货后超期未确认时间"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
        >
          <a-input
            v-decorator="[
              'confirmDays',
              {rules: [{ required: true, message: '请输入超时时间' }]}
            ]"
            name="confirmDays"
            placeholder="未确认收货，则订单自动确认收货"
            addonAfter="天"
          ></a-input>
        </a-form-item>
        <a-form-item
          label="确认收货后超期取消评价时间"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
        >
          <a-input
            v-decorator="[
              'commentDays',
              {rules: [{ required: true, message: '请输入超时时间' }]}
            ]"
            name="commentDays"
            placeholder="未评价商品，则取消评价资格"
            addonAfter="天"
          ></a-input>
        </a-form-item>
      </a-form>
      <div style="text-align:center">
        <a-button type="primary" style="margin-right:8px" @click="submitForm">确定</a-button>
        <a-button type="danger" @click="reset">重置</a-button>
      </div>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { getOrderConfig, updateOrderConfig } from '@/api/config'
import { notification } from 'ant-design-vue'
export default {
  name: 'OrderSetting',
  data() {
    return {
      form: this.$form.createForm(this),
      timeUnit: '分钟',
      data: {},
      cacheData: {},
    }
  },
  mounted() {
    this.getOrderConfig()
  },
  methods: {
    submitForm() {
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        values.id = this.data.id
        values.timeUnit = this.timeUnit
        updateOrderConfig(values).then((res) => {
          if (res.success) {
            this.getOrderConfig()
            notification.success({
              message: '成功',
              description: '修改成功',
            })
          } else {
            notification.error({
              message: '失败',
              description: res.msg,
            })
          }
        })
      })
    },
    reset() {
      let data = JSON.parse(this.cacheData)
      this.form.setFieldsValue({
        expireTime: data.expireTime,
        confirmDays: data.confirmDays,
        commentDays: data.commentDays,
      })
      this.timeUnit = data.timeUnit
      
    },
    getOrderConfig() {
      getOrderConfig().then((res) => {
        let data = res.data.data
        this.cacheData = JSON.stringify(data)

        if (res.success) {
          this.data = data
          this.form.setFieldsValue({
            expireTime: data.expireTime,
            confirmDays: data.confirmDays,
            commentDays: data.commentDays,
          })
          this.timeUnit = data.timeUnit
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