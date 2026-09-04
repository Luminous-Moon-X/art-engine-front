/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      pageNumber: number
      /** 每页条数 */
      pageSize: number
      /** 总条数 */
      totalRow: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'pageNumber' | 'pageSize'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      pageNumber: number
      pageSize: number
      totalRow: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
      /** 租户ID（多租户开启时必填） */
      tenantId?: string
    }

    /** 修改密码参数 */
    interface UserResetPasswordParams {
      oldPassword: string
      newPassword: string
      confirmPassword: string
    }

    /** 强制重置密码参数 */
    interface ForceResetPasswordParams {
      newPassword: string
      confirmPassword: string
      tempToken: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
      forceChangePassword: boolean
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
      userType: string
      /**
       * 当前生效租户ID
       */
      tenantId?: number
      /**
       * 当前生效租户名称
       */
      tenantName?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      id?: number
      roleName: string
      roleCode: string
      roleDescription: string
      createTime: string
      enableFlag: number
    }
    /** 角色选项项 */
    interface RoleOptionItem {
      label: string
      value: number
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'id' | 'roleName' | 'roleCode' | 'roleDescription' | 'enableFlag'> &
        Api.Common.CommonSearchParams
    >
  }

  /** 租户管理类型 */
  namespace Tenant {
    /** 多租户公共配置 */
    interface TenantConfig {
      /** 是否启用多租户 */
      tenantEnable: boolean
      /** 默认租户ID */
      defaultTenantId: number
    }

    /** 租户列表项 */
    interface TenantListItem {
      id: number
      /** 租户编码 */
      tenantCode: string
      /** 租户名称 */
      tenantName: string
      /** 租户套餐ID */
      packageId: number
      /** 租户套餐名称 */
      packageName: string
      /** 租户管理员用户名 */
      adminUsername: string
      /** 启用状态 1-启用 0-禁用 */
      enableFlag: number
      /** 到期时间 */
      expireDate: string | null
      /** 备注 */
      remark: string
      createTime: string
    }

    /** 租户列表 */
    type TenantList = Api.Common.PaginatedResponse<TenantListItem>

    /** 租户搜索参数 */
    interface TenantSearchParams extends Api.Common.CommonSearchParams {
      tenantName?: string
      tenantCode?: string
      packageId?: number
    }

    /** 创建租户参数 */
    interface CreateTenantParams {
      tenantCode: string
      tenantName: string
      /** 租户套餐ID */
      packageId: number
      enableFlag: number
      expireDate?: string
      remark?: string
      /** 租户管理员用户名（同时创建该用户） */
      adminUsername: string
    }

    /** 更新租户参数 */
    interface UpdateTenantParams extends Partial<CreateTenantParams> {
      id: number
    }

    /** 登录/切换租户下拉选项 */
    interface TenantOptionItem {
      id: number
      tenantCode: string
      tenantName: string
    }

    /** 租户套餐列表项 */
    interface TenantPackageListItem {
      id: number
      /** 套餐名称 */
      packageName: string
      /** 勾选的菜单权限标识集合（空=不限制） */
      permissionSigns: string[]
      /** 勾选菜单数量 */
      menuCount: number
      /** 启用状态 1-启用 0-禁用 */
      enableFlag: number
      remark: string
      createTime: string
    }

    /** 租户套餐列表 */
    type TenantPackageList = Api.Common.PaginatedResponse<TenantPackageListItem>

    /** 租户套餐搜索参数 */
    interface TenantPackageSearchParams extends Api.Common.CommonSearchParams {
      packageName?: string
    }

    /** 创建租户套餐参数 */
    interface CreateTenantPackageParams {
      packageName: string
      permissionSigns: string[]
      enableFlag: number
      remark?: string
    }

    /** 更新租户套餐参数 */
    interface UpdateTenantPackageParams extends Partial<CreateTenantPackageParams> {
      id: number
    }
  }
}
