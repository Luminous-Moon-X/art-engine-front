/**
 * 规则项
 */
export interface RuleRowItem {
  id?: number
  ruleName: string
  ruleCode: string
  ruleValue: string
  ruleValueType: string
  enableFlag: boolean
  createTime?: Date
  remark?: string
}

/**
 * 规则搜索参数
 */
export type RuleSearchParams = Partial<
  Pick<
    RuleRowItem,
    'ruleCode' | 'ruleValue' | 'createTime' | 'ruleValueType' | 'enableFlag' | 'ruleName' | 'id'
  > &
    Api.Common.CommonSearchParams
>
