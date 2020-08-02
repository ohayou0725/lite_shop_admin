import request from '@/utils/request'

const api = {
  list : "/member/list",
  changeStatus : "/member/changeStatus",
  addrList: "/member/address/list",
  collectList : "/member/collect/list",
  historyList : "/member/history/list",
  opinionList : "/member/opinion/list"
}


export function getList (queryParam) {
  return request({
    url : api.list,
    method : 'get',
    params : queryParam
  })
}

export function changeStatus (param) {
  return request({
    url : api.changeStatus,
    method : "post",
    data : param
  })
}
export function getAddrList (queryParam) {
  return request({
    url : api.addrList,
    method : 'get',
    params : queryParam
  })
}
export function getCollectList (queryParam) {
  return request({
    url : api.collectList,
    method : 'get',
    params : queryParam
  })
}
export function getHistoryList (queryParam) {
  return request({
    url : api.historyList,
    method : 'get',
    params : queryParam
  })
}

export function getOpinionList (queryParam) {
  return request({
    url : api.opinionList,
    method : 'get',
    params : queryParam
  })
}
