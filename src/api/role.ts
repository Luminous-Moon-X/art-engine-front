import request from '@/utils/http'

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.post<Api.SystemManage.RoleList>({
    url: '/api/role/page',
    params: params
  })
}

// 新增角色
export function addRole(params: Api.SystemManage.RoleListItem) {
  return request.post<boolean>({
    url: '/api/role/add',
    data: params
  })
}

// 编辑角色
export function editRole(params: Api.SystemManage.RoleListItem) {
  return request.put<boolean>({
    url: '/api/role/edit',
    data: params
  })
}
