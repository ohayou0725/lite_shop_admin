import request from '@/utils/request'

const api = {
   spuList : '/product/goods/list',
   spuDetail : '/product/goods/detail',
   upload : '/product/goods/upload',
   uploadGallery : '/product/goods/upload/gallery',
   addGoods: '/product/goods/add',
   updateGoods: '/product/goods/update/basicInfo',
   chageStatus: '/product/goods/changeStatus',
   editBasicInfo: '/product/goods/update/basicInfo',
   editDetail : '/product/goods/update/detail',
   editAttr : '/product/goods/update/attr',
   getSpecs : '/product/goods/specs',
   editSepc : '/product/goods/update/spec',
   deleteGoods : '/product/goods/delete',
   skuList : '/product/goods/sku',
   getSpecsByGoodsSn :'/product/goods/getSpec',
   addGoodsSku : '/product/goods/sku/add',
   editSku :'/product/goods/sku/update',
   deleteSku : '/product/goods/sku/offShelf',
   deleteAllSku : '/product/goods/sku/allOffShelf'
}

export function getSpuList(params) {
    return request({
        url : api.spuList,
        method : "get",
        params : params
    })
}

export function getSpuDetail(id) {
    return request({
        url : api.spuDetail + `/${id}`,
        method : "get",
    })
}

export function upload() {
    return request({
        url : api.upload,
        method : "post",
    })
}

export function uploadGallery() {
    return request({
        url : api.uploadGallery,
        method : "post",
    })
}

export function addGoods(params) {
    return request({
        url : api.addGoods,
        method : "post",
        data : params
    })
}

export function changeStatus(params) {
    return request({
        url : api.chageStatus,
        method : "post",
        data : params
    })
}

export function editBasicInfo(params) {
    return request({
        url : api.editBasicInfo,
        method : "post",
        data : params
    })
}

export function editDetail(params) {
    return request({
        url : api.editDetail,
        method : "post",
        data : params
    })
}

export function editAttr(params) {
    return request({
        url : api.editAttr,
        method : "post",
        data : params
    })
}
export function editSpec(params) {
    return request({
        url : api.editSepc,
        method : "post",
        data  : params
    })
}

export function getSpecs(params) {
    return request({
        url : api.getSpecs + `/${params}`,
        method : "get",
    })
}

export function deleteGoods(params) {
    return request({
        url : api.deleteGoods + `/${params}`,
        method : "post",
    })
}

export function skuList(params) {
    return request({
        url : api.skuList,
        method : "get",
        params : params
    })
}

export function getSpecsByGoodsSn(params) {
    return request({
        url : api.getSpecsByGoodsSn,
        method : 'get',
        params :params
    })
}

export function addSku(data) {
    return request({
        url : api.addGoodsSku,
        method : 'post',
        data :data
    })
}

export function editSku(data) {
    return request({
        url : api.editSku,
        method : 'post',
        data :data
    })
}

export function deleteSku(id) {
    return request({
        url : api.deleteSku + `/${id}`,
        method : 'post'
    })
}

export function deleteAllSku(id) {
    return request({
        url : api.deleteAllSku + `/${id}`,
        method : 'post'
    })
}

