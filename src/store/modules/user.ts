/**
 * 用户状态管理模块
 *
 * 提供用户相关的状态管理
 *
 * ## 主要功能
 *
 * - 用户登录状态管理
 * - 用户信息存储
 * - 访问令牌和刷新令牌管理
 * - 语言设置
 * - 搜索历史记录
 * - 锁屏状态和密码管理
 * - 登出清理逻辑
 *
 * ## 使用场景
 *
 * - 用户登录和认证
 * - 权限验证
 * - 个人信息展示
 * - 多语言切换
 * - 锁屏功能
 * - 搜索历史管理
 *
 * ## 持久化
 *
 * - 使用 localStorage 存储
 * - 存储键：sys-v{version}-user
 * - 登出时自动清理
 *
 * @module store/modules/user
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LanguageEnum } from '@/enums/appEnum'
import { router } from '@/router'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { AppRouteRecord } from '@/types/router'
import { setPageTitle } from '@/utils/router'
import { resetRouterState } from '@/router/guards/beforeEach'
import { useMenuStore } from './menu'
import { fetchLogout } from '@/api/auth'
import { fetchTenantConfig, switchTenant as switchTenantApi } from '@/api/tenant'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'

/**
 * 租户切换跨标签页同步通道名
 * 后端按 token 记录生效租户，切换对同一 token 的所有标签页全局生效，
 * 其它标签页必须重新加载，避免出现"旧租户界面 + 新租户数据"的混用。
 */
const TENANT_SYNC_CHANNEL = 'art-tenant-switch'

let tenantSyncChannel: BroadcastChannel | null = null

/**
 * 监听其它标签页的租户切换并重新加载当前页面
 */
function setupTenantSync(): void {
  if (typeof window === 'undefined' || tenantSyncChannel) {
    return
  }
  if (typeof BroadcastChannel !== 'undefined') {
    tenantSyncChannel = new BroadcastChannel(TENANT_SYNC_CHANNEL)
    tenantSyncChannel.onmessage = () => window.location.reload()
    return
  }
  // 兜底：不支持 BroadcastChannel 的浏览器使用 storage 事件（仅其它标签页触发）
  window.addEventListener('storage', (event) => {
    if (event.key === TENANT_SYNC_CHANNEL) {
      window.location.reload()
    }
  })
}

/**
 * 通知其它标签页租户已切换
 */
function broadcastTenantSwitch(): void {
  if (tenantSyncChannel) {
    tenantSyncChannel.postMessage({ type: 'tenant-switched', at: Date.now() })
    return
  }
  try {
    localStorage.setItem(TENANT_SYNC_CHANNEL, String(Date.now()))
  } catch {
    // 存储不可用时忽略
  }
}

/**
 * 用户状态管理
 * 管理用户登录状态、个人信息、语言设置、搜索历史、锁屏状态等
 */
export const useUserStore = defineStore(
  'userStore',
  () => {
    // 注册跨标签页租户切换监听（同一 token 的租户上下文全局生效）
    setupTenantSync()
    const { t } = useI18n()
    // 语言设置
    const language = ref(LanguageEnum.ZH)
    // 登录状态
    const isLogin = ref(false)
    // 锁屏状态
    const isLock = ref(false)
    // 锁屏密码
    const lockPassword = ref('')
    // 用户信息
    const info = ref<Partial<Api.Auth.UserInfo>>({})
    // 搜索历史记录
    const searchHistory = ref<AppRouteRecord[]>([])
    // 访问令牌
    const accessToken = ref('')
    // 刷新令牌
    const refreshToken = ref('')
    // 多租户是否启用（通过租户公共配置接口获取，避免持久化陈旧值）
    const tenantEnable = ref(false)
    // 当前生效租户（来自用户信息接口）
    const currentTenant = computed(() => ({
      tenantId: info.value.tenantId,
      tenantName: info.value.tenantName
    }))

    // 计算属性：获取用户信息
    const getUserInfo = computed(() => info.value)
    // 计算属性：获取设置状态
    const getSettingState = computed(() => useSettingStore().$state)
    // 计算属性：获取工作台状态
    const getWorktabState = computed(() => useWorktabStore().$state)

    /**
     * 设置用户信息
     * @param newInfo 新的用户信息
     */
    const setUserInfo = (newInfo: Api.Auth.UserInfo) => {
      info.value = newInfo
    }

    /**
     * 设置登录状态
     * @param status 登录状态
     */
    const setLoginStatus = (status: boolean) => {
      isLogin.value = status
    }

    /**
     * 设置语言
     * @param lang 语言枚举值
     */
    const setLanguage = (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value)
      language.value = lang
    }

    /**
     * 设置搜索历史
     * @param list 搜索历史列表
     */
    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list
    }

    /**
     * 设置锁屏状态
     * @param status 锁屏状态
     */
    const setLockStatus = (status: boolean) => {
      isLock.value = status
    }

    /**
     * 设置锁屏密码
     * @param password 锁屏密码
     */
    const setLockPassword = (password: string) => {
      lockPassword.value = password
    }

    /**
     * 设置令牌
     * @param newAccessToken 访问令牌
     * @param newRefreshToken 刷新令牌（可选）
     */
    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessToken.value = newAccessToken
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken
      }
    }

    /**
     * 获取访问令牌
     * @returns 访问令牌
     */
    const getToken = () => accessToken.value

    /**
     * 加载多租户公共配置（登录页/租户切换器使用）
     * 失败时按未启用多租户处理，不影响登录
     */
    const loadTenantConfig = async () => {
      try {
        const config = await fetchTenantConfig()
        tenantEnable.value = config?.tenantEnable ?? false
      } catch {
        tenantEnable.value = false
      }
      return tenantEnable.value
    }

    /**
     * 切换当前生效租户（超级管理员）
     * 切换成功后重新加载用户信息与菜单（不退出登录）
     * @param tenantId 目标租户ID
     */
    const switchTenant = async (tenantId: number) => {
      const success = await switchTenantApi(tenantId)
      if (!success) {
        return false
      }
      // 通知其它标签页重新加载，避免其界面停留在旧租户
      broadcastTenantSwitch()
      // 清空当前租户数据并重置动态路由，触发重新拉取用户信息/菜单
      info.value = {}
      resetRouterState(300)
      setTimeout(() => {
        router.push({ path: '/' })
      }, 350)
      return true
    }

    /**
     * 退出登录
     * 清空所有用户相关状态并跳转到登录页
     */
    const logOut = () => {
      // 调用登出接口
      fetchLogout().then(() => {
        ElNotification({
          title: t('login.logoutSuccess.title'),
          type: 'success',
          duration: 2500,
          zIndex: 10000,
          message: t('login.logoutSuccess.message')
        })
        // 清空用户信息
        info.value = {}
        // 重置登录状态
        isLogin.value = false
        // 重置锁屏状态
        isLock.value = false
        // 清空锁屏密码
        lockPassword.value = ''
        // 清空访问令牌
        accessToken.value = ''
        // 清空刷新令牌
        refreshToken.value = ''
        // 清空工作台标签页
        useWorktabStore().clearAll()
        // 移除iframe路由缓存
        sessionStorage.removeItem('iframeRoutes')
        // 清空主页路径
        useMenuStore().setHomePath('')
        // 重置路由状态
        resetRouterState(500)
        router.push({
          name: 'Login'
        })
      })
    }

    /**
     * 前端退出登录(用于token过期后的处理)
     * 清空所有用户相关状态并跳转到登录页
     */
    const logoutFront = () => {
      // 清空用户信息
      info.value = {}
      // 重置登录状态
      isLogin.value = false
      // 重置锁屏状态
      isLock.value = false
      // 清空锁屏密码
      lockPassword.value = ''
      // 清空访问令牌
      accessToken.value = ''
      // 清空刷新令牌
      refreshToken.value = ''
      // 清空工作台标签页
      useWorktabStore().clearAll()
      // 移除iframe路由缓存
      sessionStorage.removeItem('iframeRoutes')
      // 清空主页路径
      useMenuStore().setHomePath('')
      // 重置路由状态
      resetRouterState(500)
      // 跳转到登录页，携带当前路由作为 redirect 参数
      const currentRoute = router.currentRoute.value
      const redirect = currentRoute.path !== '/login' ? currentRoute.fullPath : undefined
      router.push({
        name: 'Login',
        query: redirect ? { redirect } : undefined
      })
    }

    return {
      language,
      isLogin,
      isLock,
      lockPassword,
      info,
      searchHistory,
      accessToken,
      refreshToken,
      tenantEnable,
      currentTenant,
      getUserInfo,
      getSettingState,
      getWorktabState,
      getToken,
      loadTenantConfig,
      switchTenant,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setSearchHistory,
      setLockStatus,
      setLockPassword,
      setToken,
      logOut,
      logoutFront
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage
    }
  }
)
