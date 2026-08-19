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
  /** 所属知识库ID */
  kbId?: number
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
  Pick<KnowledgeDocRowItem, 'docName' | 'kbId'> & Api.Common.CommonSearchParams
>

/** 文档内容行数据 */
export interface KnowledgeDocContentItem {
  /** 主键 */
  id?: number
  /** 关联文档ID */
  docId: number
  /** 文档内容（markdown文本） */
  content?: string
  /** 内容解析开始时间 */
  parseStartTime?: string
  /** 内容解析结束时间 */
  parseEndTime?: string
}