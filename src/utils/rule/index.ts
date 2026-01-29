import { getRuleByCode } from '@/api/rule'
import type { RuleItem } from '@/types/rule'

/**
 * 根据规则编码获取规则详情
 * @param code 规则编码
 * @returns 规则详情
 */
export async function getRule(code: string): Promise<RuleItem> {
  return getRuleByCode(code).catch((error) => {
    console.error(`[Rule] Get rule ${code} failed:`, error)
    return {} as RuleItem
  })
}
