/**
 * 知识库文档管理相关接口
 */

import request from '@/utils/http'
import type {
  KnowledgeDocRowItem,
  KnowledgeDocSearchParams,
  KnowledgeDocContentItem
} from '@/types/knowledge-doc'

/**
 * 上传知识库文档
 */
export function uploadKnowledgeDoc(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<KnowledgeDocRowItem>({
    url: '/api/knowledge/doc/upload',
    data: formData
  })
}

/**
 * 分页查询知识库文档信息
 */
export function fetchKnowledgeDocPage(params: KnowledgeDocSearchParams) {
  return request.post<Api.Common.PaginatedResponse<KnowledgeDocRowItem>>({
    url: '/api/knowledge/doc/page',
    params: params
  })
}

/**
 * 解析文档
 */
export function parseKnowledgeDoc(id: number) {
  return request.post<boolean>({
    url: `/api/knowledge/doc/parse/${id}`
  })
}

/**
 * 向量处理文档
 */
export function vectorKnowledgeDoc(id: number) {
  return request.post<boolean>({
    url: `/api/knowledge/doc/vector/${id}`
  })
}

/**
 * 查询文档内容
 */
export function fetchKnowledgeDocContent(docId: number) {
  return request.get<KnowledgeDocContentItem>({
    url: `/api/knowledge/doc/content/${docId}`
  })
}

/**
 * 更新文档内容
 */
export function updateKnowledgeDocContent(docId: number, content: string) {
  return request.put<boolean>({
    url: '/api/knowledge/doc/content',
    data: { docId, content }
  })
}

/**
 * 删除文档
 */
export function deleteKnowledgeDoc(ids: number[]) {
  return request.del<boolean>({
    url: '/api/knowledge/doc/delete',
    data: { ids }
  })
}
