<!-- 字典管理页面 -->
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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增字典项</ElButton>
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

      <!-- 字典编辑弹窗 -->
      <DictValueEditDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :dict-data="currentDictValueData"
        @success="refreshData"
        :dict-id="dictId"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetDictValueList, delDictValue } from '@/api/dict'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElTag, ElMessageBox, ElButton } from 'element-plus'
  import { DictValueRowItem } from '@/types/dict'
  import DictValueEditDialog from './modules/dict-value-edit-dialog.vue'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'DictValue' })

  const route = useRoute()
  // 字典ID
  const dictId = ref()

  onMounted(() => {
    dictId.value = route.query.dictId as unknown as number
    handleSearch()
  })

  // --- 搜索相关 ---
  const searchFormState = ref({
    dictLabel: '',
    dictValue: '',
    dictId: ''
  })

  const searchItems = computed(() => [
    {
      key: 'dictLabel',
      label: '字典项名称',
      type: 'input',
      labelWidth: 90,
      props: { placeholder: '请输入字典项名称' }
    },
    {
      key: 'dictValue',
      label: '字典项值',
      type: 'input',
      props: { placeholder: '请输入字典项值' }
    }
  ])

  const dialogVisible = ref(false)
  const currentDictValueData = ref<DictValueRowItem | undefined>(undefined)

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
      apiFn: fetchGetDictValueList,
      immediate: false,
      apiParams: {
        pageNumber: 1,
        pageSize: 10
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: () => [
        {
          prop: 'id',
          label: '字典ID',
          visible: false
        },
        {
          prop: 'dictLabel',
          label: '字典项名称',
          minWidth: 200
        },
        {
          prop: 'dictValue',
          label: '字典项值',
          width: 200
        },
        {
          prop: 'orderNum',
          label: '排序号',
          width: 100
        },
        {
          prop: 'showStyle',
          label: '显示样式',
          width: 150,
          formatter: (row: DictValueRowItem) => {
            return h(ElTag, { type: row.showStyle }, () => row.showStyle)
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          align: 'center',
          formatter: (row) =>
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
  const showDialog = (type: 'add' | 'edit', row?: DictValueRowItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentDictValueData.value = row
  }

  /**
   * 搜索处理
   */
  const handleSearch = () => {
    // 搜索参数赋值
    searchFormState.value.dictId = dictId.value
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  // 重置查询条件
  const handleReset = () => {
    resetSearchParams()
  }

  // 编辑字典
  const handleEdit = (row: DictValueRowItem) => {
    showDialog('edit', row)
  }

  // 删除字典
  const handleDelete = (row: DictValueRowItem) => {
    ElMessageBox.confirm(`确定删除字典项"${row.dictLabel}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delDictValue(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }
</script>
