import request from '@/utils/request'

export function fetchMenus() {
  return request({
    url: '/api/menu/',
    method: 'get'
  })
}

export function getMenuInfo(id) {
  return request({
    url: '/api/menu/' + id + '/',
    method: 'get'
  })
}

export function updateMenu(data) {
  return request({
    url: '/api/menu/change/',
    method: 'put',
    data
  })
}
