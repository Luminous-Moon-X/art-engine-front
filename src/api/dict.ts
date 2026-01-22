import request from '@/utils/http'
import {
  DictRowItem,
  DictValueRowItem,
  DictSearchParams,
  DictValueSearchParams,
  DictItem
} from '@/types/dict'

// 获取字典列表
export function fetchGetDictList(params: DictSearchParams) {
  return request.post<DictRowItem[]>({
    url: '/api/dict/page',
    params: params
  })
}

// 新增字典
export function addDict(params: DictRowItem) {
  return request.post<boolean>({
    url: '/api/dict/add',
    data: params
  })
}

// 编辑字典
export function editDict(params: DictRowItem) {
  return request.put<boolean>({
    url: '/api/dict/edit',
    data: params
  })
}

// 删除字典
export function delDict(id: number) {
  return request.del<boolean>({
    url: '/api/dict/delete',
    data: { ids: [id] }
  })
}

// 获取字典项列表
export function fetchGetDictValueList(params: DictValueSearchParams) {
  return request.post<DictValueRowItem[]>({
    url: '/api/dictValue/page',
    params: params
  })
}

// 新增字典项
export function addDictValue(params: DictValueRowItem) {
  return request.post<boolean>({
    url: '/api/dictValue/add',
    data: params
  })
}

// 编辑字典项
export function editDictValue(params: DictValueRowItem) {
  return request.put<boolean>({
    url: '/api/dictValue/edit',
    data: params
  })
}

// 删除字典项
export function delDictValue(id: number) {
  return request.del<boolean>({
    url: '/api/dictValue/delete',
    data: { ids: [id] }
  })
}

/**
 * 根据字典编码获取字典项
 */
export function fetchGetDictItemList(dictCode: string) {
  return request.post<DictItem[]>({
    url: `/api/dictValue/list/${dictCode}`
  })
}
