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
        @refresh="handleRefresh"
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
        @sort-change="handleSortChange"
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
            <ElButton type="primary" link size="small" @click="handlePermission(row)"
              >权限</ElButton
            >
            <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 租户创建/编辑对话框 -->
    <AddDialog ref="addDialogRef" @success="getData" />

    <!-- 权限管理对话框 -->
    <ElDialog v-model="permDialogVisible" title="菜单权限配置" width="500px">
      <div class="mb-4">
        <ElCheckbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
          >全选/取消全选</ElCheckbox
        >
      </div>
      <ElTree
        ref="permTreeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        default-expand-all
        :props="{ label: 'label', children: 'children' }"
        @check-change="handleCheckChange"
      />
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="permDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handlePermSubmit">保存权限</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchTenantList, deleteTenant, fetchMenuTree } from '@/api/tenant'
  import AddDialog from './modules/add-dialog.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'

  defineOptions({ name: 'TenantManagement' })

  // 定义表格列
  const { columnChecks, columns } = useTableColumns(() => [
    { prop: 'id', label: '租户ID', visible: false },
    { prop: 'tenantName', label: '租户名称', minWidth: 150 },
    { prop: 'adminAccount', label: '管理员账号', width: 120 },
    { prop: 'expireDate', label: '有效截止日期', width: 120 },
    {
      prop: 'enableFlag',
      label: '是否启用',
      width: 100,
      formtter: (row: Api.Tenant.TenantListItem) =>
        h(ElTag, { type: row.enableFlag ? 'success' : 'danger' }, row.enableFlag ? '启用' : '禁用')
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
  ])

  // --- 搜索相关 ---
  const searchBarRef = ref()
  const searchFormState = ref({
    name: '',
    status: undefined,
    expireDate: undefined
  })

  const searchItems = computed(() => [
    {
      key: 'name',
      label: '租户名称',
      type: 'input',
      props: { placeholder: '请输入租户名称' }
    },
    {
      key: 'status',
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
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange,
    getData,
    searchParams,
    resetSearchParams
  } = useTable({
    core: {
      apiFn: fetchTenantList,
      apiParams: {
        current: 1,
        size: 10,
        ...searchFormState.value
      },
      immediate: true,
      columnsFactory: () => [
        { prop: 'id', label: '租户ID', width: 80 },
        { prop: 'name', label: '租户名称', minWidth: 150 },
        { prop: 'adminAccount', label: '管理员账号', width: 120 },
        { prop: 'expireDate', label: '有效截止日期', width: 120, sortable: true },
        { prop: 'status', label: '状态', width: 100, useSlot: true },
        { prop: 'createTime', label: '创建时间', width: 180 },
        { prop: 'operation', label: '操作', width: 200, fixed: 'right', useSlot: true }
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

  const handleSortChange = ({ prop, order }: any) => {
    searchParams.sort = prop
    searchParams.order = order
    getData()
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
    ElMessageBox.confirm(`确认删除租户 "${row.name}" 吗?`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await deleteTenant(row.id)
      ElMessage.success('删除成功')
      getData()
    })
  }

  // --- 权限管理相关 ---
  const permDialogVisible = ref(false)
  const menuTree = ref<any[]>([])
  const permTreeRef = ref()
  const checkAll = ref(false)
  const isIndeterminate = ref(false)

  const handlePermission = async (row: Api.Tenant.TenantListItem) => {
    console.log('Fetching permissions for tenant:', row.name)
    permDialogVisible.value = true
    if (menuTree.value.length === 0) {
      const res = await fetchMenuTree()
      menuTree.value = res.data
    }
    // 模拟选中一些权限
    // 实际开发中应调用接口获取该租户的权限
    setTimeout(() => {
      permTreeRef.value?.setCheckedKeys([11, 12, 31])
    }, 100)
  }

  const handleCheckAllChange = (val: boolean) => {
    if (val) {
      permTreeRef.value?.setCheckedNodes(menuTree.value)
    } else {
      permTreeRef.value?.setCheckedKeys([])
    }
    isIndeterminate.value = false
  }

  const handleCheckChange = () => {
    const checkedCount = permTreeRef.value?.getCheckedKeys().length
    const totalCount = getAllNodeCount(menuTree.value)
    checkAll.value = checkedCount === totalCount && totalCount > 0
    isIndeterminate.value = checkedCount > 0 && checkedCount < totalCount
  }

  const getAllNodeCount = (nodes: any[]): number => {
    let count = 0
    for (const node of nodes) {
      count++
      if (node.children) {
        count += getAllNodeCount(node.children)
      }
    }
    return count
  }

  const handlePermSubmit = () => {
    const checkedKeys = permTreeRef.value?.getCheckedKeys()
    console.log('Selected permissions:', checkedKeys)
    ElMessage.success('权限保存成功')
    permDialogVisible.value = false
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
