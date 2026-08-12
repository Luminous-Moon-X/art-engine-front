import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 获取菜单列表
// Backend menu tree flags are 0/1 integers; normalize them for route metadata
function normalizeMenuRoute(route: AppRouteRecord): AppRouteRecord {
  const { children, ...routeWithoutChildren } = route
  const normalized: AppRouteRecord = {
    ...routeWithoutChildren,
    meta: {
      ...route.meta,
      showBadge: Boolean(route.meta.showBadge),
      isHide: Boolean(route.meta.isHide),
      isHideTab: Boolean(route.meta.isHideTab),
      isIframe: Boolean(route.meta.isIframe),
      keepAlive: Boolean(route.meta.keepAlive),
      fixedTab: Boolean(route.meta.fixedTab)
    }
  }

  if (children?.length) {
    normalized.children = children.map(normalizeMenuRoute)
  }

  return normalized
}

export function fetchGetMenuList() {
  return request
    .get<AppRouteRecord[]>({
      url: '/api/menu/menuTree'
    })
    .then((list) => list.map(normalizeMenuRoute))
}
