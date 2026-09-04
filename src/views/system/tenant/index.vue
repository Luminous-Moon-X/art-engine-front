<!-- 租户管理页面 -->
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增租户</ElButton>
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

    <!-- 租户编辑弹窗 -->
    <TenantEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :tenant-data="currentTenantData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchTenantPage, deleteTenant } from '@/api/tenant'
  import { ElTag, ElMessageBox, ElButton } from 'element-plus'
  import TenantEditDialog from './modules/tenant-edit-dialog.vue'

  type TenantListItem = Api.Tenant.TenantListItem

  defineOptions({ name: 'Tenant' })

  // --- 搜索相关 ---
  const searchFormState = ref({
    tenantName: '',
    tenantCode: ''
  })

  const searchItems = computed(() => [
    {
      key: 'tenantName',
      label: '租户名称',
      type: 'input',
      props: { placeholder: '请输入租户名称' }
    },
    {
      key: 'tenantCode',
      label: '租户编码',
      type: 'input',
      props: { placeholder: '请输入租户编码' }
    }
  ])

  const dialogVisible = ref(false)
  const currentTenantData = ref<TenantListItem | undefined>(undefined)

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
      apiFn: fetchTenantPage,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: '租户ID',
          visible: false
        },
        {
          prop: 'tenantName',
          label: '租户名称',
          minWidth: 160
        },
        {
          prop: 'tenantCode',
          label: '租户编码',
          width: 140
        },
        {
          prop: 'packageName',
          label: '租户套餐',
          minWidth: 140
        },
        {
          prop: 'adminUsername',
          label: '管理员账号',
          width: 140
        },
        {
          prop: 'expireDate',
          label: '到期时间',
          width: 120,
          formatter: (row: TenantListItem) => row.expireDate || '-'
        },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 110,
          formatter: (row: TenantListItem) => {
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
          formatter: (row: TenantListItem) =>
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
  const showDialog = (type: 'add' | 'edit', row?: TenantListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentTenantData.value = row
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

  // 编辑租户
  const handleEdit = (row: TenantListItem) => {
    showDialog('edit', row)
  }

  // 删除租户
  const handleDelete = (row: TenantListItem) => {
    ElMessageBox.confirm(`确定删除租户"${row.tenantName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        deleteTenant(row.id).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }
</script>
