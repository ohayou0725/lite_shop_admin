<template>
  <div class="layout">
    <!-- ommited -->
    <SocialChat icon class="telegram-chat">
      <p slot="header">单击下面我们的代表之一，在Messenger上聊天。</p>
      <!-- <MyMessengerIcon slot="button" /> -->
      <template v-slot:button="{ open }">
        <div v-show="!open">
          <a-badge :count="totalCount">
            <a-icon type="message" style="font-size: 40px" />
          </a-badge>
        </div>
        <div v-show="open">
          <span 关闭 />
        </div>
      </template>
      <template v-slot:body>
        <ul class="vsc-popup-body__list">
          <li v-for="(attendant, index) in records" :key="`vsc-item-${index}`" class="vsc-popup-body__list-item">
            <a
              @click="openChat(index)"
              :href="attendant.href"
              rel="noopener"
              target="_blank"
              class="vsc-popup-body__link"
              :aria-label="`Contact ${attendant.userNickname}, opens in a new window`"
            >
              <a-badge :count="attendant.unReadCount" :overflow-count="999">
                <div class="vsc-popup-body__link-avatar">
                  <img :src="attendant.avatar"/>
                  <!-- <span
                  class="vsc-popup-body__link-avatar-brand"
                  :style="attendant.app ? `background-image: url(${attendant.urlAsset}/logos/${attendant.app}.png)` : ''"
                /> -->
                </div>
              </a-badge>
              <div class="vsc-popup-body__link-info">
                <span class="vsc-popup-body__link-info__name" style="font-size: 15px" v-text="attendant.userNickname" />
                <span
                  v-if="attendant.records[attendant.records.length - 1].type == 'image'"
                  class="vsc-popup-body__link-info__label"
                  style="margin-top: 10px"
                >
                  [图片]
                </span>

                <span v-else
                  class="vsc-popup-body__link-info__label"
                  style="margin-top: 10px"
                  v-text="attendant.records[attendant.records.length - 1].content"
                />
              </div>
            </a>
          </li>
        </ul>
      </template>
      <small slot="footer">时间：上午8点至下午6点</small>
    </SocialChat>

    <a-modal 
    :visible="visible"
    :maskClosable="false"
    :footer="null"
    :confirmLoading="false"
    :closable="false"
    :bodyStyle="style"
    :mask="false"
    :keyboard="true"
    :destroyOnClose="true"
    :centered="true">
    <div class="chatView">
      <Chat
        v-if="visible"
        :participants="participants"
        :myself="myself"
        :messages="messages"
        :chat-title="chatTitle"
        :placeholder="placeholder"
        :colors="colors"
        :border-style="borderStyle"
        :hide-close-button="hideCloseButton"
        :close-button-icon-size="closeButtonIconSize"
        :submit-icon-size="submitIconSize"
        :submit-image-icon-size="submitImageIconSize"
        :load-more-messages="toLoad.length > 0 ? loadMoreMessages : null"
        :async-mode="asyncMode"
        :scroll-bottom="scrollBottom"
        :display-header="true"
        :send-images="true"
        :profile-picture-config="profilePictureConfig"
        @onImageClicked="onImageClicked"
        @onImageSelected="onImageSelected"
        @onMessageSubmit="onMessageSubmit"
        @onType="onType"
        @onClose="onClose('param value')"
      />
      </div>
      <a-modal :visible="imgView" :closable="true" maskClosable keyboard :footer="null"
      :bodyStyle="imgViewStyle"
      @cancel="()=>{this.imgView=false}">
             <img :src="imgSrc" preview="0" width="100%" />
      </a-modal>
    </a-modal>
    
  </div>
</template>

<script>
import { SocialChat } from 'vue-social-chat'
import { Chat } from 'vue-quick-chat'
import 'vue-quick-chat/dist/vue-quick-chat.css'
import moment from 'moment'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import Axios from "axios";
const token = window.sessionStorage.getItem(ACCESS_TOKEN)
const baseURL = process.env.VUE_APP_API_BASE_URL
export default {
  components: {
    SocialChat,
    Chat,
  },
  props: {
    records: {
      type: Array,
    },
    newMessage : {
      type : Object
    }
  },
  computed: {
    totalCount() {
      let count = 0
      this.records.forEach((item) => {
        count += item.unReadCount
      })
      return count
    },
  },
  data() {
    return {
    style : {
        padding : "0px",
        height : '550px'
    },
    imgViewStyle : {
      padding: "0px",
      height:"350px"
    },
    visible: false,
    imgView : false,
    imgSrc : '',
    participants: [
      {
        name: '客服',
        id: 0,
        adminName: 'admin',
        profilePicture: 'https://img2.baidu.com/it/u=2268973033,2580734186&fm=26&fmt=auto&gp=0.jpg',
      },
      
    ],
    myself: {
      name: this.$store.getters.userInfo.name,
      id: this.$store.getters.userInfo.id,
      profilePicture: this.$store.getters.userInfo.avatar,
    },
    messages: [],
    chatTitle: '客服服务',
    placeholder: '请输入...',
    colors: {
      header: {
        bg: '#0095F0',
        text: '#fff',
      },
      message: {
        myself: {
          bg: '#fff',
          text: '#525252',
        },
        others: {
          bg: '#0095F0',
          text: '#fff',
        },
        messagesDisplay: {
          // bg: 'rgb(247, 243, 243)',
          //bg: '#f7f3f3'
          bg: '#f7f3f3',
        },
      },
      submitIcon: '#0095F0',
      submitImageIcon: '#0095F0',
    },
    borderStyle: {
      topLeft: '10px',
      topRight: '10px',
      bottomLeft: '10px',
      bottomRight: '10px',
    },
    hideCloseButton: false,
    submitIconSize: 24,
    submitImageIconSize: 24,
    closeButtonIconSize: '20px',
    asyncMode: true,
    toLoad: [
      // {
      //   content: '您好，请问有什么需要帮助吗',
      //   participantId: 1,
      //   timestamp: {
      //     year: 2016,
      //     month: 3,
      //     day: 5,
      //     hour: 10,
      //     minute: 10,
      //     second: 3,
      //     millisecond: 123,
      //   },
      //   uploaded: true,
      //   viewed: true,
      // },
    ],
    scrollBottom: {
      messageSent: true,
      messageReceived: false,
    },
    profilePictureConfig: {
      others: true,
      myself: true,
      styles: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
      },
    },
    }
  },

  watch: {
    visible(val,oldVal) {
        if (val) {
          this.$emit("onOpenChat",this.participants[0].userMobile)
        }
    },
    newMessage(val,oldVal) {
        if (!val) {
          return 
        }
        if (this.messages[0].userMobile == val.userMobile) {
          let message= {}
          message.orderId = val.orderId
          message.content = val.content
          message.uploaded  = true,
          message.viewed = true,
          message.type = val.type,
          message.timestamp = this.convertTime(val.sendTime)
          message.participantId = this.participants[0].id
          message.src = val.type == "image" ? val.content : ''
          this.messages.push(message)
        }
    }
  },
  methods: {
    openChat(index) {
      this.messages = []
      this.participants[0] = {
        name: this.records[index].userNickname,
        id: 0,
        userMobile : this.records[index].userMobile,
        profilePicture: this.records[index].avatar,
        userNickname : this.records[index].userNickname
      }
      let data = this.records[index].records
      if (data) {
        this.toLoad = data.map(item=>{
          let message = {}
          message.userMobile = item.userMobile
          message.content = item.content
          message.uploaded  = true,
          message.viewed = true,
          message.type = item.type,
          message.timestamp = item.sendTime,
          message.timestamp = this.convertTime(item.sendTime)
          message.myself = item.adminSend
          message.orderId = item.orerId
          message.participantId = item.adminSend ? this.myself.participantId : this.participants[0].id
          message.src = item.type == "image" ? item.content : ''
          return message;
        })
      }
      this.visible = true
    },
    onImageClicked(message) {
      this.imgView = true
      this.imgSrc = message.src
    },
    async onImageSelected({ file, message }) {
      const img = await this.readImg(file)
      const blob = await this.compressImg(img, file.type, 2000, 2000)
      let newFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() })
      this.messages.push(message)
      let config = {
        Authorization: token,
        'Content-Type': 'multipart/form-data',
      }
      let formData = new window.FormData()
      formData.append('file', newFile)
      Axios({
        method: 'post',
        headers: config,
        url: `${baseURL}/user/upload`,
        data: formData,
      }).then((res) => {
        if (res.data.success) {
          message.uploaded = true
          message.src = res.data.data.url
          message.content = res.data.data.url
          message.avatar = this.myself.profilePicture
          message.adminId = this.$store.getters.userInfo.id;
          message.adminName = this.$store.getters.userInfo.name
          message.userMobile = this.participants[0].userMobile;
          message.userNickname = this.participants[0].userNickname
          message.sendTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
          message.adminSend = true
      let record = this.records.filter(item=>{
        return item.userMobile == message.userMobile
      })[0]
      record.records.push(message)
          this.$emit("imgUploaded",message)
        }
      })
      // setTimeout(
      //   (res) => {
      //     message.uploaded = true;
      //     message.src = res.src;
      //   },
      //   3000,
      //   { src }
      // );
    },
    onMessageSubmit(message) {
      message.adminId = this.$store.getters.userInfo.id;
      message.adminName = this.$store.getters.userInfo.name
      message.userMobile = this.participants[0].userMobile;
      message.avatar = this.myself.profilePicture
      message.userNickname = this.participants[0].userNickname
      message.sendTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      message.adminSend = true
      this.messages.push(message);
      
      let record = this.records.filter(item=>{
        return item.userMobile == message.userMobile
      })[0]
      record.records.push(message)
      this.$emit("sendMessage",message)
      setTimeout(() => {
        message.uploaded = true;
        message.viewed = true;
      }, 1000); 
    },
    onType() {},
    onClose() {
      this.visible = false
      this.$emit("onChatClose",this.participants[0].userMobile)
    },
    loadMoreMessages(resolve) {
      setTimeout(() => {
        resolve(this.toLoad)
        this.messages.unshift(...this.toLoad)
        this.toLoad = []
      }, 10)
    },
    convertTime(time) {
        let date = moment(time,'YYYY-MM-DD HH:mm:ss')
        return {
          year : date.year(),
          month : date.month(),
          day: date.date(),
          hour: date.hour(),
          minute: date.minute(),
          second: date.second(),
          millisecond: date.millisecond()
        }
    },
    compressImg(img, type, mx, mh) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const { width: originWidth, height: originHeight } = img
        // 最大尺寸限制
        const maxWidth = mx
        const maxHeight = mh
        // 目标尺寸
        let targetWidth = originWidth
        let targetHeight = originHeight
        if (originWidth > maxWidth || originHeight > maxHeight) {
          if (originWidth / originHeight > 1) {
            // 宽图片
            targetWidth = maxWidth
            targetHeight = Math.round(maxWidth * (originHeight / originWidth))
          } else {
            // 高图片
            targetHeight = maxHeight
            targetWidth = Math.round(maxHeight * (originWidth / originHeight))
          }
        }
        canvas.width = targetWidth
        canvas.height = targetHeight
        context.clearRect(0, 0, targetWidth, targetHeight)
        // 图片绘制
        context.drawImage(img, 0, 0, targetWidth, targetHeight)
        canvas.toBlob(function (blob) {
          resolve(blob)
        }, type || 'image/png')
      })
    },
    readImg(file) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()
        reader.onload = function (e) {
          img.src = e.target.result
        }
        reader.onerror = function (e) {
          reject(e)
        }
        reader.readAsDataURL(file)
        img.onload = function () {
          resolve(img)
        }
        img.onerror = function (e) {
          reject(e)
        }
      })
    },
  },
}
</script>

<style>
.telegram-chat {
  --telegram: #039be5;
  --vsc-bg-header: var(--telegram);
  --vsc-bg-button: var(--telegram);
  --vsc-outline-color: var(--telegram);
}
.chatView {
  height: 100%;
  width: 100%;
  /* position: absolute; */
}
</style>