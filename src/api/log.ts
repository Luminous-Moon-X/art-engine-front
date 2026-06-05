import request from '@/utils/http'
import {
  type LoginLogRowItem,
  type MenuLogRowItem,
  type ApiLogRowItem,
  type LoginLogSearchParams,
  type MenuLogSearchParams,
  type ApiLogSearchParams,
  type MenuLogRecordParams
} from '@/types/log'

// ==================== 登录日志 ====================

// 获取登录日志列表
export function fetchGetLoginLogList(params: LoginLogSearchParams) {
  return request.post<LoginLogRowItem[]>({
    url: '/api/log/login/page',
    params: params
  })
}

// 删除登录日志
export function delLoginLog(id: number) {
  return request.del<boolean>({
    url: '/api/log/login/delete',
    data: { ids: [id] }
  })
}

// ==================== 菜单日志 ====================

// 获取菜单日志列表
export function fetchGetMenuLogList(params: MenuLogSearchParams) {
  return request.post<MenuLogRowItem[]>({
    url: '/api/log/menu/page',
    params: params
  })
}

// 删除菜单日志
export function delMenuLog(id: number) {
  return request.del<boolean>({
    url: '/api/log/menu/delete',
    data: { ids: [id] }
  })
}

// 上报菜单日志
export function recordMenuLog(data: MenuLogRecordParams) {
  return request.post<boolean>({
    url: '/api/log/menu/record',
    params: data
  })
}

// ==================== 接口日志 ====================

// 获取接口日志列表
export function fetchGetApiLogList(params: ApiLogSearchParams) {
  return request.post<ApiLogRowItem[]>({
    url: '/api/log/api/page',
    params: params
  })
}

// 删除接口日志
export function delApiLog(id: number) {
  return request.del<boolean>({
    url: '/api/log/api/delete',
    data: { ids: [id] }
  })
}
