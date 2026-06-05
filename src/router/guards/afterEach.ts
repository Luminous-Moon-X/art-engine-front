import { nextTick } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import { Router, RouteLocationNormalized } from 'vue-router'
import NProgress from 'nprogress'
import { useCommon } from '@/hooks/core/useCommon'
import { loadingService } from '@/utils/ui'
import { getPendingLoading, resetPendingLoading } from './beforeEach'
import { recordMenuLog } from '@/api/log'
import { useUserStore } from '@/store/modules/user'

/** 路由全局后置守卫 */
export function setupAfterEachGuard(router: Router) {
  const { scrollToTop } = useCommon()

  router.afterEach((to: RouteLocationNormalized) => {
    scrollToTop()

    // 关闭进度条
    const settingStore = useSettingStore()
    if (settingStore.showNprogress) {
      NProgress.done()
      // 确保进度条完全移除，避免残影
      setTimeout(() => {
        NProgress.remove()
      }, 600)
    }

    // 关闭 loading 效果
    if (getPendingLoading()) {
      nextTick(() => {
        loadingService.hideLoading()
        resetPendingLoading()
      })
    }

    // 记录菜单日志（仅记录有标题且非隐藏的菜单导航，且已登录状态）
    try {
      const userStore = useUserStore()
      if (userStore.accessToken && to.meta?.title && !to.meta?.isHide) {
        const menuName = typeof to.meta.title === 'string' ? to.meta.title : String(to.meta.title)
        recordMenuLog({ menuName, menuPath: to.path }).catch(() => {
          // 静默失败，不影响用户体验
        })
      }
    } catch {
      // 忽略菜单日志记录失败
    }
  })
}
