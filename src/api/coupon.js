import request from '@/utils/request'

const api = {
    list : "/operation/coupon/list",
    detail : '/operation/coupon/detail',
    goodsList : '/operation/coupon/goodsList',
    addCoupon : '/operation/coupon/add',
    updateCoupon : '/operation/coupon/update',
    deleteCoupon : '/operation/coupon/delete'
}

export function couponList(params) {
    return request({
        url : api.list,
        method : 'get',
        params : params
    })
}

export function couponDetail(id) {
    return request({
        url : api.detail + `/${id}`,
        method : 'get',
    })
}

export function goodsList(params) {
    return request({
        url : api.goodsList,
        method : 'get',
        params : params
    })
}

export function addCoupon(params) {
    return request({
        url : api.addCoupon,
        method : 'post',
        data : params
    })
}

export function updateCoupon(params) {
    return request({
        url : api.updateCoupon,
        method : 'post',
        data : params
    })
}

export function deleteCoupon(id) {
    return request({
        url : api.deleteCoupon + `/${id}`,
        method : 'post',
    })
}