import request from '@/utils/request'

const api = {
  orderList: '/order/list',
  detail : '/order/detail'
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