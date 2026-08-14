/**
 * 知识库文档管理相关类型
 */

/** 解析/向量处理状态 */
export type KnowledgeDocStatus = 'pending' | 'processing' | 'complete' | 'error'

/** 知识库文档行数据 */
export interface KnowledgeDocRowItem {
  id: number
  /** 文档名称 */
  docName: string
  /** 文档类型（文件扩展名） */
  docType?: string
  /** OSS文件表ID */
  ossFileId?: number
  /** 内容解析状态 */
  parseStatus: KnowledgeDocStatus
  /** 向量处理状态 */
  vectorStatus: KnowledgeDocStatus
  /** 上传时间 */
  uploadTime?: string
  /** 上传人（用户ID） */
  uploadId?: number
  /** 上传人名称 */
  uploadName?: string
  /** 创建时间 */
  createTime?: string
}

/** 分页查询参数 */
export type KnowledgeDocSearchParams = Partial<
  Pick<KnowledgeDocRowItem, 'docName'> & Api.Common.CommonSearchParams
>
