import request from '@/utils/request'

const api = {
    getComment : "/product/comment/list",
    getDetail : "/product/comment/detail"
}

export function commentList(params) {
    return request({
        url : api.getComment,
        method : 'get',
        params : params
    })
}

export function commentDetail(params) {
    return request({
        url : api.getDetail + `/${params}`,
        method : 'get',
    })
}