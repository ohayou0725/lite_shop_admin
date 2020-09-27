import request from '@/utils/request'

const api = {
  orderList: '/order/list',
  detail : '/order/detail',
  ship : '/order/ship',
  delete : '/order/delete',
  track : '/order/queryExpressTrack',
  afterSaleList: '/order/afterSale/list',
  afterSaleDetail: '/order/afterSale/detail',
  passed:'/order/afterSale/passed',
  unPassed: '/order/afterSale/refuse'
}


export function getList(param) {
  return request({
    url : api.orderList,
    method : 'get',
    params : param
  })
}

export function getDetail(id) {
  return request({
    url : api.detail + `/${id}`,
    method : 'get',
  })
}

export function ship(param) {
  return request({
    url : api.ship,
    method : 'post',
    data: param
  })
}

export function deleteOrder(id) {
  return request({
    url : api.delete + `/${id}`,
    method : 'post',
  })
}

export function queryTrack(id) {
  return request({
    url : api.track +`/${id}`,
    method : 'get',
  })
}

export function afterSaleList(params) {
  return request({
    url : api.afterSaleList,
    method : 'get',
    params : params
  })
}

export function afterSaleDetail(id) {
  return request({
    url : api.afterSaleDetail + `/${id}`,
    method : 'get',
  })
}

export function passedOrder(id) {
  return request({
    url : api.passed + `/${id}`,
    method : 'post',
  })
}

export function refuseOrder(id) {
  return request({
    url : api.unPassed + `/${id}`,
    method : 'post',
  })
}