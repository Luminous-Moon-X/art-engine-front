<!-- 规则管理页面 -->
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增规则</ElButton>
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

    <!-- 规则编辑弹窗 -->
    <RuleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :rule-data="currentRuleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchRuleList, deleteRule } from '@/api/rule'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import RuleEditDialog from './modules/rule-edit-dialog.vue'
  import { ElTag, ElMessageBox, ElText } from 'element-plus'
  import { RuleRowItem } from '@/types/rule'
  import { getDict } from '@/utils/dict'
  import type { DictItem } from '@/types/dict'

  defineOptions({ name: 'Rule' })

  // 字典数据
  const ruleValueTypeOptions = ref<DictItem[]>([])

  onMounted(() => {
    getDict('system_rule_value_type').then((res) => {
      ruleValueTypeOptions.value = res
    })
  })

  // --- 搜索相关 ---
  const searchFormState = ref({
    ruleName: '',
    ruleCode: ''
  })

  const searchItems = computed(() => [
    {
      key: 'ruleName',
      label: '规则名称',
      type: 'input',
      props: { placeholder: '请输入规则名称' }
    },
    {
      key: 'ruleCode',
      label: '规则编码',
      type: 'input',
      props: { placeholder: '请输入规则编码' }
    }
  ])

  const dialogVisible = ref(false)
  const currentRuleData = ref<RuleRowItem | undefined>(undefined)

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
      apiFn: fetchRuleList,
      apiParams: {
        pageNumber: 1,
        pageSize: 20
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: '规则ID',
          visible: false
        },
        {
          prop: 'ruleName',
          label: '规则名称',
          width: 180
        },
        {
          prop: 'ruleCode',
          label: '规则编码',
          width: 170
        },
        {
          prop: 'ruleValueType',
          label: '规则值类型',
          minWidth: 150,
          formatter: (row: RuleRowItem) => {
            const item = ruleValueTypeOptions.value.find(
              (item) => item.dictValue === String(row.ruleValueType)
            )
            const label = item ? item.dictLabel : row.ruleValueType
            return h(ElText, {}, label)
          }
        },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 140,
          formatter: (row: RuleRowItem) => {
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
          prop: 'createTime',
          label: '创建日期',
          width: 170,
          sortable: true
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 200
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: RuleRowItem) =>
            h('div', { style: 'text-align: right' }, [
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
      ]
    }
  })

  // 弹窗类型 新增or修改
  const dialogType = ref<'add' | 'edit'>('add')

  // 打开新增/修改弹窗
  const showDialog = (type: 'add' | 'edit', row?: RuleRowItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentRuleData.value = row
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

  // 编辑规则
  const handleEdit = (row: RuleRowItem) => {
    showDialog('edit', row)
  }

  // 删除规则
  const handleDelete = (row: RuleRowItem) => {
    ElMessageBox.confirm(`确定删除规则"${row.ruleName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        deleteRule(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }
</script>
