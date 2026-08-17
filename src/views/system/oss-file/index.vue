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
          <ElButton type="primary" @click="uploadFile" v-ripple>上传文件</ElButton>
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

      <UploadDialog v-model="dialogVisible" @success="refreshData" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchOssFilePage, deleteOssFile, downloadOssFile } from '@/api/oss'
  import { ElButton, ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Download } from '@element-plus/icons-vue'
  import { OssFileRowItem } from '@/types/oss'
  import type { VNode } from 'vue'
  import UploadDialog from './modules/upload-dialog.vue'

  defineOptions({ name: 'OssFileManagement' })

  const searchFormState = ref<{ configName: string; bucketName: string; enableFlag: number | '' }>({
    configName: '',
    bucketName: '',
    enableFlag: ''
  })

  const searchItems = computed(() => [
    {
      key: 'fileName',
      label: '文件名称',
      type: 'input',
      props: { placeholder: '请输入文件名称' }
    }
  ])

  const dialogVisible = ref(false)

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
      apiFn: fetchOssFilePage,
      apiParams: {
        pageNumber: 1,
        pageSize: 10
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: '文件ID',
          visible: false
        },
        {
          prop: 'ossConfigId',
          label: 'OSS配置ID',
          visible: false
        },
        {
          prop: 'objectKey',
          label: '对象存储Key',
          visible: false
        },
        {
          prop: 'fileName',
          label: '文件名称',
          minWidth: 200
        },
        {
          prop: 'contentType',
          label: '内容类型',
          minWidth: 160
        },
        {
          prop: 'fileSize',
          label: '文件大小（字节）',
          minWidth: 170
        },
        {
          prop: 'createTime',
          label: '上传时间',
          minWidth: 170
        },
        {
          prop: 'url',
          label: '文件URL',
          visible: false
        },
        {
          prop: 'operation',
          label: '操作',
          width: 230,
          fixed: 'right',
          align: 'center',
          formatter: (row: OssFileRowItem) => {
            const buttons: VNode[] = [
              h(
                ElButton,
                {
                  type: 'primary',
                  link: true,
                  size: 'small',
                  loading: downloadLoading.value.has(row.id),
                  icon: Download,
                  onClick: () => handleDownload(row)
                },
                () => '下载'
              ),
              h(
                ElButton,
                {
                  type: 'danger',
                  link: true,
                  size: 'small',
                  onClick: () => handleDelete(row),
                  icon: Delete
                },
                () => '删除'
              )
            ]
            return h('div', { class: 'flex justify-center gap-1' }, buttons)
          }
        }
      ]
    }
  })

  const downloadLoading = ref<Set<number>>(new Set())

  const uploadFile = () => {
    dialogVisible.value = true
  }

  const handleSearch = () => {
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }

  const handleDownload = async (row: OssFileRowItem) => {
    ElMessage.info('正在下载文件，请稍等...')
    downloadLoading.value.add(row.id)
    try {
      const data = await downloadOssFile(row.id)
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = row.fileName
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      downloadLoading.value.delete(row.id)
    }
  }

  const handleDelete = (row: OssFileRowItem) => {
    ElMessageBox.confirm(`确定删除文件"${row.fileName}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        deleteOssFile([row.id as number]).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshData()
          }
        })
      })
      .catch(() => {})
  }
</script>
