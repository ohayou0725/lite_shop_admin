import axios from 'axios'
import store from '@/store'
// import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 tokenI
    const token = window.sessionStorage.getItem(ACCESS_TOKEN)
    if (data.code === 40300) {
      notification.error({
        message: '权限不足',
        description: data.msg
      })
    }
    if (data.code === 400203 || data.code === 400204) {
      notification.error({
        message: '用户未认证',
        description: data.msg
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(config => {
  const token = window.sessionStorage.getItem(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  if (response.data.code === 200) {
    const accessToken = response.headers['access-token']
    const refreshToken = response.headers['refresh-token']
    if (accessToken !== undefined || refreshToken !== undefined) {
      window.sessionStorage.setItem(ACCESS_TOKEN, refreshToken !== undefined ? 'Bearer ' + refreshToken : 'Bearer ' + accessToken)
    }
  }
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
