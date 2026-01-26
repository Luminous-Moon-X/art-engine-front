/**
 * 用户行数据类型
 */
export interface UserRowItem {
  id?: number
  enableFlag: boolean
  userName: string
  nickName: string
  password: string
  deptId?: number
  userStatus: string
  userEmail: string
  userGender: string
  userPhone: string
  userAddress: string
  userDescription: string
  userTag: string
  roleIds: number[]
  createTime?: Date | string
}

/**
 * 用户查询参数类型
 */
export type UserSearchParams = Partial<
  Pick<
    UserRowItem,
    | 'userName'
    | 'nickName'
    | 'userStatus'
    | 'userEmail'
    | 'userGender'
    | 'userPhone'
    | 'userAddress'
    | 'userDescription'
    | 'userTag'
  > &
    Api.Common.CommonSearchParams
>
