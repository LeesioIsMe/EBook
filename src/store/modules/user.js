import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const tokens = {
  admin: {
    token: 'admin-token'
  },
  user: {
    token: 'user-token'
  }
}

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  userNo: '',
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
  SET_USERNO: (state, userNo) => {
    state.userNo = userNo
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { type, name, userNo, logo } = userInfo
    return new Promise((resolve, reject) => {
      try {
        const data = tokens[type == 0 ? "admin" : "user"];
        // roles must be a non-empty array
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve();
      } catch (error) {
        reject(error)
      }
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      try {
        var data = state.token ? localStorage.getItem("userInfo") && JSON.parse(localStorage.getItem("userInfo")) : null;
        if (!data) {
          reject('Verification failed, please Login again.')
        }

        data.roles = [data.type == 0 ? "admin" : "user"]

        const { roles, name, logo, userNo } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }
        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', logo)
        commit('SET_USERNO', userNo)
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
        localStorage.removeItem("userInfo");
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
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
