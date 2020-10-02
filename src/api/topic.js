import request from '@/utils/request'

const api = {
    topicList : "/operation/topic/list",
    changeShow : "/operation/topic/changeShow",
    goodsList : "/operation/topic/allGoods",
    addGoods : "/operation/topic/addGoods",
    removeGoods : "/operation/topic/deleteGoods",
    addTopic : '/operation/topic/add',
    content : '/operation/topic/content',
    deleteTopic : '/operation/topic/delete',
    editTopic : '/operation/topic/update'
}

export function getTopicList(params) {
    return request({
        url : api.topicList,
        method : 'get',
        params : params
    })
}

export function changeShow(params) {
    return request({
        url : api.changeShow,
        method : 'post',
        data : params
    })
}

export function getDetail(id) {
    return request({
        url : api.goodsList + `/${id}`,
        method : 'get',
    })
}
export function addGoods(params) {
    return request({
        url : api.addGoods,
        method : 'post',
        data : params
    })
}

export function removeGoods(params) {
    return request({
        url : api.removeGoods,
        method : 'post',
        data : params
    })
}

export function addTopic(params) {
    return request({
        url : api.addTopic,
        method : 'post',
        data : params
    })
}

export function editContent(params) {
    return request({
        url : api.content,
        method : 'post',
        data : params
    })
}

export function deleteTopic(id) {
    return request({
        url : api.deleteTopic + `/${id}`,
        method : 'post',
    })
}

export function editTopic(params) {
    return request({
        url : api.editTopic,
        method : 'post',
        data : params
    })
}
