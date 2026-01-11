<template>
  <div class="flex flex-col gap-4 pb-5">
    <ArtSearchBar
      ref="searchBarRef"
      v-model="formFilters"
      :items="searchItems"
      :show-reset-button="true"
      :show-search-button="true"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton type="primary" :icon="MagicStick" @click="generateCode(selectedRows)" v-ripple>
            生成代码
          </ElButton>
        </template>
      </ArtTableHeader>
      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      />
    </ElCard>

    <CodeGenDialog
      v-model="dialogVisible"
      :tables="tableData"
      :defaultSelectedTables="selectedRows"
      @generate="handleGenerate"
    />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { MagicStick } from '@element-plus/icons-vue'
  import type { CodeGeneratorRow } from '@/api/develop/generator'
  import { getTables } from '@/api/develop/generator'
  import { ElButton } from 'element-plus'
  import CodeGenDialog from './modules/code-gen-dialog.vue'
  import type { GenerateCodeFormData } from './modules/code-gen-dialog.vue'

  defineOptions({ name: 'CodeGenerator' })

  const dialogVisible = ref(false)
  const selectedRows = ref<CodeGeneratorRow[]>([])

  const handleGenerate = (data: GenerateCodeFormData, tables: CodeGeneratorRow[]) => {
    console.log('生成代码参数：', data)
    console.log('选中的表：', tables)
  }

  const initialSearchState = {
    tableName: ''
  }
  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })
  const searchItems = computed(() => [
    {
      key: 'tableName',
      label: '数据表名',
      type: 'input',
      props: { placeholder: '请输入数据表名' }
    }
  ])
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
  }
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
    // 执行查询
    getTableList({
      current: pagination.current,
      size: pagination.size,
      ...appliedFilters
    })
  }

  // 表格数据
  const tableData = ref<CodeGeneratorRow[]>([])
  // 获取表格数据
  const getTableList = (params: any) => {
    return getTables(params).then((res: CodeGeneratorRow[]) => {
      tableData.value = res
    })
  }
  // 处理选择变化
  const handleSelectionChange = (selection: CodeGeneratorRow[]) => {
    selectedRows.value = selection
  }
  // 表格配置
  const { loading, columns, pagination, columnChecks, handleSizeChange, handleCurrentChange } =
    useTable({
      core: {
        apiFn: getTableList,
        apiParams: {
          current: 1,
          size: 20,
          ...appliedFilters
        },
        columnsFactory: () => [
          { type: 'selection', width: 60 },
          { prop: 'id', label: 'ID', visible: false },
          { prop: 'tableName', label: '数据表名', Width: 200 },
          { prop: 'tableDescription', label: '数据表描述' },
          { prop: 'createTime', label: '创建时间', Width: 200 },
          {
            prop: 'operation',
            label: '操作',
            width: 200,
            align: 'right',
            formatter: (row: any) => {
              return h('div', { style: 'text-align: right' }, [
                h(
                  ElButton,
                  {
                    type: 'primary',
                    icon: MagicStick,
                    onClick: () => generateCode(row),
                    text: true
                  },
                  '生成代码'
                )
              ])
            }
          }
        ]
      }
    })
  // 刷新表格数据
  const handleRefresh = (): void => {
    getTableList({
      current: pagination.current,
      size: pagination.size,
      ...appliedFilters
    })
  }

  // 代码生成方法
  const generateCode = (rows: CodeGeneratorRow | CodeGeneratorRow[]): void => {
    selectedRows.value = Array.isArray(rows) ? rows : [rows]
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请至少选择一条条数据表！')
      return
    }
    dialogVisible.value = true
  }
</script>

<style scoped>
  .app-container {
    padding: 20px;
  }
</style>
