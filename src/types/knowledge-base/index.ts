/**
 * 知识库管理相关类型
 */

/** 知识库行数据 */
export interface KnowledgeBaseRowItem {
  id: number
  /** 知识库名称 */
  kbName: string
  /** 知识库描述 */
  kbDesc?: string
  /** 封面文件ID（关联OSS文件表，为空时使用默认封面） */
  coverOssFileId?: number
  /** 创建时间 */
  createTime?: string
  /** 修改时间 */
  updateTime?: string
}

/** 分页查询参数 */
export type KnowledgeBaseSearchParams = Partial<
  Pick<KnowledgeBaseRowItem, 'kbName'> & Api.Common.CommonSearchParams
>

/** 新增/编辑知识库提交表单 */
export interface KnowledgeBaseForm {
  id?: number | null
  kbName: string
  kbDesc?: string
  coverOssFileId?: number | null
}