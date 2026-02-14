import request from '@/utils/http'
import { type UserRowItem, type UserSearchParams, type DeptUserTreeItem } from '@/types/user'

// 获取用户列表
export function fetchGetUserList(params: UserSearchParams) {
  return request.post<UserRowItem[]>({
    url: '/api/user/page',
    params: params
  })
}

// 获取部门用户树
export function deptUserTree() {
  return request.get<DeptUserTreeItem[]>({
    url: '/api/user/deptUserTree'
  })
}

// 获取用户树
export function userTree() {
  return request.get<DeptUserTreeItem[]>({
    url: '/api/user/userTree'
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

// 重置用户密码为默认密码
export function resetDefaultPassword(id: number) {
  return request.put<boolean>({
    url: `/api/user/resetDefaultPassword?userId=${id}`
  })
}
