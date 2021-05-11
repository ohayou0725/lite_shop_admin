<template>
  <pro-layout
    :title="title"
    :menus="menus"
    :collapsed="collapsed"
    :mediaQuery="query"
    :isMobile="isMobile"
    :handleMediaQuery="handleMediaQuery"
    :handleCollapse="handleCollapse"
    :logo="logoRender"
    :i18nRender="i18nRender"
    v-bind="settings"
  >
    <ChatView 
    :records="records"
     :newMessage="newMessage" 
     @onOpenChat="chatopen" 
     @onChatClose="chatclose"
     @sendMessage="sendMessage"
     @imgUploaded="sendImg"></ChatView>
    <setting-drawer :settings="settings" @change="handleSettingChange" />
    <template v-slot:rightContentRender>
      <right-content :top-menu="settings.layout === 'topmenu'" :is-mobile="isMobile" :theme="settings.theme" />
    </template>
    <template v-slot:footerRender>
      <global-footer />
    </template>
    <router-view />
  </pro-layout>
</template>

<script>
import { SettingDrawer, updateTheme } from '@ant-design-vue/pro-layout'
import { i18nRender } from '@/locales'
import { mapState } from 'vuex'
import { SIDEBAR_TYPE, TOGGLE_MOBILE_TYPE } from '@/store/mutation-types'
import ChatView from '@/components/ChatView/ChatView'
import defaultSettings from '@/config/defaultSettings'
import RightContent from '@/components/GlobalHeader/RightContent'
import GlobalFooter from '@/components/GlobalFooter'
import Ads from '@/components/Other/CarbonAds'
import LogoSvg from '../assets/logo.svg?inline'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { getChatRecords, updateChat } from '@/api/admin'
import { notification } from 'ant-design-vue'

const socketUrl = process.env.VUE_APP_WEBSOCKET_BASE_URL
const token = window.sessionStorage.getItem(ACCESS_TOKEN)

export default {
  name: 'BasicLayout',
  components: {
    SettingDrawer,
    RightContent,
    GlobalFooter,
    Ads,
    ChatView,
  },
  data() {
    return {
      // preview.pro.antdv.com only use.
      isProPreviewSite: process.env.VUE_APP_PREVIEW === 'true' && process.env.NODE_ENV !== 'development',
      // end

      // base
      menus: [],
      // 侧栏收起状态
      collapsed: false,
      title: defaultSettings.title,
      settings: {
        // 布局类型
        layout: defaultSettings.layout, // 'sidemenu', 'topmenu'
        // 定宽: true / 流式: false
        contentWidth: defaultSettings.layout === 'sidemenu' ? false : defaultSettings.contentWidth === 'Fixed',
        // 主题 'dark' | 'light'
        theme: defaultSettings.navTheme,
        // 主色调
        primaryColor: defaultSettings.primaryColor,
        fixedHeader: defaultSettings.fixedHeader,
        fixSiderbar: defaultSettings.fixSiderbar,
        colorWeak: defaultSettings.colorWeak,

        hideHintAlert: false,
        hideCopyButton: false,
      },
      // 媒体查询
      query: {},
      chatUserMobile: '',

      // 是否手机模式
      isMobile: false,
      records: [],
      newMessage : null,
    }
  },
  computed: {
    ...mapState({
      // 动态主路由
      mainMenu: (state) => state.permission.addRouters,
    }),
  },
  created() {
    const routes = this.mainMenu.find((item) => item.path === '/')
    this.menus = (routes && routes.children) || []
    // 处理侧栏收起状态
    this.$watch('collapsed', () => {
      this.$store.commit(SIDEBAR_TYPE, this.collapsed)
    })
    this.$watch('isMobile', () => {
      this.$store.commit(TOGGLE_MOBILE_TYPE, this.isMobile)
    })
  },
  mounted() {
    this.initWebSocket()
    this.getChatRecords()
    const userAgent = navigator.userAgent
    if (userAgent.indexOf('Edge') > -1) {
      this.$nextTick(() => {
        this.collapsed = !this.collapsed
        setTimeout(() => {
          this.collapsed = !this.collapsed
        }, 16)
      })
    }

    // first update color
    // TIPS: THEME COLOR HANDLER!! PLEASE CHECK THAT!!
    if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
      updateTheme(this.settings.primaryColor)
    }
  },
  methods: {
    i18nRender,
    handleMediaQuery(val) {
      this.query = val
      if (this.isMobile && !val['screen-xs']) {
        this.isMobile = false
        return
      }
      if (!this.isMobile && val['screen-xs']) {
        this.isMobile = true
        this.collapsed = false
        this.settings.contentWidth = false
        // this.settings.fixSiderbar = false
      }
    },
    handleCollapse(val) {
      this.collapsed = val
    },
    handleSettingChange({ type, value }) {
      console.log('type', type, value)
      type && (this.settings[type] = value)
      switch (type) {
        case 'contentWidth':
          this.settings[type] = value === 'Fixed'
          break
        case 'layout':
          if (value === 'sidemenu') {
            this.settings.contentWidth = false
          } else {
            this.settings.fixSiderbar = false
            this.settings.contentWidth = true
          }
          break
      }
    },
    logoRender() {
      return <LogoSvg />
    },
    getChatRecords() {
      getChatRecords(this.$store.getters.userInfo.id).then((res) => {
        if (res.success) {
          this.records = res.data.list
        }
      })
    },
    connection() {
      // 建立连接对象
      //连接服务端提供的通信接口，连接以后才可以订阅广播消息和个人消息
      let _that = this
      //后台服务ip和port
      _that.socket = new SockJS('http://localhost:8080/api/admin/service')
      // 获取STOMP子协议的客户端对象
      _that.stompClient = Stomp.over(_that.socket)
      // 向服务器发起websocket连接
      _that.stompClient.connect(
        {
          Authorization: token,
        },
        // "/service",
        (frame) => {
          _that.stompClient.subscribe(`/topic/${this.$store.getters.userInfo.name}`, (msg) => {
            //msg.body存放的是服务端发送给我们的信息
            let resData = JSON.parse(msg.body)
            this.newMessage = resData
            if (this.records.length > 0) {
              let currentUserMessage = this.records.filter(item=>{return item.userMobile == resData.userMobile})[0]
              if (currentUserMessage) {
                  if (currentUserMessage.userMobile == this.chatUserMobile) {
                    currentUserMessage.unReadCount = 0
                  } else {
                    currentUserMessage.unReadCount += 1
                  }
                  currentUserMessage.avatar = resData.avatar
                  currentUserMessage.records.push(resData)
              } else {
                  this.records.push({
                    userMobile : resData.userMobile,
                    userNickname : resData.userNickname,
                    avatar : resData.avatar,
                    unReadCount : 1,
                    records : [resData]
                  })
              }
            } else  {
              
              let data = []
              data.push({
                userMobile : resData.userMobile,
                userNickname : resData.userNickname,
                avatar : resData.avatar,
                unReadCount : 1,
                records : [resData]
              })
              this.records = data
            }
            if (this.chatUserMobile != resData.userMobile || !this.chatUserMobile) {
                  
                  this.openNotification(resData)
            }
          })
        },
        (err) => {}
      )
    },
    disconnect() {
      if (this.stompClient) {
        this.stompClient.disconnect()
      }
    },
    sendMessage(message) {
        this.stompClient.send("/app/chat", {}, JSON.stringify(message));
    },
    sendImg(message) {
      this.sendMessage(message)
    },
    openNotification(data) {
      if (data.type == 'image') {
        data.desc = '[图片]'
      } else {
        data.desc = data.content
      }

      const avatar = this.$createElement('img', {
        attrs: { src: data.avatar },
        style: { width: '40px', height: '40px' },
      })
      const key = data.userMobile
      notification.open({
        key: key,
        message: data.userNickname,
        description: data.desc,
        icon: avatar,
      })
      setTimeout(() => {
        notification.open({
          key: key,
          message: data.userNickname,
          description: data.desc,
          icon: avatar,
        })
      }, 2000)
    },
    initWebSocket() {
      this.connection()
      let that = this
      // 断开重连机制,尝试发送消息,捕获异常发生时重连
      this.timer = setInterval(() => {
        try {
          that.stompClient.send('test')
        } catch (err) {
          console.log('断线了: ' + err)
          that.connection()
        }
      }, 5000)
    },
    chatopen(userMobile) {
      this.chatUserMobile = userMobile
      let record = this.records.filter(item=>{return item.userMobile == userMobile})[0]
      record.unReadCount = 0
      updateChat({
        userMobile : userMobile
      }).then(res=>{
          record.unReadCount = 0
      })

    },
    chatclose(userMobile) {
      this.chatUserMobile = ''
    },
   
    
  
  },
}
</script>

<style lang="less">
@import './BasicLayout.less';
</style>
