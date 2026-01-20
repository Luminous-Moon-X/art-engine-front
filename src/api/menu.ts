import request from '@/utils/http'
import { type MenuRowItem, type MenuSearchParams } from '@/types/menu'

// 获取菜单列表
export function fetchGetMenuList(params: MenuSearchParams) {
  return request.post<MenuRowItem[]>({
    url: '/api/menu/page',
    params: params
  })
}

// 获取菜单详情
export function fetchGetMenuById(id: number) {
  return request.get<MenuRowItem>({
    url: `/api/menu/${id}`
  })
}

// 新增菜单
export function addMenu(params: MenuRowItem) {
  return request.post<boolean>({
    url: '/api/menu/add',
    data: params
  })
}

// 编辑菜单
export function editMenu(params: MenuRowItem) {
  return request.put<boolean>({
    url: '/api/menu/edit',
    data: params
  })
}

// 删除菜单
export function delMenu(id: number) {
  return request.del<boolean>({
    url: '/api/menu/delete',
    data: { ids: [id] }
  })
}
