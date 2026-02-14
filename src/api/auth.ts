import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    data: params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 登出
 * @param params 登出参数
 * @returns 登出响应
 */
export function fetchLogout() {
  return request.post({
    url: '/api/auth/logout'
  })
}

/**
 * 修改密码
 * @param params 修改密码参数
 * @returns 修改密码响应
 */
export function userResetPassword(params: Api.Auth.UserResetPasswordParams) {
  return request.put({
    url: '/api/auth/userResetPassword',
    data: params
  })
}

/**
 * 强制重置密码
 * @param params 强制重置密码参数
 * @returns 强制重置密码响应
 */
export function forceResetPassword(params: Api.Auth.ForceResetPasswordParams) {
  return request.put({
    url: '/api/auth/changePasswordWithTempToken',
    data: params
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}
