import Mock from 'mockjs'

// 模拟租户数据列表
const tenantList = Mock.mock({
  'list|10-20': [
    {
      'id|+1': 1,
      name: '@company',
      expireDate: '@date("yyyy-MM-dd")',
      'status|1': [true, false], // true: 启用, false: 禁用
      createTime: '@datetime',
      description: '@csentence(5, 15)',
      adminName: '@name',
      'adminAccount|1': ['admin', 'manager', 'root', 'user']
    }
  ]
}).list

// 模拟菜单权限树
const menuTree = [
  {
    id: 1,
    label: '系统管理',
    children: [
      { id: 11, label: '用户管理' },
      { id: 12, label: '角色管理' },
      { id: 13, label: '菜单管理' },
      { id: 14, label: '部门管理' }
    ]
  },
  {
    id: 2,
    label: '租户管理',
    children: [
      { id: 21, label: '租户列表' },
      { id: 22, label: '套餐管理' }
    ]
  },
  {
    id: 3,
    label: '示例页面',
    children: [
      { id: 31, label: '表单示例' },
      { id: 32, label: '表格示例' }
    ]
  }
]

// 拦截租户列表查询
Mock.mock(RegExp('/api/system/tenant/list.*'), 'get', (options: any) => {
  const { page = 1, size = 10, name } = getQueryParameters(options.url)

  let result = [...tenantList]

  if (name) {
    result = result.filter((item) => item.name.includes(name))
  }

  const total = result.length
  const start = (page - 1) * size
  const end = start + size
  const pageList = result.slice(start, end)

  return {
    code: 200,
    message: 'success',
    data: {
      list: pageList,
      total: total,
      current: parseInt(page),
      size: parseInt(size)
    }
  }
})

// 拦截租户创建
Mock.mock('/api/system/tenant/create', 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const newTenant = {
    id: tenantList.length + 1,
    ...body,
    createTime: Mock.mock('@datetime')
  }
  tenantList.unshift(newTenant)
  return {
    code: 200,
    message: '创建成功',
    data: newTenant
  }
})

// 拦截租户更新
Mock.mock('/api/system/tenant/update', 'put', (options: any) => {
  const body = JSON.parse(options.body)
  const index = tenantList.findIndex((item: any) => item.id === body.id)
  if (index !== -1) {
    tenantList[index] = { ...tenantList[index], ...body }
  }
  return {
    code: 200,
    message: '更新成功',
    data: tenantList[index]
  }
})

// 拦截租户删除
Mock.mock(RegExp('/api/system/tenant/delete.*'), 'delete', (options: any) => {
  const { id } = getQueryParameters(options.url)
  const index = tenantList.findIndex((item: any) => item.id == id)
  if (index !== -1) {
    tenantList.splice(index, 1)
  }
  return {
    code: 200,
    message: '删除成功'
  }
})

// 拦截菜单权限获取
Mock.mock('/api/system/tenant/menus', 'get', () => {
  return {
    code: 200,
    message: 'success',
    data: menuTree
  }
})

// 辅助函数：解析URL参数
function getQueryParameters(url: string) {
  const params: any = {}
  const queryString = url.split('?')[1]
  if (queryString) {
    const pairs = queryString.split('&')
    for (const pair of pairs) {
      const [key, value] = pair.split('=')
      params[key] = decodeURIComponent(value)
    }
  }
  return params
}

export default Mock
