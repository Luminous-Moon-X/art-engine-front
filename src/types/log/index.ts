/**
 * 登录日志行数据类型
 */
export interface LoginLogRowItem {
  id?: number
  userName: string
  nickName: string
  loginIp: string
  loginTime: string
  browser: string
  os: string
  status: number
  message: string
}

/**
 * 菜单日志行数据类型
 */
export interface MenuLogRowItem {
  id?: number
  userId: number
  userName: string
  nickName: string
  menuName: string
  menuPath: string
  clickTime: string
}

/**
 * 接口日志行数据类型
 */
export interface ApiLogRowItem {
  id?: number
  userId: number
  userName: string
  nickName: string
  requestUrl: string
  requestMethod: string
  requestTime: string
  responseCode: number
  requestParams: string
  responseResult: string
  costTime: number
  ip: string
  description: string
}

/**
 * 登录日志查询参数
 */
export type LoginLogSearchParams = Partial<
  Pick<LoginLogRowItem, 'userName' | 'nickName' | 'loginIp' | 'status'> &
    Api.Common.CommonSearchParams & {
      loginTimeStart?: string
      loginTimeEnd?: string
    }
>

/**
 * 菜单日志查询参数
 */
export type MenuLogSearchParams = Partial<
  Pick<MenuLogRowItem, 'userName' | 'nickName' | 'menuName' | 'menuPath'> &
    Api.Common.CommonSearchParams & {
      clickTimeStart?: string
      clickTimeEnd?: string
    }
>

/**
 * 接口日志查询参数
 */
export type ApiLogSearchParams = Partial<
  Pick<ApiLogRowItem, 'userName' | 'nickName' | 'requestUrl' | 'requestMethod' | 'responseCode'> &
    Api.Common.CommonSearchParams & {
      requestTimeStart?: string
      requestTimeEnd?: string
    }
>

/**
 * 菜单日志上报参数
 */
export interface MenuLogRecordParams {
  menuName: string
  menuPath: string
}
