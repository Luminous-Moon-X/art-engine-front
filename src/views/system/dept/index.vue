<!-- 部门管理页面 -->
<template>
  <div class="art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchFormState"
      :items="searchItems"
      :show-reset-button="true"
      :show-search-button="true"
      v-show="showSearchBar"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd()" v-ripple v-auth="'system:dept:add'"
              >新增部门</ElButton
            >
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :stripe="false"
        rowKey="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="true"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 部门编辑弹窗 -->
    <DeptEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :dept-data="currentDeptData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetDeptList, delDept } from '@/api/dept'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import DeptEditDialog from './modules/dept-edit-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { DeptRowItem } from '@/types/dept'

  defineOptions({ name: 'Dept' })

  // --- 搜索相关 ---
  const showSearchBar = ref(false)
  const searchFormState = ref({
    deptName: '',
    chargePerson: ''
  })

  const searchItems = computed(() => [
    {
      key: 'deptName',
      label: '部门名称',
      type: 'input',
      props: { placeholder: '请输入部门名称' }
    },
    {
      key: 'chargePerson',
      label: '负责人',
      type: 'input',
      props: { placeholder: '请输入负责人' }
    }
  ])

  const dialogVisible = ref(false)
  const currentDeptData = ref<DeptRowItem | undefined>(undefined)

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
      apiFn: fetchGetDeptList,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: '部门ID',
          visible: false
        },
        {
          prop: 'deptName',
          label: '部门名称',
          minWidth: 250
        },
        {
          prop: 'orderNum',
          label: '排序号',
          width: 200
        },
        {
          prop: 'chargePerson',
          label: '负责人',
          width: 250
        },
        {
          prop: 'chargePersonTel',
          label: '负责人电话',
          width: 250
        },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 150,
          formatter: (row: DeptRowItem) => {
            const statusConfig = row.enableFlag
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
          prop: 'operation',
          label: '操作',
          width: 170,
          fixed: 'right',
          align: 'center',
          formatter: (row: DeptRowItem) =>
            h('div', { style: 'text-align: right' }, [
              h(ArtButtonTable, {
                type: 'add',
                onClick: () => handleAdd(row),
                auth: 'system:dept:add'
              }),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEdit(row),
                auth: 'system:dept:edit'
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row),
                auth: 'system:dept:delete'
              })
            ])
        }
      ]
    }
  })

  // 弹窗类型 新增or修改
  const dialogType = ref<'add' | 'edit'>('add')

  // 打开新增/修改弹窗
  const showDialog = (type: 'add' | 'edit', row?: DeptRowItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentDeptData.value = row
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

  // 新增部门
  const handleAdd = (row?: DeptRowItem) => {
    showDialog('add', row)
  }

  // 编辑部门
  const handleEdit = (row: DeptRowItem) => {
    showDialog('edit', row)
  }

  // 删除部门
  const handleDelete = (row: DeptRowItem) => {
    ElMessageBox.confirm(`确定删除部门"${row.deptName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delDept(row.id as number).then((res) => {
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
</script>
