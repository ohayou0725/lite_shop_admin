<template>
  <div>
    <a-list itemLayout="horizontal" :dataSource="data">
      <a-list-item slot="renderItem" slot-scope="item, index" :key="index">
        <a-list-item-meta>
          <a slot="title">{{ item.title }}</a>
          <span slot="description">
            <span class="security-list-description">{{ item.description }}</span>
            <span v-if="item.value">:</span>
            <span class="security-list-value">{{ item.value }}</span>
          </span>
        </a-list-item-meta>
        <template v-if="item.actions">
          <a slot="actions" @click="item.actions.callback">{{ item.actions.title }}</a>
        </template>
      </a-list-item>
    </a-list>
    <a-modal v-model="visible" title="密码修改" destroyOnClose @ok="submitFome">
      <a-form :label-col="labelCol" :wrapper-col="wrapperCol" :form="form">
        <a-form-item label="旧密码" has-feedback>
          <a-input-password
            placeholder="请输入旧密码"
            v-decorator="['oldPassword',{rules:[{required:true,message:'必须输入旧密码'}]}]"
          ></a-input-password>
        </a-form-item>
        <a-form-item label="新密码" has-feedback>
          <a-input-password
            placeholder="请输入新密码"
            v-decorator="['newPassword',{rules:[{required:true,message:'必须输入新密码'}
          ,{min:6,message:'密码长度必须为6到16位'},{max:16,message:'密码长度必须为6到16位'}]}]"
          ></a-input-password>
        </a-form-item>
        <a-form-item label="确认新密码" has-feedback>
          <a-input-password
            placeholder="请输入确认新新密码"
            v-decorator="['confirmPassword',{rules:[{required:true,message:'必须输入新密码'}
          ,{validator:validPassword}]}]"
          ></a-input-password>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { updatePassword } from '@/api/admin'
import { notification } from 'ant-design-vue'
export default {
  data() {
    return {
      data: [
        {
          title: '账户密码',
          description: '当前密码强度',
          value: '强',
          actions: {
            title: '修改',
            callback: () => {
              this.visible = true
            },
          },
        },
      ],
      form: this.$form.createForm(this),
      visible: false,
      labelCol: { span: 7 },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    }
  },
  methods: {
    validPassword(rule, value, callback) {
      const newPassword = this.form.getFieldValue('newPassword')
      if (newPassword !== value) {
        callback('两次是输入新密码不一致')
      }
      callback()
    },
    submitFome() {
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }    
        const param = {oldPassword : values.oldPassword , newPassword : values.newPassword}
        const id = this.$store.getters.userInfo.id
        updatePassword(id,param).then(res=>{
          if (res.success) {
            notification.success({
              message : '成功',
              description : "密码修改成功"
            })
            this.visible = false
          } else {
            notification.error({
              message : '失败',
              description : res.msg
            })
          }
        })
      })
    },
  },
}
</script>

<style scoped>
</style>
