<!-- 角色管理页面 -->
<template>
  <div class="art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchFormState"
      :items="searchItems"
      :show-reset-button="true"
      :show-search-button="true"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('menu', true)" v-ripple>添加菜单</ElButton>
            <ElButton @click="toggleExpand" v-ripple>
              {{ isExpanded ? '收起' : '展开' }}
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :stripe="false"
        rowKey="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 菜单编辑弹窗 -->
    <MenuEditDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :editData="currentMenuData"
      :lockType="lockMenuType"
      @success="handleSearch"
      :parent-id="parentId"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import MenuEditDialog from './modules/menu-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { type MenuRowItem } from '@/types/menu'
  import { fetchGetMenuList, delMenu } from '@/api/menu'

  defineOptions({ name: 'Menus' })
  const tableRef = ref()

  // --- 搜索相关 ---
  const searchFormState = ref({
    menuName: '',
    menuPath: ''
  })

  const searchItems = computed(() => [
    {
      key: 'menuName',
      label: '菜单名称',
      type: 'input',
      props: { placeholder: '请输入菜单名称' }
    },
    {
      key: 'menuPath',
      label: '路由地址',
      type: 'input',
      props: { placeholder: '请输入路由地址' }
    }
  ])

  const dialogVisible = ref(false)
  const currentMenuData = ref<MenuRowItem | undefined>(undefined)
  const lockMenuType = ref(false)
  const parentId = ref(-1)

  // 表格相关
  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetMenuList,
      apiParams: {
        pageNumber: 1,
        pageSize: 10
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: 'ID',
          visible: false
        },
        {
          prop: 'menuName',
          label: '菜单名称',
          minWidth: 120
        },
        {
          prop: 'menuType',
          label: '菜单类型',
          formatter: (row: MenuRowItem) => {
            return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
          }
        },
        {
          prop: 'routePath',
          label: '路由',
          formatter: (row: MenuRowItem) => {
            if (row.menuType === 'button') return ''
            return row.externalLink || row.routePath || ''
          }
        },
        {
          prop: 'enableFlag',
          label: '状态',
          formatter: (row: MenuRowItem) => {
            return h(ElTag, { type: row.enableFlag ? 'success' : 'danger' }, () =>
              row.enableFlag ? '启用' : '禁用'
            )
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          align: 'center',
          fixed: 'right',
          formatter: (row: MenuRowItem) => {
            const buttonStyle = { style: 'text-align: right' }

            if (row.menuType === 'button') {
              return h('div', buttonStyle, [
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => handleEdit(row)
                }),
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => handleDelete(row)
                })
              ])
            }

            return h('div', buttonStyle, [
              h(ArtButtonTable, {
                type: 'add',
                onClick: () => handleAddChild(row),
                title: '添加子菜单'
              }),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEdit(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
          }
        }
      ]
    }
  })

  // 弹窗类型 新增or修改
  const dialogType = ref<'menu' | 'button'>('menu')

  // 打开新增/修改弹窗
  const showDialog = (type: 'menu' | 'button', lockType: boolean, row?: MenuRowItem) => {
    parentId.value = -1
    dialogVisible.value = true
    dialogType.value = type
    lockMenuType.value = lockType
    if (!lockType && row) {
      currentMenuData.value = undefined
      parentId.value = row.id as number
    } else {
      currentMenuData.value = row
    }
  }

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    // 搜索参数赋值
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  // 重置查询条件
  const handleReset = () => {
    resetSearchParams()
  }

  // 添加子菜单
  const handleAddChild = (row: MenuRowItem) => {
    showDialog('menu', false, row)
  }

  // 编辑菜单
  const handleEdit = (row: MenuRowItem) => {
    showDialog(row.menuType, true, row)
  }

  // 删除菜单
  const handleDelete = (row: MenuRowItem) => {
    ElMessageBox.confirm(`确定删除菜单"${row.menuName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delMenu(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }

  /**
   * 获取菜单类型标签颜色
   * @param row 菜单行数据
   * @returns 标签颜色类型
   */
  const getMenuTypeTag = (
    row: MenuRowItem
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (row.menuType === 'button') return 'danger'
    if (row.children?.length) {
      if (row.children.find((item) => item.menuType === 'menu')) {
        return 'info'
      }
    }
    if (row.externalLink && row.iframeFlag) return 'success'
    if (row.routePath) return 'primary'
    if (row.externalLink) return 'warning'
    return 'info'
  }

  /**
   * 获取菜单类型文本
   * @param row 菜单行数据
   * @returns 菜单类型文本
   */
  const getMenuTypeText = (row: MenuRowItem): string => {
    if (row.menuType === 'button') return '按钮'
    if (row.children?.length) {
      if (row.children.find((item) => item.menuType === 'menu')) {
        return '目录'
      }
    }
    if (row.externalLink && row.iframeFlag) return '内嵌'
    if (row.routePath) return '菜单'
    if (row.externalLink) return '外链'
    return '未知'
  }

  /**
   * 切换展开/收起所有菜单
   */
  const isExpanded = ref(false)
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && data.value) {
        const processRows = (rows: MenuRowItem[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(data.value)
      }
    })
  }
</script>
