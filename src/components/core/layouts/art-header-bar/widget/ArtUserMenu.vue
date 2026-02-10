<!-- 用户菜单 -->
<template>
  <ElPopover
    ref="userMenuPopover"
    placement="bottom-end"
    :width="240"
    :hide-after="0"
    :offset="10"
    trigger="hover"
    :show-arrow="false"
    popper-class="user-menu-popover"
    popper-style="padding: 5px 16px;"
  >
    <template #reference>
      <img
        class="size-8.5 mr-5 c-p rounded-full max-sm:w-6.5 max-sm:h-6.5 max-sm:mr-[16px]"
        src="@imgs/user/avatar.webp"
        alt="avatar"
      />
    </template>
    <template #default>
      <div class="pt-3">
        <div class="flex-c pb-1 px-0">
          <img
            class="w-10 h-10 mr-3 ml-0 overflow-hidden rounded-full float-left"
            src="@imgs/user/avatar.webp"
          />
          <div class="w-[calc(100%-60px)] h-full">
            <span class="block text-sm font-medium text-g-800 truncate">{{
              userInfo.userName
            }}</span>
            <span class="block mt-0.5 text-xs text-g-500 truncate">{{ userInfo.email }}</span>
          </div>
        </div>
        <ul class="py-4 mt-3 border-t border-g-300/80">
          <li class="btn-item" @click="goPage('/system/user/user-center')">
            <ArtSvgIcon icon="ri:user-3-line" />
            <span>{{ $t('topBar.user.userCenter') }}</span>
          </li>
          <li class="btn-item" @click="resetPwd()">
            <ArtSvgIcon icon="ri:lock-password-line" />
            <span>{{ $t('topBar.user.resetPassword') }}</span>
          </li>
          <li class="btn-item" @click="toDocs()" v-if="false">
            <ArtSvgIcon icon="ri:book-2-line" />
            <span>{{ $t('topBar.user.docs') }}</span>
          </li>
          <li class="btn-item" @click="toGithub()" v-if="false">
            <ArtSvgIcon icon="ri:github-line" />
            <span>{{ $t('topBar.user.github') }}</span>
          </li>
          <li class="btn-item" @click="lockScreen()" v-if="false">
            <ArtSvgIcon icon="ri:lock-line" />
            <span>{{ $t('topBar.user.lockScreen') }}</span>
          </li>
          <div class="w-full h-px my-2 bg-g-300/80"></div>
          <div class="log-out c-p" @click="loginOut">
            {{ $t('topBar.user.logout') }}
          </div>
        </ul>
      </div>
    </template>
  </ElPopover>

  <el-dialog
    v-model="passwordDialogVisible"
    :title="$t('topBar.user.resetPassword')"
    width="500px"
    @close="closePasswordDialog"
  >
    <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="passwordForm.oldPassword"
          type="password"
          show-password
          :placeholder="$t('login.placeholder.password')"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="passwordForm.newPassword"
          type="password"
          show-password
          :placeholder="$t('register.placeholder.password')"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="passwordForm.confirmPassword"
          type="password"
          show-password
          :placeholder="$t('register.placeholder.confirmPassword')"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closePasswordDialog">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitPassword(passwordFormRef)">
          {{ $t('common.confirm') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import {
    ElMessageBox,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    FormInstance,
    FormRules
  } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { WEB_LINKS } from '@/utils/constants'
  import { mittBus } from '@/utils/sys'
  import { reactive, ref } from 'vue'
  import CryptoJS from 'crypto-js'
  import { userResetPassword } from '@/api/auth'

  defineOptions({ name: 'ArtUserMenu' })

  const router = useRouter()
  const { t } = useI18n()
  const userStore = useUserStore()

  const { getUserInfo: userInfo } = storeToRefs(userStore)
  const userMenuPopover = ref()

  // Password Dialog Logic
  const passwordDialogVisible = ref(false)
  const passwordFormRef = ref<FormInstance>()
  const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  /**
   * 确认密码校验
   * @param rule 校验规则
   * @param value 输入值
   * @param callback 回调函数
   */
  const validateConfirmPassword = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback()
    } else if (value !== passwordForm.newPassword) {
      callback(new Error(t('register.rule.passwordMismatch')))
    } else {
      callback()
    }
  }

  /**
   * 新密码校验
   * @param rule 校验规则
   * @param value 输入值
   * @param callback 回调函数
   */
  const validateNewPassword = (rule: any, value: string, callback: any) => {
    if (value === passwordForm.oldPassword) {
      callback(new Error(t('topBar.user.newPasswordSameAsOld')))
    } else {
      callback()
    }
  }

  /**
   * 密码校验规则
   */
  const passwordRules = reactive<FormRules>({
    oldPassword: [{ required: true, message: t('topBar.user.requiredOriginPwd'), trigger: 'blur' }],
    newPassword: [
      { required: true, message: t('topBar.user.requiredNewPwd'), trigger: 'blur' },
      { validator: validateNewPassword, trigger: 'blur' }
    ],
    confirmPassword: [
      { validator: validateConfirmPassword, trigger: 'blur' },
      { required: true, message: t('topBar.user.confirmNewPwd'), trigger: 'blur' }
    ]
  })

  /**
   * 页面跳转
   * @param {string} path - 目标路径
   */
  const goPage = (path: string): void => {
    router.push(path)
  }

  /**
   * 修改密码
   */
  const resetPwd = (): void => {
    closeUserMenu()
    passwordDialogVisible.value = true
  }

  /**
   * 关闭修改密码弹窗
   */
  const closePasswordDialog = () => {
    passwordDialogVisible.value = false
    passwordFormRef.value?.resetFields()
  }

  /**
   * 提交修改密码
   * @param formEl 表单实例
   */
  const submitPassword = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
      if (valid) {
        // 密码加密
        passwordForm.oldPassword = CryptoJS.MD5(passwordForm.oldPassword).toString()
        passwordForm.newPassword = CryptoJS.MD5(passwordForm.newPassword).toString()
        passwordForm.confirmPassword = CryptoJS.MD5(passwordForm.confirmPassword).toString()
        userResetPassword(passwordForm).then(() => {
          ElMessage({
            message: t('topBar.user.resetPwdSuccess'),
            type: 'success'
          })
          closePasswordDialog()
          // 修改密码成功，登出当前用户
          userStore.logOut()
        })
      }
    })
  }

  /**
   * 打开文档页面
   */
  const toDocs = (): void => {
    window.open(WEB_LINKS.DOCS)
  }

  /**
   * 打开 GitHub 页面
   */
  const toGithub = (): void => {
    window.open(WEB_LINKS.GITHUB)
  }

  /**
   * 打开锁屏功能
   */
  const lockScreen = (): void => {
    mittBus.emit('openLockScreen')
  }

  /**
   * 用户登出确认
   */
  const loginOut = (): void => {
    closeUserMenu()
    setTimeout(() => {
      ElMessageBox.confirm(t('common.logOutTips'), t('common.tips'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        customClass: 'login-out-dialog'
      }).then(() => {
        userStore.logOut()
      })
    }, 200)
  }

  /**
   * 关闭用户菜单弹出层
   */
  const closeUserMenu = (): void => {
    setTimeout(() => {
      userMenuPopover.value.hide()
    }, 100)
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  @layer components {
    .btn-item {
      @apply flex items-center p-2 mb-3 select-none rounded-md cursor-pointer last:mb-0;

      span {
        @apply text-sm;
      }

      .art-svg-icon {
        @apply mr-2 text-base;
      }

      &:hover {
        background-color: var(--art-gray-200);
      }
    }
  }

  .log-out {
    @apply py-1.5
    mt-5
    text-xs
    text-center
    border
    border-g-400
    rounded-md
    transition-all
    duration-200
    hover:shadow-xl;
  }
</style>
