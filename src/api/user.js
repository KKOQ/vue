import request from '@/utils/request'
import { getToken } from '@/utils/auth'

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
