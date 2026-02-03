import request from '@/utils/http'

/**
 * 获取菜单权限
 * @param type 权限类型
 * @param id 权限ID
 * @returns 菜单权限列表
 */
export function getMenuPermission(type: string, id: number) {
  return request.get<string[]>({
    url: `/api/menuPermission?type=${type}&id=${id}`
  })
}

/**
 * 设置菜单权限
 * @param type 授权主体类型：role user dept
 * @param id 授权主体ID
 * @param permissionSigns 菜单权限标识集合
 * @returns 无
 */
export function setPermission(type: string, id: number, permissionSigns: number[]) {
  return request.post<boolean>({
    url: `/api/menuPermission?type=${type}&id=${id}`,
    data: {
      type: type,
      id: id,
      permissionSignList: permissionSigns
    }
  })
}
