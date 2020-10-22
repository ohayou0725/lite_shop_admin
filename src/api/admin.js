import request from '@/utils/request'

const api = {
  list: 'system/user/list',
  addUser : 'system/user/add',
  resetPassword : 'system/user/resetPassword',
  updateUser : 'system/user/update',
  deleteUser : 'system/user/delete'
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