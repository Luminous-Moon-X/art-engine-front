import request from '@/utils/http'
import { RuleRowItem, RuleSearchParams } from '@/types/rule'

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
