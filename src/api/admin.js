import request from '@/utils/request'

const api = {
  list: 'system/user/list',
  addUser : 'system/user/add',
  resetPassword : 'system/user/resetPassword',
  updateUser : 'system/user/update',
  deleteUser : 'system/user/delete',
  updatePassword : 'user/updatePassword',
  updateUserInfo : 'user/updateUserInfo',
  chatRecords : 'user/service/chatRecord',
  updateChat : 'user/service/readRecord'
}


export function userList (queryParam) {
  return request({
    url : api.list,
    method : 'get',
    params : queryParam
  })
}

export function addUser (data) {
    return request({
      url : api.addUser,
      method : 'post',
      data : data
    })
  }

  export function resetPassword (id) {
    return request({
      url : api.resetPassword + `/${id}`,
      method : 'post',
    })
  }

  export function updateUser (param) {
    return request({
      url : api.updateUser,
      method : 'post',
      data : param
    })
  }

  export function deleteUser (id) {
    return request({
      url : api.deleteUser + `/${id}`,
      method : 'post',
    })
  }

  export function updatePassword (id,params) {
    return request({
      url : api.updatePassword + `/${id}`,
      method : 'post',
      data : params
    })
  }

  export function updateUserInfo (params) {
    return request({
      url : api.updateUserInfo,
      method : 'post',
      data : params
    })
  }

  export function getChatRecords () {
    return request({
      url : api.chatRecords,
      method : 'get',
    })
  }

  export function updateChat (params) {
    return request({
      url : api.updateChat,
      method : 'post',
      params 
    })
  }