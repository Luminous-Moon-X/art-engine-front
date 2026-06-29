<!-- 接口日志页面 -->
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

    <!-- 接口日志详情弹窗 -->
    <ApiLogDetailDialog v-model="detailVisible" :log-data="currentLogData" />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetApiLogList, delApiLog } from '@/api/log'
  import { ElTag, ElMessageBox, ElButton } from 'element-plus'
  import { ApiLogRowItem } from '@/types/log'
  import ApiLogDetailDialog from './modules/api-log-detail-dialog.vue'

  defineOptions({ name: 'ApiLog' })

  // --- 搜索相关 ---
  interface SearchFormState {
    userName: string
    requestUrl: string
    responseCode: string
  }
  const searchFormState = ref<SearchFormState>({
    userName: '',
    requestUrl: '',
    responseCode: ''
  })

  const searchItems = computed(() => [
    {
      key: 'userName',
      label: '用户名',
      type: 'input',
      props: { placeholder: '请输入用户名' }
    },
    {
      key: 'requestUrl',
      label: '请求URL',
      type: 'input',
      props: { placeholder: '请输入请求URL' }
    },
    {
      key: 'responseCode',
      label: '响应码',
      type: 'input',
      props: { placeholder: '请输入响应码' }
    }
  ])

  // 选中行
  const selectedIds = ref<number[]>([])

  // 详情弹窗
  const detailVisible = ref(false)
  const currentLogData = ref<ApiLogRowItem | undefined>(undefined)

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
      apiFn: fetchGetApiLogList,
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
          width: 130
        },
        {
          prop: 'nickName',
          label: '用户昵称',
          width: 130
        },
        {
          prop: 'description',
          label: '操作描述',
          width: 170
        },
        {
          prop: 'requestUrl',
          label: '请求URL',
          minWidth: 200
        },
        {
          prop: 'responseCode',
          label: '响应码',
          width: 90,
          formatter: (row: ApiLogRowItem) => {
            const codeConfig =
              row.responseCode === 200
                ? { type: 'success', text: String(row.responseCode) }
                : { type: 'danger', text: String(row.responseCode) }
            return h(
              ElTag,
              { type: codeConfig.type as 'success' | 'danger' },
              () => codeConfig.text
            )
          }
        },
        {
          prop: 'costTime',
          label: '耗时(ms)',
          width: 100,
          formatter: (row: ApiLogRowItem) => {
            const costTime = row.costTime
            if (costTime < 500) {
              return h('span', { style: 'color: #67c23a' }, `${costTime}ms`)
            } else if (costTime < 1000) {
              return h('span', { style: 'color: #e6a23c' }, `${costTime}ms`)
            } else {
              return h('span', { style: 'color: #f56c6c' }, `${costTime}ms`)
            }
          }
        },
        {
          prop: 'requestTime',
          label: '请求时间',
          width: 180
        },
        {
          prop: 'operation',
          label: '操作',
          width: 140,
          fixed: 'right',
          align: 'center',
          formatter: (row) =>
            h('div', { style: 'display: flex; gap: 8px; justify-content: flex-end' }, [
              h(
                ElButton,
                {
                  type: 'primary',
                  link: true,
                  onClick: () => handleDetail(row)
                },
                () => '详情'
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

  // 查看详情
  const handleDetail = (row: ApiLogRowItem) => {
    currentLogData.value = row
    detailVisible.value = true
  }

  // 删除接口日志
  const handleDelete = (row: ApiLogRowItem) => {
    ElMessageBox.confirm('确定删除该接口日志吗？此操作不可恢复！', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delApiLog(row.id as number).then((res) => {
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
        Promise.all(selectedIds.value.map((id) => delApiLog(id))).then(() => {
          ElMessage.success('删除成功')
          selectedIds.value = []
          refreshData()
        })
      })
      .catch(() => {})
  }
</script>
