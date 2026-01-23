import request from '@/utils/http'
import { type UserRowItem, type UserSearchParams } from '@/types/user'

// 获取用户列表
export function fetchGetUserList(params: UserSearchParams) {
  return request.post<UserRowItem[]>({
    url: '/api/user/page',
    params: params
  })
}

// 新增用户
export function addUser(params: UserRowItem) {
  return request.post<boolean>({
    url: '/api/user/add',
    data: params
  })
}

// 编辑用户
export function editUser(params: UserRowItem) {
  return request.put<boolean>({
    url: '/api/user/edit',
    data: params
  })
}

// 删除用户
export function delUser(id: number) {
  return request.del<boolean>({
    url: '/api/user/delete',
    data: { ids: [id] }
  })
}
