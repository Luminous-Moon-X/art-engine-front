<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            :validate-on-rule-change="false"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="tenantId" v-if="tenantEnable">
              <ElSelect
                v-model="formData.tenantId"
                class="custom-height w-full"
                :placeholder="$t('login.placeholder.tenant')"
              >
                <ElOption
                  v-for="item in tenantOptions"
                  :key="item.id"
                  :label="item.tenantName"
                  :value="String(item.id)"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem prop="username">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.username')"
                v-model.trim="formData.username"
              />
            </ElFormItem>
            <ElFormItem prop="password">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.password')"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <!-- 推拽验证 -->
            <div class="relative pb-5 mt-6">
              <div
                class="relative z-[2] overflow-hidden select-none rounded-lg border border-transparent tad-300"
                :class="{ '!border-[#FF4E4F]': !isPassing && isClickPass }"
              >
                <ArtDragVerify
                  ref="dragVerify"
                  v-model:value="isPassing"
                  :text="$t('login.sliderText')"
                  textColor="var(--art-gray-700)"
                  :successText="$t('login.sliderSuccessText')"
                  progressBarBg="var(--main-color)"
                  :background="isDark ? '#26272F' : '#F1F1F4'"
                  handlerBg="var(--default-box-color)"
                />
              </div>
              <p
                class="absolute top-0 z-[1] px-px mt-2 text-xs text-[#f56c6c] tad-300"
                :class="{ 'translate-y-10': !isPassing && isClickPass }"
              >
                {{ $t('login.placeholder.slider') }}
              </p>
            </div>

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">{{
                $t('login.forgetPwd')
              }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm text-gray-600">
              <span>{{ $t('login.noAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">{{
                $t('login.register')
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <ElDialog
      v-model="passwordDialogVisible"
      :title="$t('topBar.user.resetPassword')"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      append-to-body
    >
      <ElForm
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
        label-position="top"
      >
        <ElFormItem :label="$t('topBar.user.requiredNewPwd')" prop="newPassword">
          <ElInput
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            :placeholder="$t('topBar.user.requiredNewPwd')"
          />
        </ElFormItem>
        <ElFormItem :label="$t('topBar.user.confirmNewPwd')" prop="confirmPassword">
          <ElInput
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            :placeholder="$t('topBar.user.confirmNewPwd')"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton type="primary" @click="handlePasswordSubmit" class="w-full">
            {{ $t('forgetPassword.submitBtnText') }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '@/utils/http/error'
  import { fetchLogin, forceResetPassword } from '@/api/auth'
  import { fetchTenantList } from '@/api/tenant'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
  import { useSettingStore } from '@/store/modules/setting'
  import CryptoJS from 'crypto-js'

  defineOptions({ name: 'Login' })

  const settingStore = useSettingStore()
  const { isDark } = storeToRefs(settingStore)
  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  // 多租户是否启用（由后端 art.tenant.enable 控制，启用时登录前需选择租户）
  const tenantEnable = ref(false)
  // 租户下拉选项
  const tenantOptions = ref<Api.Tenant.TenantOptionItem[]>([])
  // 加载多租户配置与租户列表
  const loadTenants = async () => {
    tenantEnable.value = await userStore.loadTenantConfig()
    if (tenantEnable.value) {
      const list = await fetchTenantList()
      tenantOptions.value = list || []
      // 默认选择第一个租户
      if (tenantOptions.value.length > 0) {
        formData.tenantId = String(tenantOptions.value[0].id)
      }
    }
  }
  onMounted(loadTenants)

  const dragVerify = ref()

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()
  const isPassing = ref(false)
  const isClickPass = ref(false)

  const formRef = ref<FormInstance>()

  const formData = reactive({
    tenantId: '',
    username: '',
    password: '',
    rememberPassword: true
  })

  // 表单验证规则（tenantId 仅在租户下拉框渲染时参与校验）
  const rules = computed<FormRules>(() => ({
    tenantId: [{ required: true, message: t('login.placeholder.tenant'), trigger: 'change' }],
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }]
  }))

  const loading = ref(false)

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      // 拖拽验证
      if (!isPassing.value) {
        isClickPass.value = true
        return
      }

      loading.value = true

      // 登录请求
      const { username, password } = formData

      // md5 加密
      const md5Password = CryptoJS.MD5(password).toString()

      const { token, forceChangePassword } = await fetchLogin({
        userName: username,
        password: md5Password,
        tenantId: tenantEnable.value ? formData.tenantId : undefined
      })

      // 验证token
      if (!token) {
        throw new Error('Login failed - no token received')
      }

      // 强制修改密码
      if (forceChangePassword) {
        passwordDialogVisible.value = true
        // 存储 token，以便后续修改密码接口使用
        userStore.setToken(token)
        loading.value = false
        return
      }

      // 存储 token 和登录状态
      userStore.setToken(token)
      userStore.setLoginStatus(true)

      // 登录成功处理
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      // 处理 HttpError
      if (error instanceof HttpError) {
        // console.log(error.code)
      } else {
        // 处理非 HttpError
        // ElMessage.error('登录失败，请稍后重试')
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      loading.value = false
      resetDragVerify()
    }
  }

  // 重置拖拽验证
  const resetDragVerify = () => {
    dragVerify.value.reset()
  }

  // 修改密码弹窗
  const passwordDialogVisible = ref(false)
  const passwordFormRef = ref<FormInstance>()
  const passwordForm = reactive({
    newPassword: '',
    confirmPassword: ''
  })

  const validateConfirmPassword = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error(t('topBar.user.confirmNewPwd')))
    } else if (value !== passwordForm.newPassword) {
      callback(new Error(t('register.rule.passwordMismatch')))
    } else {
      callback()
    }
  }

  const passwordRules = computed<FormRules>(() => ({
    newPassword: [
      { required: true, message: t('topBar.user.requiredNewPwd'), trigger: 'blur' },
      { min: 6, message: t('register.rule.passwordLength'), trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
  }))

  const handlePasswordSubmit = async () => {
    if (!passwordFormRef.value) return
    await passwordFormRef.value.validate((valid) => {
      if (valid) {
        forceResetPassword({
          newPassword: CryptoJS.MD5(passwordForm.newPassword).toString(),
          confirmPassword: CryptoJS.MD5(passwordForm.confirmPassword).toString(),
          tempToken: userStore.getToken()
        }).then(() => {
          // 关闭弹窗
          passwordDialogVisible.value = false
          ElMessage({
            message: t('topBar.user.resetPwdSuccess'),
            type: 'success'
          })
        })
      }
    })
  }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${userStore.getUserInfo.userName}!`
      })
    }, 1000)
  }
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  :deep(.el-select__wrapper) {
    height: 40px !important;
  }
</style>
