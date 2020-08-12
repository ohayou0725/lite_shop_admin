import request from '@/utils/request'

const api = {
  tree : "/product/category/tree",
  category: "/product/category/search",
  deleteCate: "/product/category/delete",
  detail : "/product/category/detail",
  cateByLevel : "/product/category/level",
  update : "/product/category/update",
  add : '/product/category/add',
  attr : '/product/category/attr/list',
  addAttr: '/product/category/attr/add',
  updateAttr : '/product/category/attr/update',
  deleteAttr : '/product/category/attr/delete'
}

export function getTree () {
  return request({
    url : api.tree,
    method : "get"
  })
}

export function searchCategory (param) {
  return request({
    url : api.category,
    method : "get",
    params : param
  })
}
export function deleteCate (param) {
  return request({
    url : api.deleteCate,
    method : "post",
    data : param
  })
}
export function getDetail (param) {
  return request({
    url : api.detail + `/${param}`,
    method : "get",
  })
}
export function getCateByLevel (param) {
  return request({
    url : api.cateByLevel + `/${param}`,
    method : "get",
  })
}
export function getUploadToken (param) {
  return request ({
    url : api.uploadToken + `/${param}`,
    method : "get",
  })
}

export function update(param) {
  return request({
    url : api.update,
    method : "post",
    data : param
  })
}

export function add (param) {
  return request({
    url : api.add,
    method : "post",
    data : param,
  })
}

export function getAllAttr () {
  return request({
    url : api.attr,
    method : "get",
  })
}

export function addAttr (param) {
  return request({
    url : api.addAttr,
    method : "post",
    data : param
  })
}

export function updateAttr (param) {
  return request({
    url : api.updateAttr,
    method : "post",
    data : param
  })
}

export function deleteAttr (param) {
  return request({
    url : api.deleteAttr,
    method : "post",
    data : param
  })
}

