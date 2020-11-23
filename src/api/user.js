import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/user/login/',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/api/user/info/',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/user/logout/',
    method: 'post'
  })
}

export function getRouters() {
  return request({
    url: '/api/menu/router/',
    method: 'get'
  })
}

export function changeGroup(data) {
  return request({
    url: '/api/user/change/',
    method: 'post',
    data
  })
}

export function createUser(data) {
  return request({
    url: '/api/user/',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/api/user/' + data + '/',
    method: 'delete',
  })
}
