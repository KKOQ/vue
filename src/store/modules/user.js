import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import { Message } from 'element-ui'

const getDefaultState = () => {
  return {
    token: '',
    name: '',
    avatar: '',
    ip: 0,
    time: '',
    count: 0
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_IP: (state, ip) => {
    state.ip = ip
  },
  SET_TIME: (state, time) => {
    state.time = time
  },
  SET_COUNT: (state, count) => {
    state.count = count
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        commit('SET_TOKEN', response.token)
        setToken(response.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
        if (!response) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = response


        const last_time = response['last_login_time']
        const login_count = response['login_count']
        const login_ip = response['last_login_ip']
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_TIME', last_time)
        commit('SET_IP', login_ip)
        commit('SET_COUNT', login_count)
        const util = require('util');
        const msg = util.format('欢迎%s，您最近登陆时间：%s，最近登录IP地址：%s，登录总次数：%d', name, last_time, login_ip, login_count)
        Message({type:"success", message: msg, duration:3000})
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

