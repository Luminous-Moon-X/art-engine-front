import request from '@/utils/http'

/**
 * 获取租户列表
 */
export function fetchTenantList(params: Api.Tenant.TenantSearchParams) {
  return request.get<Api.Tenant.TenantList>({
    url: '/api/system/tenant/list',
    params
  })
}

/**
 * 创建租户
 */
export function createTenant(data: Api.Tenant.CreateTenantParams) {
  return request.post<Api.Tenant.TenantListItem>({
    url: '/api/system/tenant/create',
    data
  })
}

/**
 * 更新租户
 */
export function updateTenant(data: Api.Tenant.UpdateTenantParams) {
  return request.put<Api.Tenant.TenantListItem>({
    url: '/api/system/tenant/update',
    data
  })
}

/**
 * 删除租户
 */
export function deleteTenant(id: number) {
  return request.delete({
    url: '/api/system/tenant/delete',
    params: { id }
  })
}

/**
 * 获取菜单权限树
 */
export function fetchMenuTree() {
  return request.get<any[]>({
    url: '/api/system/tenant/menus'
  })
}
