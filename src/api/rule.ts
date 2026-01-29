import request from '@/utils/http'
import { RuleRowItem, RuleSearchParams, RuleItem } from '@/types/rule'

/**
 * 获取规则列表
 */
export function fetchRuleList(params: RuleSearchParams) {
  return request.post<RuleRowItem[]>({
    url: '/api/rule/page',
    params: params
  })
}

/**
 * 获取规则详情
 */
export function getRuleByCode(code: string) {
  return request.get<RuleItem>({
    url: '/api/rule/code/' + code
  })
}

/**
 * 创建规则
 */
export function createRule(data: RuleRowItem) {
  return request.post<boolean>({
    url: '/api/rule/add',
    data
  })
}

/**
 * 更新规则
 */
export function updateRule(data: RuleRowItem) {
  return request.put<boolean>({
    url: '/api/rule/edit',
    data
  })
}

/**
 * 删除规则
 */
export function deleteRule(id: number) {
  return request.del<boolean>({
    url: '/api/rule/delete',
    data: { ids: [id] }
  })
}
