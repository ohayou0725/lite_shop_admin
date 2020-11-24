<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16">
      <a-col :md="24" :lg="16">

        <a-form layout="vertical">
          <a-form-item
            label="真实姓名"
          >
            <a-input placeholder="输入真实姓名" v-model="form.name" />
          </a-form-item>
          
          <a-form-item
            label="电子邮件"
            :required="false"
          >
            <a-input placeholder="exp@admin.com" v-model="form.email"/>
          </a-form-item>
          

          <a-form-item>
            <a-button type="primary" @click="submitForm">提交</a-button>
            <a-button style="margin-left: 8px" type="danger" @click="reset">重置</a-button>
          </a-form-item>
        </a-form>

      </a-col>
      <a-col :md="24" :lg="8" :style="{ minHeight: '180px' }">
        <div class="ant-upload-preview" @click="$refs.modal.edit(1)" >
          <a-icon type="cloud-upload-o" class="upload-icon"/>
          <div class="mask">
            <a-icon type="plus" />
          </div>
          <img :src="form.avatar"/>
        </div>
      </a-col>

    </a-row>

    <avatar-modal ref="modal" @ok="setavatar"/>

  </div>
</template>

<script>
import AvatarModal from './AvatarModal'
import { updateUser, updateUserInfo } from '@/api/admin'
import { notification } from 'ant-design-vue'
import { mapActions } from 'vuex'


export default {
  components: {
    AvatarModal
  },
  data () {
    return {
      // cropper
      userInfo : {},
      form : {},
      preview: {},
      option: {
        img: '/avatar2.jpg',
        info: true,
        form : {},
        size: 1,
        outputType: 'jpeg',
        canScale: false,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 180,
        autoCropHeight: 180,
        fixedBox: true,
        // 开启宽度和高度比例
        fixed: true,
        fixedNumber: [1, 1]
      }
    }
  },
  mounted() {
    const userInfo = JSON.stringify(this.$store.getters.userInfo)
    this.form = JSON.parse(userInfo)
  },
  methods: {
    ...mapActions(['GetInfo']),
    setavatar (url) {
      this.form.avatar = url
    },
    reset() {
      this.form.name = "",
      this.form.email = ""
    },
    submitForm() {
      updateUserInfo({
        id : this.form.id,
        name:this.form.name,
        email : this.form.email,
        avatar : this.form.avatar }).then(res=>{
          if (res.success) {
            notification.success({
              message : "成功",
              description : "修改成功"
            })
            this.GetInfo()
          } else {
            notification.success({
              message : "失败",
              description : res.msg
            })
          }
        })
    }
  }
}
</script>

<style lang="less" scoped>

  .avatar-upload-wrapper {
    height: 200px;
    width: 100%;
  }

  .ant-upload-preview {
    position: relative;
    margin: 0 auto;
    width: 100%;
    max-width: 180px;
    border-radius: 50%;
    box-shadow: 0 0 4px #ccc;

    .upload-icon {
      position: absolute;
      top: 0;
      right: 10px;
      font-size: 1.4rem;
      padding: 0.5rem;
      background: rgba(222, 221, 221, 0.7);
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.2);
    }
    .mask {
      opacity: 0;
      position: absolute;
      background: rgba(0,0,0,0.4);
      cursor: pointer;
      transition: opacity 0.4s;

      &:hover {
        opacity: 1;
      }

      i {
        font-size: 2rem;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -1rem;
        margin-top: -1rem;
        color: #d6d6d6;
      }
    }

    img, .mask {
      width: 100%;
      max-width: 180px;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    }
  }
</style>
