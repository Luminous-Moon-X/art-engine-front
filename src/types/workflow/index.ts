/**
 * 流程定义项
 */
export interface WorkflowDefinitionRowItem {
  id?: number
  /** 流程编码（同一编码下由引擎维护多个版本） */
  flowCode?: string
  /** 流程名称 */
  flowName?: string
  /** 设计器模型（CLASSICS经典模型 MIMIC仿钉钉模型） */
  modelValue?: string
  /** 流程类别 */
  category?: string
  /** 流程版本（由引擎自动生成） */
  version?: string
  /** 是否发布（0未发布 1已发布 9已失效） */
  isPublish?: number
  /** 审批表单是否自定义（Y是 N否） */
  formCustom?: string
  /** 审批表单路径 */
  formPath?: string
  /** 流程激活状态（0挂起 1激活） */
  activityStatus?: number
  /** 监听器类型 */
  listenerType?: string
  /** 监听器路径 */
  listenerPath?: string
  /** 扩展字段 */
  ext?: string
  /** 创建人 */
  createBy?: string
  /** 创建时间 */
  createTime?: string
  /** 更新人 */
  updateBy?: string
  /** 更新时间 */
  updateTime?: string
}

/**
 * 流程定义下拉选项
 */
export interface WorkflowDefinitionOption {
  categoryList: string[]
}

/**
 * 流程定义搜索参数
 */
export type WorkflowDefinitionSearchParams = Partial<
  Pick<
    WorkflowDefinitionRowItem,
    'flowCode' | 'flowName' | 'category' | 'isPublish' | 'activityStatus'
  > &
    Api.Common.CommonSearchParams
>
