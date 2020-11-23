import request from '@/utils/request'

export function fetchGroup() {
  return request({
    url: '/api/group/',
    method: 'get',
  })
}

export function createGroup(data) {
  return request({
    url: '/api/group/',
    method: 'post',
    data
  })
}

export function deleteGroup(data) {
  return request({
    url: '/api/group/' + data + '/',
    method: 'delete',
  })
}

export function fetchAuth(groupID) {
  return request({
    url: '/api/auth/' + groupID + '/',
    method: 'get',
  })
}

export function changeAuth(data) {
  return request({
    url: '/api/auth/change/',
    method: 'post',
    data
  })
}
