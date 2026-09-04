<!-- 租户套餐管理页面 -->
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增套餐</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        rowKey="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 套餐编辑弹窗 -->
    <TenantPackageDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :package-data="currentPackageData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchTenantPackagePage, deleteTenantPackage } from '@/api/tenant-package'
  import { ElTag, ElMessageBox, ElButton } from 'element-plus'
  import TenantPackageDialog from './modules/tenant-package-dialog.vue'

  type TenantPackageListItem = Api.Tenant.TenantPackageListItem

  defineOptions({ name: 'TenantPackage' })

  // --- 搜索相关 ---
  const searchFormState = ref({
    packageName: ''
  })

  const searchItems = computed(() => [
    {
      key: 'packageName',
      label: '套餐名称',
      type: 'input',
      props: { placeholder: '请输入套餐名称' }
    }
  ])

  const dialogVisible = ref(false)
  const currentPackageData = ref<TenantPackageListItem | undefined>(undefined)

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
    core: {
      apiFn: fetchTenantPackagePage,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: '套餐ID',
          visible: false
        },
        {
          prop: 'packageName',
          label: '套餐名称',
          minWidth: 200
        },
        {
          prop: 'menuCount',
          label: '菜单数量',
          width: 110,
          formatter: (row: TenantPackageListItem) => (row.menuCount ?? 0) + ' 项'
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 160,
          showOverflowTooltip: true,
          formatter: (row: TenantPackageListItem) => row.remark || '-'
        },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 110,
          formatter: (row: TenantPackageListItem) => {
            const statusConfig =
              row.enableFlag === 1
                ? { type: 'success', text: '启用' }
                : { type: 'warning', text: '禁用' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 175
        },
        {
          prop: 'operation',
          label: '操作',
          width: 130,
          fixed: 'right',
          align: 'center',
          formatter: (row: TenantPackageListItem) =>
            h('div', { style: 'display: flex; gap: 8px; justify-content: flex-end;' }, [
              h(
                ElButton,
                {
                  type: 'primary',
                  link: true,
                  onClick: () => handleEdit(row)
                },
                () => '编辑'
              ),
              h(
                ElButton,
                {
                  type: 'danger',
                  link: true,
                  onClick: () => handleDelete(row)
                },
                () => '删除'
              )
            ])
        }
      ]
    }
  })

  // 弹窗类型 新增or修改
  const dialogType = ref<'add' | 'edit'>('add')

  // 打开新增/修改弹窗
  const showDialog = (type: 'add' | 'edit', row?: TenantPackageListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentPackageData.value = row
  }

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  // 重置查询条件
  const handleReset = () => {
    resetSearchParams()
  }

  // 编辑套餐
  const handleEdit = (row: TenantPackageListItem) => {
    showDialog('edit', row)
  }

  // 删除套餐
  const handleDelete = (row: TenantPackageListItem) => {
    ElMessageBox.confirm(`确定删除套餐"${row.packageName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        deleteTenantPackage(row.id).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }
</script>
