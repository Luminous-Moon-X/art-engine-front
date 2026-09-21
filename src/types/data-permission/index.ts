/**
 * 数据权限（行权限）相关类型
 */

/**
 * 数据权限表格行项
 * 对应后端实体类 PermissionRow，多选字段以英文逗号拼接
 */
export interface DataPermissionRowItem {
  id?: number
  /** 授权主体类型 */
  subjectType: string
  /** 授权主体 */
  permissionSubject: string
  /** 授权客体（多个表名以英文逗号拼接） */
  permissionObject: string
  /** 授权范围 */
  permissionScope: string
  /** 自定义部门权限范围（多个部门ID以英文逗号拼接） */
  customDeptScope?: string
  /** 自定义权限字段 */
  columnCondition?: string
  /** 自定义权限字段关系 */
  columnRelation?: string
  /** 自定义权限字段值 */
  columnValue?: string
  /** 是否启用 */
  enableFlag: boolean
  /** 创建时间 */
  createTime?: string
}

/**
 * 带备注的选项项
 * 用于表名、字段名下拉：左侧展示名称，右侧展示备注
 */
export interface DataPermissionOptionItem {
  label: string
  value: string
  /** 备注（表备注 / 字段备注） */
  comment?: string
}

/**
 * 数据库表项
 */
export interface DataPermissionTableItem {
  /** 表名 */
  tableName: string
  /** 表备注 */
  tableComment?: string
}

/**
 * 数据库表字段项
 */
export interface DataPermissionTableColumnItem {
  /** 字段名 */
  columnName: string
  /** 字段备注 */
  columnComment?: string
}

/**
 * 数据权限表单数据
 * 弹框内部状态：多选字段以数组承载，提交时再拼接为字符串
 */
export interface DataPermissionForm {
  id?: number
  /** 授权主体类型 */
  subjectType: string
  /** 授权主体 */
  permissionSubject: string
  /** 授权客体（表名集合） */
  permissionObject: string[]
  /** 授权范围 */
  permissionScope: string
  /** 自定义部门权限范围（部门ID集合） */
  customDeptScope: number[]
  /** 自定义权限字段 */
  columnCondition: string
  /** 自定义权限字段关系 */
  columnRelation: string
  /** 自定义权限字段值 */
  columnValue: string
  /** 是否启用 */
  enableFlag: boolean
}

/**
 * 数据权限提交参数
 * 与后端实体保持一致：多选字段以英文逗号拼接
 */
export type DataPermissionSubmitParams = Omit<
  DataPermissionForm,
  'permissionObject' | 'customDeptScope'
> & {
  permissionObject: string
  customDeptScope: string
}

/**
 * 数据权限搜索参数
 */
export type DataPermissionSearchParams = Partial<
  Pick<
    DataPermissionRowItem,
    | 'subjectType'
    | 'permissionSubject'
    | 'permissionObject'
    | 'permissionScope'
    | 'enableFlag'
    | 'id'
  > &
    Api.Common.CommonSearchParams
>
