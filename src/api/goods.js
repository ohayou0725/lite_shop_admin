import request from '@/utils/request'

const api = {
   spuList : '/product/goods/list',
   spuDetail : '/product/goods/detail',
   upload : '/product/goods/upload',
   uploadGallery : '/product/goods/upload/gallery',
   addGoods: '/product/goods/add'
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