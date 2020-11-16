import request from '@/utils/request'

const api = {
    member : '/statistics/member',
    goods : '/statistics/product',
    order : '/statistics/order'
}

export function getMemberStatistics(params) {
    return request({
        url : api.member,
        method : 'get',
        params : params
    })
}

export function getGoodsStatistics(params) {
    return request({
        url : api.goods,
        method : 'get',
        params : params
    })
}

export function getOrderStatistics(params) {
    return request({
        url : api.order,
        method : 'get',
        params : params
    })
}