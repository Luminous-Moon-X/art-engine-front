import request from '@/utils/http'
import {
  DataPermissionRowItem,
  DataPermissionSearchParams,
  DataPermissionSubmitParams,
  DataPermissionTableColumnItem,
  DataPermissionTableItem
} from '@/types/data-permission'

/**
 * 分页查询数据权限列表
 */
export function fetchDataPermissionPage(params: DataPermissionSearchParams) {
  return request.post<Api.Common.PaginatedResponse<DataPermissionRowItem>>({
    url: '/api/permission/row/page',
    params: params
  })
}

/**
 * 查询数据库所有表（含表备注），用于授权客体下拉
 */
export function fetchPermissionTableList() {
  return request.get<DataPermissionTableItem[]>({
    url: '/api/permission/row/table/list'
  })
}

/**
 * 查询指定表的字段列表（含字段备注），用于权限字段下拉
 * @param tableName 表名
 */
export function fetchPermissionTableColumnList(tableName: string) {
  return request.get<DataPermissionTableColumnItem[]>({
    url: `/api/permission/row/table/${tableName}/column/list`
  })
}

/**
 * 新增数据权限
 */
export function addDataPermission(data: DataPermissionSubmitParams) {
  return request.post<boolean>({
    url: '/api/permission/row/add',
    data
  })
}

/**
 * 编辑数据权限
 */
export function editDataPermission(data: DataPermissionSubmitParams) {
  return request.put<boolean>({
    url: '/api/permission/row/edit',
    data
  })
}

/**
 * 启用/禁用数据权限
 * @param id 数据权限ID
 * @param enableFlag 是否启用
 */
export function updateDataPermissionStatus(id: number, enableFlag: boolean) {
  return request.put<boolean>({
    url: `/api/permission/row/status/${id}`,
    params: { enableFlag }
  })
}

/**
 * 删除数据权限
 * @param ids 数据权限ID集合
 */
export function deleteDataPermission(ids: number[]) {
  return request.del<boolean>({
    url: '/api/permission/row/delete',
    data: { ids }
  })
}
