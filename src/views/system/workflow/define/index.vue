<!-- 流程定义管理页面 -->
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增流程定义</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 流程定义编辑弹窗 -->
    <WorkflowDefinitionEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :definition-data="currentDefinitionData"
      :category-options="categoryOptions"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchWorkflowDefinitionList,
    deleteWorkflowDefinition,
    getWorkflowDefinitionOptions,
    publishWorkflowDefinition,
    unPublishWorkflowDefinition,
    copyWorkflowDefinition,
    activeWorkflowDefinition,
    unActiveWorkflowDefinition
  } from '@/api/workflow'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtButtonMore, {
    type ButtonMoreItem
  } from '@/components/core/forms/art-button-more/index.vue'
  import WorkflowDefinitionEditDialog from './modules/workflow-definition-edit-dialog.vue'
  import { ElTag, ElMessageBox, ElText, ElMessage } from 'element-plus'
  import { WorkflowDefinitionRowItem } from '@/types/workflow'

  defineOptions({ name: 'WorkflowDefinition' })

  /** 是否发布：0未发布 1已发布 9已失效 */
  const PUBLISH_STATUS = {
    UNPUBLISHED: 0,
    PUBLISHED: 1,
    EXPIRED: 9
  } as const

  /** 流程激活状态：0挂起 1激活 */
  const ACTIVITY_STATUS = {
    SUSPENDED: 0,
    ACTIVITY: 1
  } as const

  /** 是否发布下拉选项 */
  const publishStatusOptions = [
    { label: '未发布', value: PUBLISH_STATUS.UNPUBLISHED },
    { label: '已发布', value: PUBLISH_STATUS.PUBLISHED },
    { label: '已失效', value: PUBLISH_STATUS.EXPIRED }
  ]

  /** 激活状态下拉选项 */
  const activityStatusOptions = [
    { label: '激活', value: ACTIVITY_STATUS.ACTIVITY },
    { label: '挂起', value: ACTIVITY_STATUS.SUSPENDED }
  ]

  // --- 搜索相关 ---
  const searchFormState = ref({
    flowName: '',
    flowCode: '',
    category: undefined as string | undefined,
    isPublish: undefined as number | undefined,
    activityStatus: undefined as number | undefined
  })

  /** 流程类别选项（来源：后端已有流程定义的类别集合） */
  const categoryOptions = ref<string[]>([])

  const searchItems = computed(() => [
    {
      key: 'flowName',
      label: '流程名称',
      type: 'input',
      props: { placeholder: '请输入流程名称', clearable: true }
    },
    {
      key: 'flowCode',
      label: '流程编码',
      type: 'input',
      props: { placeholder: '请输入流程编码', clearable: true }
    },
    {
      key: 'category',
      label: '流程类别',
      type: 'select',
      props: {
        placeholder: '请选择流程类别',
        clearable: true,
        options: categoryOptions.value.map((item) => ({ label: item, value: item }))
      }
    },
    {
      key: 'isPublish',
      label: '发布状态',
      type: 'select',
      props: { placeholder: '请选择发布状态', clearable: true, options: publishStatusOptions }
    },
    {
      key: 'activityStatus',
      label: '激活状态',
      type: 'select',
      props: { placeholder: '请选择激活状态', clearable: true, options: activityStatusOptions }
    }
  ])

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentDefinitionData = ref<WorkflowDefinitionRowItem | undefined>(undefined)

  /** 加载流程类别下拉选项 */
  const loadOptions = () => {
    getWorkflowDefinitionOptions()
      .then((res) => {
        categoryOptions.value = res?.categoryList || []
      })
      .catch(() => {
        categoryOptions.value = []
      })
  }

  onMounted(() => {
    loadOptions()
  })

  /**
   * 根据流程定义状态构建「更多」操作项
   */
  const buildMoreActions = (row: WorkflowDefinitionRowItem): ButtonMoreItem[] => {
    // 仅「已发布」状态可取消发布，其余状态（未发布、已失效）均可发布
    const isPublished = row.isPublish === PUBLISH_STATUS.PUBLISHED

    const actions: ButtonMoreItem[] = [
      isPublished
        ? { key: 'unPublish', label: '取消发布', icon: 'ri:arrow-go-back-line' }
        : { key: 'publish', label: '发布', icon: 'ri:send-plane-line' },
      { key: 'copy', label: '复制', icon: 'ri:file-copy-line' }
    ]

    if (row.activityStatus === ACTIVITY_STATUS.ACTIVITY) {
      actions.push({ key: 'unActive', label: '挂起', icon: 'ri:pause-circle-line' })
    } else {
      actions.push({ key: 'active', label: '激活', icon: 'ri:play-circle-line' })
    }
    return actions
  }

  /**
   * 执行「更多」中的操作
   */
  const handleMoreAction = async (row: WorkflowDefinitionRowItem, key: string | number) => {
    const id = row.id as number
    const flowName = row.flowName
    switch (key) {
      case 'publish':
        await ElMessageBox.confirm(
          `确定发布流程"${flowName}"吗？发布后该编码下的历史版本将自动失效。`,
          '发布确认',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        ).then(async () => {
          if (await publishWorkflowDefinition(id)) {
            ElMessage.success('发布成功')
            refreshData()
            loadOptions()
          }
        })
        break
      case 'unPublish':
        await ElMessageBox.confirm(`确定取消发布流程"${flowName}"吗？`, '取消发布确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          if (await unPublishWorkflowDefinition(id)) {
            ElMessage.success('取消发布成功')
            refreshData()
          }
        })
        break
      case 'copy':
        await ElMessageBox.confirm(
          `确定复制流程"${flowName}"吗？将生成一个新版本（未发布）。`,
          '复制确认',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        ).then(async () => {
          if (await copyWorkflowDefinition(id)) {
            ElMessage.success('复制成功')
            refreshData()
            loadOptions()
          }
        })
        break
      case 'active':
        if (await activeWorkflowDefinition(id)) {
          ElMessage.success('激活成功')
          refreshData()
        }
        break
      case 'unActive':
        await ElMessageBox.confirm(
          `确定挂起流程"${flowName}"吗？挂起后相关流程实例将无法继续流转。`,
          '挂起确认',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
        ).then(async () => {
          if (await unActiveWorkflowDefinition(id)) {
            ElMessage.success('挂起成功')
            refreshData()
          }
        })
        break
      default:
        break
    }
  }

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
      apiFn: fetchWorkflowDefinitionList,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: '流程定义ID',
          visible: false
        },
        {
          prop: 'flowName',
          label: '流程名称',
          minWidth: 160,
          formatter: (row: WorkflowDefinitionRowItem) => h(ElText, {}, row.flowName || '-')
        },
        {
          prop: 'flowCode',
          label: '流程编码',
          minWidth: 160,
          formatter: (row: WorkflowDefinitionRowItem) => h(ElText, {}, row.flowCode || '-')
        },
        {
          prop: 'version',
          label: '版本',
          width: 90,
          formatter: (row: WorkflowDefinitionRowItem) =>
            h(ElTag, { type: 'info', effect: 'plain' }, () => `v${row.version ?? '-'}`)
        },
        {
          prop: 'category',
          label: '流程类别',
          minWidth: 130,
          formatter: (row: WorkflowDefinitionRowItem) => h(ElText, {}, row.category || '-')
        },
        {
          prop: 'modelValue',
          label: '设计器模型',
          width: 120,
          formatter: (row: WorkflowDefinitionRowItem) => {
            const modelText = row.modelValue === 'MIMIC' ? '仿钉钉' : '经典'
            return h(ElTag, { type: 'info', effect: 'plain' }, () => modelText)
          }
        },
        {
          prop: 'isPublish',
          label: '发布状态',
          width: 110,
          formatter: (row: WorkflowDefinitionRowItem) => {
            const statusConfig =
              row.isPublish === PUBLISH_STATUS.PUBLISHED
                ? { type: 'success', text: '已发布' }
                : row.isPublish === PUBLISH_STATUS.EXPIRED
                  ? { type: 'info', text: '已失效' }
                  : { type: 'warning', text: '未发布' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' | 'info' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'activityStatus',
          label: '激活状态',
          width: 110,
          formatter: (row: WorkflowDefinitionRowItem) => {
            const isActivity = row.activityStatus === ACTIVITY_STATUS.ACTIVITY
            return h(ElTag, { type: isActivity ? 'success' : 'danger', effect: 'plain' }, () =>
              isActivity ? '激活' : '挂起'
            )
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: 170,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right',
          align: 'center',
          formatter: (row: WorkflowDefinitionRowItem) =>
            h('div', { style: 'text-align: center' }, [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEdit(row)
              }),
              h(ArtButtonMore, {
                list: buildMoreActions(row),
                onClick: (item: ButtonMoreItem) => handleMoreAction(row, item.key)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })

  // 打开新增/修改弹窗
  const showDialog = (type: 'add' | 'edit', row?: WorkflowDefinitionRowItem) => {
    dialogType.value = type
    currentDefinitionData.value = row
    dialogVisible.value = true
  }

  /** 搜索处理 */
  const handleSearch = () => {
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  /** 重置查询条件 */
  const handleReset = () => {
    searchFormState.value = {
      flowName: '',
      flowCode: '',
      category: undefined,
      isPublish: undefined,
      activityStatus: undefined
    }
    resetSearchParams()
  }

  /** 编辑流程定义 */
  const handleEdit = (row: WorkflowDefinitionRowItem) => {
    showDialog('edit', row)
  }

  /** 删除流程定义 */
  const handleDelete = (row: WorkflowDefinitionRowItem) => {
    ElMessageBox.confirm(
      `确定删除流程"${row.flowName}"吗？将同时删除该流程的节点与跳转数据，此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        deleteWorkflowDefinition(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }
</script>
