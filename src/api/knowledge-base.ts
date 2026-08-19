/**
 * 知识库管理相关接口
 */

import request from '@/utils/http'
import type {
  KnowledgeBaseRowItem,
  KnowledgeBaseSearchParams,
  KnowledgeBaseForm
} from '@/types/knowledge-base'

/**
 * 分页查询知识库信息
 */
export function fetchKnowledgeBasePage(params: KnowledgeBaseSearchParams) {
  return request.post<Api.Common.PaginatedResponse<KnowledgeBaseRowItem>>({
    url: '/api/knowledge/base/page',
    params: params
  })
}

/**
 * 新增知识库
 */
export function addKnowledgeBase(data: KnowledgeBaseForm) {
  return request.post<boolean>({
    url: '/api/knowledge/base/add',
    data
  })
}

/**
 * 编辑知识库
 */
export function editKnowledgeBase(data: KnowledgeBaseForm) {
  return request.put<boolean>({
    url: '/api/knowledge/base/edit',
    data
  })
}

/**
 * 删除知识库
 */
export function deleteKnowledgeBase(ids: number[]) {
  return request.del<boolean>({
    url: '/api/knowledge/base/delete',
    data: { ids }
  })
}