<template>
  <div class="flex flex-col gap-4 pb-5">
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

    <!-- 表格区域 -->
    <ElCard class="flex-1 art-table-card" shadow="never" style="margin-top: 0">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton type="primary" :icon="Plus" @click="handleAdd" v-ripple> 添加租户 </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :pagination="pagination"
        :data="data"
        :columns="columns"
        empty-height="360px"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- 状态列 -->
        <template #status="{ row }">
          <ElTag :type="row.status ? 'success' : 'danger'" effect="light">
            {{ row.status ? '启用' : '禁用' }}
          </ElTag>
        </template>

        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="flex gap-2">
            <ElButton type="primary" link size="small" @click="handleEdit(row)">编辑</ElButton>
            <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 租户创建/编辑对话框 -->
    <AddDialog ref="addDialogRef" @success="getData" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchTenantList, deleteTenant } from '@/api/tenant'
  import AddDialog from './modules/add-dialog.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'TenantManagement' })

  // --- 搜索相关 ---
  const searchFormState = ref({
    tenantName: '',
    enableFlag: undefined
  })

  const searchItems = computed(() => [
    {
      key: 'tenantName',
      label: '租户名称',
      type: 'input',
      props: { placeholder: '请输入租户名称' }
    },
    {
      key: 'enableFlag',
      label: '状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: true },
        { label: '禁用', value: false }
      ]
    }
  ])

  // --- 表格相关 ---
  const {
    data,
    columns,
    columnChecks,
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange,
    getData,
    searchParams,
    resetSearchParams,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchTenantList,
      apiParams: {
        pageNumber: 1,
        pageSize: 10,
        ...searchFormState.value
      },
      immediate: true,
      columnsFactory: () => [
        { prop: 'id', label: '租户ID', visible: false },
        { prop: 'tenantName', label: '租户名称', minWidth: 150 },
        { prop: 'expireDate', label: '有效截止日期', width: 180 },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 140,
          formatter: (row: Api.Tenant.TenantListItem) =>
            h(
              ElTag,
              { type: row.enableFlag ? 'success' : 'danger' },
              row.enableFlag ? '启用' : '禁用'
            )
        },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          align: 'right',
          formatter: (row: Api.Tenant.TenantListItem) => {
            return h('div', { style: 'text-align: right' }, [
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

  const handleSearch = () => {
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }

  // --- 表单相关 ---
  const addDialogRef = ref()

  const handleAdd = () => {
    addDialogRef.value?.open('add')
  }

  const handleEdit = (row: Api.Tenant.TenantListItem) => {
    addDialogRef.value?.open('edit', row)
  }

  const handleDelete = (row: Api.Tenant.TenantListItem) => {
    ElMessageBox.confirm(`确认删除租户 "${row.tenantName}" 吗?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await deleteTenant(row.id)
      ElMessage.success('删除成功')
      getData()
    })
  }

  onMounted(() => {
    // Initial load handled by useTable immediate: true
  })
</script>

<style scoped>
  .art-table-card {
    /* Ensure table takes available space */
  }
</style>
