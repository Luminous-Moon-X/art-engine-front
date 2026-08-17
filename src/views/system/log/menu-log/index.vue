<!-- 菜单日志页面 -->
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
            <ElButton
              type="danger"
              :disabled="!selectedIds.length"
              @click="handleBatchDelete"
              v-ripple
            >
              批量删除
            </ElButton>
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
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetMenuLogList, delMenuLog } from '@/api/log'
  import { ElMessageBox } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { MenuLogRowItem } from '@/types/log'

  defineOptions({ name: 'MenuLog' })

  // --- 搜索相关 ---
  interface SearchFormState {
    userName: string
    nickName: string
    menuName: string
  }
  const searchFormState = ref<SearchFormState>({
    userName: '',
    nickName: '',
    menuName: ''
  })

  const searchItems = computed(() => [
    {
      key: 'userName',
      label: '用户名',
      type: 'input',
      props: { placeholder: '请输入用户名' }
    },
    {
      key: 'nickName',
      label: '用户昵称',
      type: 'input',
      props: { placeholder: '请输入用户昵称' }
    },
    {
      key: 'menuName',
      label: '菜单名称',
      type: 'input',
      props: { placeholder: '请输入菜单名称' }
    }
  ])

  // 选中行
  const selectedIds = ref<number[]>([])

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
      apiFn: fetchGetMenuLogList,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: 'ID',
          visible: false
        },
        {
          prop: 'userName',
          label: '用户名',
          width: 140
        },
        {
          prop: 'nickName',
          label: '用户昵称',
          width: 140
        },
        {
          prop: 'menuName',
          label: '菜单名称',
          minWidth: 200
        },
        {
          prop: 'menuPath',
          label: '菜单路径',
          minWidth: 250
        },
        {
          prop: 'clickTime',
          label: '点击时间',
          width: 180
        },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          formatter: (row) =>
            h('div', { style: 'text-align: right' }, [
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })

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

  // 删除菜单日志
  const handleDelete = (row: MenuLogRowItem) => {
    ElMessageBox.confirm('确定删除该菜单日志吗？此操作不可恢复！', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delMenuLog(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }

  // 批量删除
  const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条日志吗？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        Promise.all(selectedIds.value.map((id) => delMenuLog(id))).then(() => {
          ElMessage.success('删除成功')
          selectedIds.value = []
          refreshData()
        })
      })
      .catch(() => {})
  }
</script>
