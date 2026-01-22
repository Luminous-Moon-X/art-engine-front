import request from '@/utils/http'
import { type DeptRowItem, type DeptSearchParams } from '@/types/dept'

// 获取部门列表
export function fetchGetDeptList(params: DeptSearchParams) {
  return request.post<DeptRowItem[]>({
    url: '/api/dept/page',
    params: params
  })
}

// 新增部门
export function addDept(params: DeptRowItem) {
  return request.post<boolean>({
    url: '/api/dept/add',
    data: params
  })
}

// 编辑部门
export function editDept(params: DeptRowItem) {
  return request.put<boolean>({
    url: '/api/dept/edit',
    data: params
  })
}

// 删除部门
export function delDept(id: number) {
  return request.del<boolean>({
    url: '/api/dept/delete',
    data: { ids: [id] }
  })
}
