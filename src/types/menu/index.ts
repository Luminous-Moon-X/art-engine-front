// 菜单行数据类型
export interface MenuRowItem {
  // 主键ID
  id: number | null
  // 是否启用
  enableFlag: boolean
  // 菜单类型
  menuType: 'menu' | 'button'
  // 菜单名称
  menuName: string
  // 路由路径
  routePath: string
  // 权限标识
  permissionSign: string
  // 组件路径
  componentPath: string
  // 菜单图标
  menuIcon: string
  // 排序号
  orderNum: number
  // 外部链接
  externalLink: string
  // 激活路径
  activationPath: string
  // 是否缓存
  keepAlive: boolean
  // 是否隐藏
  hideFlag: boolean
  // 是否为Iframe
  iframeFlag: boolean
  // 是否显示徽章
  showBadge: boolean
  // 是否固定标签页
  fixedTab: boolean
  // 是否隐藏标签页
  hideTab: boolean
  // 是否全屏显示
  fullScreen: boolean
  // 父ID
  parentId: number | null
  // 子菜单列表
  children: MenuRowItem[]
}

export type MenuSearchParams = Partial<
  Pick<
    MenuRowItem,
    | 'id'
    | 'menuName'
    | 'routePath'
    | 'permissionSign'
    | 'componentPath'
    | 'menuIcon'
    | 'orderNum'
    | 'externalLink'
    | 'activationPath'
    | 'keepAlive'
    | 'hideFlag'
    | 'iframeFlag'
    | 'showBadge'
    | 'fixedTab'
    | 'hideTab'
    | 'fullScreen'
  > &
    Api.Common.CommonSearchParams
>
