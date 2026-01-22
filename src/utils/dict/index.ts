import { fetchGetDictItemList } from '@/api/dict'
import type { DictItem } from '@/types/dict'

/**
 * 根据字典编码获取字典项列表
 * @param dictCode 字典编码
 * @returns 字典项列表
 */
export function getDict(dictCode: string): Promise<DictItem[]> {
  if (!dictCode) return Promise.resolve([])

  return fetchGetDictItemList(dictCode).catch((err) => {
    console.error(`[Dict] Get dict ${dictCode} failed:`, err)
    return []
  })
}

/**
 * 翻译字典值
 * @param dictCode 字典编码
 * @param value 字典值
 * @returns 字典标签
 */
export async function getDictLabel(dictCode: string, value: string | number): Promise<string> {
  const list = await getDict(dictCode).then((res) => res || [])
  const item = list.find((item) => item.dictValue === String(value))
  return item ? item.dictLabel : String(value)
}
