import request from '@/utils/request'

const api = {
    brandList : "/product/brand/list",
    upload : "/product/brand/upload",
    add : "/product/brand/add",
    addCategory : '/product/brand/addCategory',
    deleteCategory : '/product/brand/deleteCategory',
    updateBrand : '/product/brand/update',
    deleteBrand : '/product/brand/delete',
    all : '/product/brand/all'
}
export function getAllBrand() {
    return request({
        url : api.all,
        method : 'get',
    })
}

export function getBrandList(param) {
    return request({
        url : api.brandList,
        method : 'get',
        params : param
    })
}

export function upload(param) {
    return request({
        url : api.upload,
        method : 'post',
        data : param
    })
}

export function add(param) {
    return request({
        url : api.add,
        method : 'post',
        data : param
    })
}

export function addCategory(param) {
    return request({
        url : api.addCategory,
        method : 'post',
        data : param
    })
}

export function deleteCategory(param) {
    return request({
        url : api.deleteCategory,
        method : 'post',
        data : param
    })
}

export function updateBrand(param) {
    return request({
        url : api.updateBrand,
        method : 'post',
        data : param
    })
}

export function deleteBrand(param) {
    return request({
        url : api.deleteBrand + `/${param}`,
        method : 'post',
    })
}