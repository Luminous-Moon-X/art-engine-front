import request from '@/utils/http'
import {
  OssConfigRowItem,
  OssConfigSearchParams,
  OssConfigSubmitParams,
  OssFileRowItem,
  OssFileSearchParams
} from '@/types/oss'

/**
 * 分页查询对象存储配置
 */
export function fetchOssConfigPage(params: OssConfigSearchParams) {
  return request.post<Api.Common.PaginatedResponse<OssConfigRowItem>>({
    url: '/api/oss/config/page',
    params: params
  })
}

/**
 * 新增对象存储配置
 */
export function addOssConfig(params: OssConfigSubmitParams) {
  return request.post<boolean>({
    url: '/api/oss/config/add',
    data: params
  })
}

/**
 * 编辑对象存储配置
 */
export function editOssConfig(params: OssConfigSubmitParams) {
  return request.put<boolean>({
    url: '/api/oss/config/edit',
    data: params
  })
}

/**
 * 启用对象存储配置
 */
export function enableOssConfig(id: number) {
  return request.put<boolean>({
    url: `/api/oss/config/enable/${id}`
  })
}

/**
 * 删除对象存储配置
 */
export function deleteOssConfig(ids: number[]) {
  return request.del<boolean>({
    url: '/api/oss/config/delete',
    data: { ids }
  })
}

/**
 * 上传文件到当前启用的对象存储
 */
export function uploadOssFile(file: File, directory?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (directory) {
    formData.append('directory', directory)
  }
  return request.post<OssFileRowItem>({
    url: '/api/oss/file/upload',
    data: formData
  })
}

/**
 * 分页查询上传文件信息
 */
export function fetchOssFilePage(params: OssFileSearchParams) {
  return request.post<Api.Common.PaginatedResponse<OssFileRowItem>>({
    url: '/api/oss/file/page',
    params: params
  })
}

/**
 * 删除文件信息与对象存储文件
 */
export function deleteOssFile(ids: number[]) {
  return request.del<boolean>({
    url: '/api/oss/file/delete',
    data: { ids }
  })
}
