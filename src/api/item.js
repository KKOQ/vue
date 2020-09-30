import request from '@/utils/request'

export function fetchItems(query) {
  return request({
    url: 'api/item/view/',
    method: 'get',
    params: query
  })
}

export function runItem(data) {
  return request({
    url: 'api/item/run/',
    method: 'post',
    data
  })
}

export function updateItem(data) {
  return request({
    url: 'api/item/update/',
    method: 'put',
    data
  })
}

export function queryServers(query) {
  return request({
    url: 'api/server/query/',
    method: 'get',
    params: query
  })
}

export function queryMenus() { // 请求测试项可以转移到哪些菜单下
  return request({
    url: 'api/menu/query/',
    method: 'get'
  })
}

export function uploadScript(data) {
  return request({
    url: 'api/item/upload/',
    method: 'post',
    data
  })
}
