<template>
  <div class="art-full-height">
    <ArtSearchBar
      v-model="searchFormState"
      :items="searchItems"
      :show-reset="true"
      :show-search="true"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="showDialog('add')" v-ripple>新增配置</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <OssEditDialog
        v-model="dialogVisible"
        :dialog-type="dialogType"
        :oss-data="currentOssData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchOssConfigPage, deleteOssConfig, enableOssConfig } from '@/api/oss'
  import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { OssConfigRowItem } from '@/types/oss'
  import type { VNode } from 'vue'
  import OssEditDialog from './modules/oss-edit-dialog.vue'

  defineOptions({ name: 'OssManagement' })

  const searchFormState = ref<{ configName: string; bucketName: string; enableFlag: number | '' }>({
    configName: '',
    bucketName: '',
    enableFlag: ''
  })

  const searchItems = computed(() => [
    {
      key: 'configName',
      label: '配置名称',
      type: 'input',
      props: { placeholder: '请输入配置名称' }
    },
    {
      key: 'bucketName',
      label: '桶（Bucket）',
      type: 'input',
      props: { placeholder: '请输入Bucket名称' }
    },
    {
      key: 'enableFlag',
      label: '启用状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ])

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentOssData = ref<OssConfigRowItem | undefined>(undefined)

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
      apiFn: fetchOssConfigPage,
      apiParams: {
        pageNumber: 1,
        pageSize: 10
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: '配置ID',
          visible: false
        },
        {
          prop: 'configName',
          label: '配置名称',
          minWidth: 160
        },
        {
          prop: 'endpoint',
          label: '服务地址',
          minWidth: 160
        },
        {
          prop: 'bucketName',
          label: '桶（Bucket）',
          minWidth: 160
        },
        {
          prop: 'accessKey',
          label: 'Access Key',
          minWidth: 160
        },
        {
          prop: 'enableFlag',
          label: '启用状态',
          minWidth: 160,
          formatter: (row: OssConfigRowItem) =>
            h(ElTag, { type: row.enableFlag === 1 ? 'success' : 'danger' }, () =>
              row.enableFlag === 1 ? '启用' : '禁用'
            )
        },
        {
          prop: 'createTime',
          label: '创建时间',
          minWidth: 160
        },
        {
          prop: 'remark',
          label: '备注',
          minWidth: 160
        },
        {
          prop: 'operation',
          label: '操作',
          width: 230,
          fixed: 'right',
          align: 'center',
          formatter: (row: OssConfigRowItem) => {
            const buttons: VNode[] = []
            if (row.enableFlag !== 1) {
              buttons.push(
                h(
                  ElButton,
                  { type: 'success', link: true, size: 'small', onClick: () => handleEnable(row) },
                  () => '启用'
                )
              )
            }
            buttons.push(
              h(
                ElButton,
                { type: 'primary', link: true, size: 'small', onClick: () => handleEdit(row) },
                () => '编辑'
              ),
              h(
                ElButton,
                { type: 'danger', link: true, size: 'small', onClick: () => handleDelete(row) },
                () => '删除'
              )
            )
            return h('div', { class: 'flex justify-center gap-1' }, buttons)
          }
        }
      ]
    }
  })

  const showDialog = (type: 'add' | 'edit', row?: OssConfigRowItem) => {
    dialogType.value = type
    currentOssData.value = row
    dialogVisible.value = true
  }

  const handleSearch = () => {
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }

  const handleEdit = (row: OssConfigRowItem) => {
    showDialog('edit', row)
  }

  const handleEnable = (row: OssConfigRowItem) => {
    ElMessageBox.confirm(
      `确定启用配置"${row.configName}"吗？其他启用配置将自动禁用。`,
      '启用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        enableOssConfig(row.id as number).then((res) => {
          if (res) {
            ElMessage.success('启用成功')
            refreshData()
          }
        })
      })
      .catch(() => {
        ElMessage.info('已取消启用')
      })
  }

  const handleDelete = (row: OssConfigRowItem) => {
    ElMessageBox.confirm(`确定删除配置"${row.configName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        deleteOssConfig([row.id as number]).then((res) => {
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
