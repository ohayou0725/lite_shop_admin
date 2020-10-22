import request from '@/utils/request'

const api = {
  list: 'system/userRole/all'
}


export function roleList () {
  return request({
    url : api.list,
    method : 'get',
  })
}

