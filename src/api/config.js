import request from '@/utils/request'
const api = {
    orderConfig : "/setting/order",
    freightConfig :'/setting/freight'
}

export function getOrderConfig() {
    return request({
        url : api.orderConfig,
        method : "get",
    })
}

export function updateOrderConfig(data) {
    return request({
        url : api.orderConfig,
        method : "post",
        data : data
    })
}

export function getFreightConfig() {
    return request({
        url : api.freightConfig,
        method : "get",
    })
}

export function updateFreightConfig(data) {
    return request({
        url : api.freightConfig,
        method : "post",
        data : data
    })
}