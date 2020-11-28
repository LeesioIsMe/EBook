<template>
  <div class="regist-container">
    <el-form
      ref="registForm"
      :model="registForm"
      :rules="registRules"
      class="regist-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">用户 注册</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registForm.username"
          placeholder="username"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip
        v-model="capsTooltip"
        content="Caps lock is On"
        placement="right"
        manual
      >
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="registForm.password"
            :type="passwordType"
            placeholder="Password"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleRegiste"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon
              :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
            />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-tooltip
        v-model="capsTooltip"
        content="Caps lock is On"
        placement="right"
        manual
      >
        <el-form-item prop="confirmPassword">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="confirmPasswordType"
            ref="confirmPassword"
            v-model="registForm.confirmPassword"
            :type="confirmPasswordType"
            placeholder="comfirm password"
            name="confirmPassword"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleRegiste"
          />
          <span class="show-pwd" @click="showConfirmPwd">
            <svg-icon
              :icon-class="
                confirmPasswordType === 'password' ? 'eye' : 'eye-open'
              "
            />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click.native.prevent="handleRegiste"
      >注册</el-button>
    </el-form>
    <el-button
      :loading="loading"
      type="text"
      style="position: fixed; right: 40px; top: 20px"
      @click="$router.push('/login')"
    >登陆</el-button>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import MD5 from 'md5'

export default {
  name: 'Registe',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(
          new Error('用户名由字母开头，长度8～20的数字、字母组成，请检查用户名')
        )
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      const Min_Password_Length = 8
      const Max_Password_Length = 20
      if (
        value.length < Min_Password_Length &&
        value.length > Max_Password_Length
      ) {
        callback(new Error('密码由8～20位数字、字母组成，请检查格式'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (this.registForm.password != value) {
        callback(new Error('两次密码输入不相同, 重新输入'))
      } else {
        callback()
      }
    }
    return {
      registForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      registRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ],
        confirmPassword: [
          {
            required: true,
            trigger: 'blur',
            validator: validateConfirmPassword
          }
        ]
      },
      passwordType: 'password',
      confirmPasswordType: 'password',
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {},
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.registForm.username === '') {
      this.$refs.username.focus()
    } else if (this.registForm.password === '') {
      this.$refs.password.focus()
    } else if (this.registForm.confirmPassword === '') {
      this.$refs.confirmPassword.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && key >= 'A' && key <= 'Z'
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    showConfirmPwd() {
      if (this.confirmPasswordType === 'password') {
        this.confirmPasswordType = ''
      } else {
        this.confirmPasswordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.confirmPassword.focus()
      })
    },
    handleRegiste() {
      this.$refs.registForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$post('/api/user/add', {
            username: this.registForm.username,
            password: this.registForm.password
          })
            .then((res) => {
              if (res.code != 200) {
                this.loading = false
                return this.$message({
                  message: res.msg,
                  type: 'error'
                })
              }
              this.$message.success('注册成功, 即将跳转登陆...')
              setTimeout(() => { this.$router.push('/login') }, 2000)
            })
            .catch((err) => {
              console.log('网络错误')
              this.loading = false
            })
        } else {
          this.loading = false
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .regist-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.regist-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.regist-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .regist-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
