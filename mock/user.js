
const tokens = {
  admin: {
    token: 'admin-token'
  },
  user: {
    token: 'user-token'
  },
}

const users = {
  'admin-token': {
    nickName: "豪仔李大壮",
    birthday: new Date(),
    sex: 1,
    age: 23,
    resourceUploadNum: 100,
    resourceDownliadNum: 2000,
    phone: 13462222222,
    registerTime: new Date(),
    logo: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
    userType: 0 // 0 管理员  1 普通用户
  },
  'usere-token': {
    nickName: "豪仔李大壮-普通用户",
    birthday: new Date(),
    sex: 2,
    age: 34,
    resourceUploadNum: 12,
    resourceDownliadNum: 100,
    phone: 18888888888,
    registerTime: new Date(),
    logo: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
    userType: 1 // 0 管理员  1 普通用户
  },

}

export default [
  // user login
  {
    url: '/vue-element-admin/user/login',
    type: 'post',
    response: config => {
      const { account } = config.body
      const token = tokens[account]

      // mock error
      if (!token) {
        return {
          code: 60204,
          message: 'Account and password are incorrect.'
        }
      }

      return {
        code: 200,
        data: token
      }
    }
  },

  // get user info
  {
    url: '/vue-element-admin/user/info\.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      // mock error
      if (!info) {
        return {
          code: 50008,
          message: 'Login failed, unable to get user details.'
        }
      }

      return {
        code: 200,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/vue-element-admin/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 200,
        data: 'success'
      }
    }
  }
]
