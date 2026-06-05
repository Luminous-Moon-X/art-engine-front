<!-- 登录日志页面 -->
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
            <ElButton type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete" v-ripple>
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
  import { fetchGetLoginLogList, delLoginLog } from '@/api/log'
  import { ElTag, ElMessageBox, ElButton } from 'element-plus'
  import { Delete } from '@element-plus/icons-vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { LoginLogRowItem } from '@/types/log'

  defineOptions({ name: 'LoginLog' })

  // --- 搜索相关 ---
  const showSearchBar = ref(false)
  interface SearchFormState {
    userName: string
    nickName: string
    loginIp: string
  }
  const searchFormState = ref<SearchFormState>({
    userName: '',
    nickName: '',
    loginIp: ''
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
      key: 'loginIp',
      label: '登录IP',
      type: 'input',
      props: { placeholder: '请输入登录IP' }
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
      apiFn: fetchGetLoginLogList,
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
          prop: 'loginIp',
          label: '登录IP',
          width: 160
        },
        {
          prop: 'browser',
          label: '浏览器',
          width: 120
        },
        {
          prop: 'os',
          label: '操作系统',
          width: 120
        },
        {
          prop: 'loginTime',
          label: '登录时间',
          width: 180
        },
        {
          prop: 'status',
          label: '登录状态',
          width: 100,
          formatter: (row: LoginLogRowItem) => {
            const statusConfig = row.status === 1
              ? { type: 'success', text: '成功' }
              : { type: 'danger', text: '失败' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'danger' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'message',
          label: '提示信息',
          minWidth: 200
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

  // 删除登录日志
  const handleDelete = (row: LoginLogRowItem) => {
    ElMessageBox.confirm('确定删除该登录日志吗？此操作不可恢复！', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delLoginLog(row.id as number).then((res) => {
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

  // 批量删除
  const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条日志吗？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // 逐个删除
        Promise.all(selectedIds.value.map((id) => delLoginLog(id))).then(() => {
          ElMessage.success('删除成功')
          selectedIds.value = []
          refreshData()
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
