import request from '@/utils/request'

export function fetchServer(data) {
  return request({
    url: '/api/server/',
    method: 'get',
    param: data
  })
}

export function usage(data) {
  return request({
    url: '/api/server/' + data['id'] + '/usage/',
    method: 'post',
    data
  })
}

export function connect(id) {
  return request({
    url: '/api/server/' + id + '/connect/',
    method: 'get'
  })
}

export function disconnect(id) {
  return request({
    url: '/api/server/' + id + '/disconnect/',
    method: 'get'
  })
}

export function editServer(data) {
  return request({
    url: '/api/server/' + data.id + '/',
    method: 'put',
    data
  })
}

export function validateUser(id, data) {
  return request({
    url: '/api/server/' + id + '/user/',
    method: 'post',
    data
  })
}

export function deleteServer(id) {
  return request({
    url: '/api/server/' + id + '/',
    method: 'delete'
  })
}
