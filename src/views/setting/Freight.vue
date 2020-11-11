<template>
  <page-header-wrapper>
    <a-card>
      <a-form :form="form">
        <a-form-item
          label="运费满减所需最低消费"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
        >
          <a-input-number
            style="width:100%"
            :min="0.01"
            :precision="2"
            v-decorator="[
              'reliefAmount',
              {rules: [{ required: true, message: '请输入最低消费金额' }]}
            ]"
            placeholder="运费满减所需最低消费金额"
            addonAfter="元"
          ></a-input-number>
        </a-form-item>

        <a-form-item
          label="1KG以内运费金额"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
        >
          <a-input-number
            :min="0.01"
            :precision="2"
            style="width:100%"
            v-decorator="[
              'freightPrice',
              {rules: [{ required: true, message: '请输入金额' }]}
            ]"
            placeholder="1KG以内运费金额(基础运费)"
          ></a-input-number>
        </a-form-item>
        <a-form-item
          label="超出1KG后每KG续重金额"
          :labelCol="{lg: {span: 7}, sm: {span: 7}}"
          :wrapperCol="{lg: {span: 10}, sm: {span: 17} }"
        >
          <a-input-number
            :min="0.01"
            :precision="2"
            style="width:100%"
            v-decorator="[
              'continuedWeightFreight',
              {rules: [{ required: true, message: '请输入续重金额' }]}
            ]"
            placeholder="超出1KG后每KG续重金额(超出不到1KG按1KG计算)"
          ></a-input-number>
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
import { getFreightConfig, updateFreightConfig } from '@/api/config'
import { notification } from 'ant-design-vue'
export default {
  name: 'Freight',
  data() {
    return {
      form: this.$form.createForm(this),
      data: {},
      cacheData: '',
    }
  },
  mounted() {
      this.getFreightConfig()
  },
  methods : {
      submitForm() {
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        values.id = this.data.id
        updateFreightConfig(values).then((res) => {
          if (res.success) {
            this.getFreightConfig()
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
                      reliefAmount : data.reliefAmount,
                      freightPrice : data.freightPrice,
                      continuedWeightFreight : data.continuedWeightFreight
                  })
      },
      getFreightConfig() {
          getFreightConfig().then(res=>{
              if (res.success) {
                  let data = res.data.data
                  this.data = data
                  this.cacheData = JSON.stringify(data)
                  this.form.setFieldsValue({
                      reliefAmount : data.reliefAmount,
                      freightPrice : data.freightPrice,
                      continuedWeightFreight : data.continuedWeightFreight
                  })
              } else {
                  notification.error({
                      message : "失败",
                      description : res.msg
                  })
              }
          })
      }
  }
}
</script>

<style scoped>
</style>