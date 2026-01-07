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
          <ElButton type="primary" @click="generateCode" v-ripple> 生成代码 </ElButton>
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
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { MagicStick } from '@element-plus/icons-vue'
  import type { CodeGeneratorRow } from '@/api/develop/generator'
  import { getTables } from '@/api/develop/generator'

  defineOptions({ name: 'CodeGenerator' })

  // 搜索组件配置相关
  const initialSearchState = ref({
    tableName: ''
  })
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
  }

  // 表格数据
  const tableData = ref<CodeGeneratorRow[]>([])
  // 获取表格数据
  const getTableList = (params: any) => {
    return getTables(params).then((res: CodeGeneratorRow[]) => {
      tableData.value = res
    })
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
          { prop: 'id', label: 'ID', visible: false },
          { prop: 'tableName', label: '数据表名', minWidth: 200 },
          { prop: 'createTime', label: '创建时间', minWidth: 200 },
          { prop: 'tableDescription', label: '数据表描述' },
          {
            prop: 'operation',
            label: '操作',
            width: 200,
            align: 'right',
            formatter: (row: any) => {
              return h('div', { style: 'text-align: right' }, [
                h('el-button', {
                  type: 'primary',
                  text: '生成代码',
                  icon: MagicStick,
                  onClick: () => generateCode(row)
                })
              ])
            }
          }
        ]
      }
    })
  // 刷新表格数据
  const handleRefresh = (): void => {
    getTableList()
  }

  // 代码生成方法
  const generateCode = (rows: CodeGeneratorRow | CodeGeneratorRow[]): void => {
    const tableNames = (Array.isArray(rows) ? rows : [rows]).map(
      (row: CodeGeneratorRow) => row.tableName
    )
    console.log('待生成代码的表名列表：', tableNames)
  }
</script>

<style scoped>
  .app-container {
    padding: 20px;
  }
</style>
