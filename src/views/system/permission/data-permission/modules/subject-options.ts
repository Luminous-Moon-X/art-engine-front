import { fetchGetRoleSelect } from '@/api/role'
import { getDeptTreeNoTop } from '@/api/dept'
import { userTree } from '@/api/user'
import type { DeptOptionItem } from '@/types/dept'

/**
 * 数据权限-授权主体类型字典值
 * 与数据字典 system_permission_subject_type 的字典值保持一致
 */
export const SUBJECT_TYPE_ROLE = 'role'
export const SUBJECT_TYPE_DEPT = 'dept'
export const SUBJECT_TYPE_USER = 'user'

/**
 * 授权主体下拉选项
 */
export interface SubjectOption {
  label: string
  value: string
}

/**
 * 部门树拍平为下拉列表选项
 *
 * @param list 部门树
 * @returns 拍平后的下拉选项
 */
const flattenDeptOptions = (list: DeptOptionItem[]): SubjectOption[] =>
  list.reduce<SubjectOption[]>((acc, item) => {
    acc.push({ label: item.label, value: String(item.value) })
    if (item.children?.length) {
      acc.push(...flattenDeptOptions(item.children))
    }
    return acc
  }, [])

/**
 * 按授权主体类型加载授权主体选项
 * 角色 -> 角色列表，部门 -> 部门列表，用户 -> 用户列表
 *
 * @param subjectType 授权主体类型
 * @returns 授权主体下拉选项
 */
export const loadSubjectOptions = (subjectType: string): Promise<SubjectOption[]> => {
  if (subjectType === SUBJECT_TYPE_ROLE) {
    return fetchGetRoleSelect().then((res) =>
      (res || []).map((item) => ({ label: item.label, value: String(item.value) }))
    )
  }
  if (subjectType === SUBJECT_TYPE_DEPT) {
    return getDeptTreeNoTop().then((res) => flattenDeptOptions(res || []))
  }
  if (subjectType === SUBJECT_TYPE_USER) {
    return userTree().then((res) =>
      (res || []).map((item) => ({ label: item.label, value: String(item.value) }))
    )
  }
  return Promise.resolve([])
}

/**
 * 加载全部授权主体类型的主体选项，用于表格按类型回显主体名称
 * 单个类型加载失败时不影响其他类型，仅该类型回退为主体ID
 *
 * @returns 授权主体类型 -> 主体选项列表
 */
export const loadAllSubjectOptions = async (): Promise<Record<string, SubjectOption[]>> => {
  const types = [SUBJECT_TYPE_ROLE, SUBJECT_TYPE_DEPT, SUBJECT_TYPE_USER]
  const entries = await Promise.all(
    types.map(async (type) => {
      try {
        return [type, await loadSubjectOptions(type)] as const
      } catch (err) {
        console.error(`[数据权限] 授权主体选项加载失败（${type}）：`, err)
        return [type, [] as SubjectOption[]] as const
      }
    })
  )
  return Object.fromEntries(entries)
}
