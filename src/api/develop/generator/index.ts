import request from '@/utils/http'

export interface CodeGeneratorRow {
  id: number
  tableName: string
  createTime: string
  tableDescription: string
}

/**
 * 获取数据表集合
 * @param params 查询参数
 * @returns 数据表列表
 */
export const getTables = (params: any): Promise<CodeGeneratorRow[]> =>
  request.get({ url: '/api/generator/tables', params: params })
