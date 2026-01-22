/**
 * 部门Row类型
 */
export interface DeptRowItem {
  id: number | null
  deptName: string
  parentId: number | null
  orderNum: number
  enableFlag: boolean
  chargePerson: string
  chargePersonTel: string
  chargePersonEmail: string
  children: DeptRowItem[]
}

/**
 * 部门搜索参数
 */
export type DeptSearchParams = Partial<
  Pick<
    DeptRowItem,
    | 'deptName'
    | 'parentId'
    | 'orderNum'
    | 'enableFlag'
    | 'chargePerson'
    | 'chargePersonTel'
    | 'chargePersonEmail'
    | 'id'
  > &
    Api.Common.CommonSearchParams
>
