import request from '@/utils/http'

/**
 * 获取多租户公共配置（登录页使用）
 */
export function fetchTenantConfig() {
  return request.get<Api.Tenant.TenantConfig>({
    url: '/api/tenant/config'
  })
}

/**
 * 获取租户列表（登录页/切换租户下拉）
 */
export function fetchTenantList() {
  return request.get<Api.Tenant.TenantOptionItem[]>({
    url: '/api/tenant/list'
  })
}

/**
 * 分页获取租户列表
 */
export function fetchTenantPage(params: Api.Tenant.TenantSearchParams) {
  return request.post<Api.Tenant.TenantList>({
    url: '/api/tenant/page',
    params: params
  })
}

/**
 * 创建租户（同时创建租户管理员账号）
 */
export function createTenant(data: Api.Tenant.CreateTenantParams) {
  return request.post<boolean>({
    url: '/api/tenant/add',
    data
  })
}

/**
 * 更新租户
 */
export function updateTenant(data: Api.Tenant.UpdateTenantParams) {
  return request.put<boolean>({
    url: '/api/tenant/edit',
    data
  })
}

/**
 * 删除租户
 */
export function deleteTenant(id: number) {
  return request.del<boolean>({
    url: '/api/tenant/delete',
    data: { ids: [id] }
  })
}

/**
 * 切换当前生效租户（超级管理员）
 */
export function switchTenant(tenantId: number) {
  return request.post<boolean>({
    url: '/api/tenant/switch',
    params: { tenantId }
  })
}
