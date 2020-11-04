import request from '@/utils/request'

const api = {
  list: 'system/userRole/all',
  page : "system/userRole/list",
  changeStatus : 'system/userRole/changeStatus',
  addRole : 'system/userRole/add',
  editRole : 'system/userRole/update',
  allMenu :'system/userRole/allMenu',
  roleMenu :'system/userRole/menu',
  assignMenu : 'system/userRole/assignMenu',
  allResource : "system/userRole/allResource",
  resource : 'system/userRole/resource',
  assignResource : 'system/userRole/assignResource',
  deleteRole : 'system/userRole/delete'
}


export function roleList () {
  return request({
    url : api.list,
    method : 'get',
  })
}

export function getRoles (param) {
  return request({
    url : api.page,
    method : 'get',
    params : param
  })
}

export function changeStatus (param) {
  return request({
    url : api.changeStatus,
    method : 'post',
    data : param
  })
}

export function addRole (param) {
  return request({
    url : api.addRole,
    method : 'post',
    data : param
  })
}

export function editRole (param) {
  return request({
    url : api.editRole,
    method : 'post',
    data : param
  })
}

export function allMenu () {
  return request({
    url : api.allMenu,
    method : 'get',
  })
}

export function getRoleMenu (id) {
  return request({
    url : api.roleMenu + `/${id}`,
    method : 'get',
  })
}

export function assignMenu (id,param) {
  return request({
    url : api.assignMenu + `/${id}`,
    method : 'post',
    data : param
  })
}

export function allResource () {
  return request({
    url : api.allResource,
    method : 'get',
  })
}

export function getResource (id) {
  return request({
    url : api.resource + `/${id}`,
    method : 'get',
  })
}

export function assignResource (id,param) {
  return request({
    url : api.assignResource + `/${id}`,
    method : 'post',
    data : param
  })
}

export function deleteRole (id) {
  return request({
    url : api.deleteRole + `/${id}`,
    method : 'post',
  })
}