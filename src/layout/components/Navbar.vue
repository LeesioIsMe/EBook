<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <!-- <error-log class="errLog-container right-menu-item hover-effect" /> -->

        <!-- <screenfull id="screenfull" class="right-menu-item hover-effect" /> -->

        <el-tooltip content="Global Size" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item :disabled="true">{{name}}</el-dropdown-item>
          <el-dropdown-item @click.native="changePasswordModal">修改密码</el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">注销</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog :visible.sync="isChangePasswordModal" width="600px">
      <el-form
        ref="changeForm"
        class="login-form"
        :rules="rules"
        :model="changeFormData"
        autocomplete="on"
        label-position="left"
      >
        <div class="title-container">
          <h3 class="title">修改密码</h3>
        </div>
        <el-form-item label="旧密码" prop="passwordOld">
          <el-input
            v-model="changeFormData.passwordOld"
            placeholder=" Old Password"
            name="passwordOld"
            type="password"
            tabindex="2"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="passwordNew">
          <el-input
            v-model="changeFormData.passwordNew"
            placeholder="New Password"
            name="passwordNew"
            type="password"
            tabindex="2"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="再次输入" prop="passwordRepeat">
          <el-input
            v-model="changeFormData.passwordRepeat"
            placeholder="Repeat New Password"
            name="passwordRepeat"
            type="password"
            tabindex="2"
            autocomplete="off"
          />
        </el-form-item>
        <el-button
          type="primary"
          style="width:100%;margin-bottom:30px;"
          @click.native.prevent="changeSubmit"
        >确认</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import ErrorLog from "@/components/ErrorLog";
import Screenfull from "@/components/Screenfull";
import SizeSelect from "@/components/SizeSelect";
import Search from "@/components/HeaderSearch";
import MD5 from "md5";
import { validPassword } from "@/utils/validate";
export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!validPassword(value)) {
        callback(new Error("密码由8～20位数字、字母组成，请检查格式"));
      } else {
        callback();
      }
    };
    return {
      isChangePasswordModal: false,
      changeFormData: {
        passwordOld: "",
        passwordNew: "",
        passwordRepeat: ""
      },
      rules: {
        passwordOld: [{ required: true, message: "旧密码不能为空" }],
        passwordNew: [
          { required: true, message: "新密码不能为空" },
          { trigger: "blur", validator: validatePassword }
        ],
        passwordRepeat: [
          { required: true, message: "重复密码不能为空" },
          { trigger: "blur", validator: validatePassword }
        ]
      }
    };
  },
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    Search
  },
  computed: {
    ...mapGetters(["name", "sidebar", "avatar", "device"])
  },
  methods: {
    changePasswordModal() {
      this.isChangePasswordModal = true;
    },
    changeSubmit() {
      this.$refs.changeForm.validate(valid => {
        if (valid) {
          const userInfo =
            localStorage.getItem("userInfo") &&
            JSON.parse(localStorage.getItem("userInfo"));
          if (
            this.changeFormData.passwordNew !=
            this.changeFormData.passwordRepeat
          ) {
            return this.$message({
              message: "新密码两次输入不一致",
              type: "error"
            });
          }
          this.$post("/api/users/changePassword", {
            id: userInfo.id,
            old: MD5(this.changeFormData.passwordOld),
            new: MD5(this.changeFormData.passwordNew),
            repeat: MD5(this.changeFormData.passwordRepeat)
          }).then(res => {
            if (res.code != 200) {
              return this.$notify({
                title: "失败",
                message: res.message,
                type: "error"
              });
            }
            this.$notify({
              title: "成功",
              message: res.message + "，您需要重新登陆...即将跳转",
              type: "success",
              duration: 2000,
              onClose: async () => {
                await this.$store.dispatch("user/logout");
                this.$router.push(`/login?redirect=${this.$route.fullPath}`);
              }
            });
            this.isChangePasswordModal = false;
          });
        } else {
          return false;
        }
      });
    },
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      await this.$store.dispatch("user/logout");
      this.$router.push(`/login?redirect=${this.$route.fullPath}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.title-container {
  position: relative;

  .title {
    font-size: 26px;
    color: #000;
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
  color: #889aa4;
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
</style>
