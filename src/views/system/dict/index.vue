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
            <ElButton type="primary" @click="showDialog('add')" v-ripple>新增字典</ElButton>
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
      <DictEditDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :dict-data="currentDictData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetDictList, delDict } from '@/api/dict'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElTag, ElMessageBox, ElButton } from 'element-plus'
  import { DictRowItem } from '@/types/dict'
  import DictEditDialog from './modules/dict-edit-dialog.vue'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'Dict' })

  const router = useRouter()

  // --- 搜索相关 ---
  const searchFormState = ref({
    dictName: '',
    dictCode: ''
  })

  const searchItems = computed(() => [
    {
      key: 'dictName',
      label: '字典名称',
      type: 'input',
      props: { placeholder: '请输入字典名称' }
    },
    {
      key: 'dictCode',
      label: '字典编码',
      type: 'input',
      props: { placeholder: '请输入字典编码' }
    }
  ])

  const dialogVisible = ref(false)
  const currentDictData = ref<DictRowItem | undefined>(undefined)

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
      apiFn: fetchGetDictList,
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
          prop: 'dictCode',
          label: '字典编码',
          width: 250
        },
        {
          prop: 'dictName',
          label: '字典名称',
          width: 250,
          formatter: (row: DictRowItem) => {
            return h(
              ElButton,
              { type: 'primary', link: true, onClick: () => handleDictValue(row) },
              () => row.dictName
            )
          }
        },
        {
          prop: 'dictType',
          label: '字典类型',
          width: 150,
          formatter: (row: DictRowItem) => {
            const typeConfig =
              row.dictType === 'system'
                ? { type: 'primary', text: '系统字典' }
                : { type: 'info', text: '普通字典' }
            return h(ElTag, { type: typeConfig.type as 'primary' | 'info' }, () => typeConfig.text)
          }
        },
        {
          prop: 'enableFlag',
          label: '是否启用',
          width: 140,
          formatter: (row: DictRowItem) => {
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
          label: '创建时间',
          width: 250
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 250
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
  const showDialog = (type: 'add' | 'edit', row?: DictRowItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentDictData.value = row
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

  // 编辑字典
  const handleEdit = (row: DictRowItem) => {
    showDialog('edit', row)
  }

  // 删除字典
  const handleDelete = (row: DictRowItem) => {
    ElMessageBox.confirm(`确定删除字典"${row.dictName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        delDict(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }

  /**
   * 编辑字典值
   */
  const handleDictValue = (row: DictRowItem) => {
    router.push({
      path: '/system/dictValue',
      query: {
        dictId: row.id
      }
    })
  }
</script>
