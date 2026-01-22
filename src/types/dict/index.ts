/**
 * 字典项
 */
export interface DictRowItem {
  id: number | null
  dictName: string
  dictCode: string
  dictType: string
  enableFlag: boolean
  remark: string
}

/**
 * 显示样式
 */
type showStyle = 'primary' | 'info' | 'success' | 'warning' | 'danger'

/**
 * 字典值项
 */
export interface DictValueRowItem {
  id: number | null
  dictId: number
  dictLabel: string
  dictValue: string
  showStyle: showStyle
  orderNum: number
}

/**
 * 字典搜索参数
 */
export type DictSearchParams = Partial<
  Pick<DictRowItem, 'dictCode' | 'dictType' | 'enableFlag' | 'remark' | 'dictName' | 'id'> &
    Api.Common.CommonSearchParams
>

/**
 * 字典项搜索参数
 */
export type DictValueSearchParams = Partial<
  Pick<DictValueRowItem, 'dictId' | 'dictLabel' | 'dictValue' | 'showStyle' | 'orderNum'> &
    Api.Common.CommonSearchParams
>
