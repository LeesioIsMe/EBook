import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  id: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERNO: (state, id) => {
    state.id = id
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { type, nickname, id, logo } = userInfo.user
    return new Promise((resolve, reject) => {
      try {
        const data = userInfo
        // roles must be a non-empty array
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      try {
        var data = state.token ? localStorage.getItem('userInfo') && JSON.parse(localStorage.getItem('userInfo')) : null
        if (!data) {
          reject('Verification failed, please Login again.')
        }

        data.roles = [data.type == 0 ? 'admin' : 'user']

        const { roles, nickname, logo, id } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ROLES', roles)
        commit('SET_NAME', nickname)
        commit('SET_AVATAR', logo)
        commit('SET_USERNO', id)
        resolve(data)
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      try {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        localStorage.removeItem('userInfo')
        removeToken()
        resetRouter()
        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
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
