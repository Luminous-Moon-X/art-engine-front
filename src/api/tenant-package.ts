import request from '@/utils/http'

/**
 * 分页获取租户套餐列表
 */
export function fetchTenantPackagePage(params: Api.Tenant.TenantPackageSearchParams) {
  return request.post<Api.Tenant.TenantPackageList>({
    url: '/api/tenantPackage/page',
    params: params
  })
}

/**
 * 获取租户套餐下拉列表
 */
export function fetchTenantPackageSelect() {
  return request.get<Array<{ label: string; value: number }>>({
    url: '/api/tenantPackage/select'
  })
}

/**
 * 根据ID获取租户套餐
 */
export function fetchTenantPackageById(id: number) {
  return request.get<Api.Tenant.TenantPackageListItem>({
    url: `/api/tenantPackage/${id}`
  })
}

/**
 * 创建租户套餐
 */
export function createTenantPackage(data: Api.Tenant.CreateTenantPackageParams) {
  return request.post<boolean>({
    url: '/api/tenantPackage/add',
    data
  })
}

/**
 * 更新租户套餐
 */
export function updateTenantPackage(data: Api.Tenant.UpdateTenantPackageParams) {
  return request.put<boolean>({
    url: '/api/tenantPackage/edit',
    data
  })
}

/**
 * 删除租户套餐
 */
export function deleteTenantPackage(id: number) {
  return request.del<boolean>({
    url: '/api/tenantPackage/delete',
    data: { ids: [id] }
  })
}
