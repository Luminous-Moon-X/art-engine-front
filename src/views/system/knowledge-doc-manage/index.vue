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
          <ElUpload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :limit="1"
            accept=".pdf,.doc,.docx,.txt,.md,.xls,.xlsx,.ppt,.pptx,.wps"
            :on-change="handleUploadChange"
          >
            <template #trigger>
              <ElButton type="primary" :loading="uploading" v-ripple>上传文档</ElButton>
            </template>
          </ElUpload>
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
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import {
    uploadKnowledgeDoc,
    fetchKnowledgeDocPage,
    parseKnowledgeDoc,
    vectorKnowledgeDoc,
    deleteKnowledgeDoc
  } from '@/api/knowledge-doc'
  import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { Delete, Document, MagicStick } from '@element-plus/icons-vue'
  import type { KnowledgeDocRowItem, KnowledgeDocStatus } from '@/types/knowledge-doc'
  import type { UploadFile } from 'element-plus'
  import type { VNode } from 'vue'

  defineOptions({ name: 'KnowledgeDocManagement' })

  /** 解析/向量状态展示配置 */
  const STATUS_MAP: Record<
    KnowledgeDocStatus,
    { label: string; type: 'info' | 'warning' | 'success' | 'danger' }
  > = {
    pending: { label: '待处理', type: 'info' },
    processing: { label: '处理中', type: 'warning' },
    complete: { label: '已完成', type: 'success' },
    error: { label: '失败', type: 'danger' }
  }

  /** 查询表单 */
  const searchFormState = ref<{ docName: string }>({
    docName: ''
  })

  const searchItems = computed(() => [
    {
      key: 'docName',
      label: '文档名称',
      type: 'input',
      props: { placeholder: '请输入文档名称' }
    }
  ])

  /** 上传中状态 */
  const uploading = ref(false)

  /** 上传组件引用 */
  const uploadRef = ref()

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
    refreshData,
    refreshCreate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchKnowledgeDocPage,
      apiParams: {
        pageNumber: 1,
        pageSize: 10
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: '文档ID',
          visible: false
        },
        {
          prop: 'ossFileId',
          label: 'OSS文件ID',
          visible: false
        },
        {
          prop: 'docName',
          label: '文档名称',
          minWidth: 220,
          showOverflowTooltip: true
        },
        {
          prop: 'docType',
          label: '文档类型',
          width: 110,
          align: 'center'
        },
        {
          prop: 'parseStatus',
          label: '解析状态',
          width: 110,
          align: 'center',
          formatter: (row: KnowledgeDocRowItem) => renderStatusTag(row.parseStatus)
        },
        {
          prop: 'vectorStatus',
          label: '向量状态',
          width: 110,
          align: 'center',
          formatter: (row: KnowledgeDocRowItem) => renderStatusTag(row.vectorStatus)
        },
        {
          prop: 'uploadTime',
          label: '上传时间',
          minWidth: 170
        },
        {
          prop: 'uploadName',
          label: '上传人',
          width: 120,
          align: 'center'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 240,
          fixed: 'right',
          align: 'center',
          formatter: (row: KnowledgeDocRowItem) => renderOperation(row)
        }
      ]
    }
  })

  /** 渲染状态标签 */
  const renderStatusTag = (status: KnowledgeDocStatus): VNode => {
    const item = STATUS_MAP[status] ?? { label: status, type: 'info' }
    return h(ElTag, { type: item.type, disableTransitions: true }, () => item.label)
  }

  /** 渲染操作按钮 */
  const renderOperation = (row: KnowledgeDocRowItem): VNode => {
    const buttons: VNode[] = [
      h(
        ElButton,
        {
          type: 'primary',
          link: true,
          size: 'small',
          icon: Document,
          onClick: () => handleParse(row)
        },
        () => '解析文档'
      ),
      h(
        ElButton,
        {
          type: 'primary',
          link: true,
          size: 'small',
          icon: MagicStick,
          onClick: () => handleVector(row)
        },
        () => '处理向量'
      ),
      h(
        ElButton,
        {
          type: 'danger',
          link: true,
          size: 'small',
          icon: Delete,
          onClick: () => handleDelete(row)
        },
        () => '删除'
      )
    ]
    return h('div', { class: 'flex justify-center gap-1' }, buttons)
  }

  /** 选择文件后上传文档 */
  const handleUploadChange = async (uploadFile: UploadFile) => {
    const file = uploadFile.raw
    if (!file) return
    uploading.value = true
    try {
      await uploadKnowledgeDoc(file)
      ElMessage.success('上传成功')
      refreshCreate()
    } catch (error) {
      console.log('文档上传失败:', error)
    } finally {
      uploading.value = false
      uploadRef.value?.clearFiles()
    }
  }

  const handleSearch = () => {
    Object.assign(searchParams, searchFormState.value)
    getData()
  }

  const handleReset = () => {
    resetSearchParams()
  }

  /** 解析文档：确认后调用后端接口，后端先置processing并异步解析 */
  const handleParse = (row: KnowledgeDocRowItem) => {
    ElMessageBox.confirm('确定解析文档"' + row.docName + '"吗？', '解析确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        parseKnowledgeDoc(row.id).then(() => {
          ElMessage.success('已开始解析文档')
          refreshData()
        })
      })
      .catch(() => {
        ElMessage.info('已取消解析')
      })
  }

  /** 处理向量：先校验文档解析状态，确认后调用后端接口 */
  const handleVector = (row: KnowledgeDocRowItem) => {
    // 先校验当前文档是否已经完成文档解析
    if (row.parseStatus !== 'complete') {
      ElMessage.warning('请先完成文档解析后再进行向量处理')
      return
    }
    ElMessageBox.confirm('确定对文档"' + row.docName + '"进行向量处理吗？', '向量处理确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        vectorKnowledgeDoc(row.id).then(() => {
          ElMessage.success('已开始向量处理')
          refreshData()
        })
      })
      .catch(() => {
        ElMessage.info('已取消向量处理')
      })
  }

  /** 删除文档 */
  const handleDelete = (row: KnowledgeDocRowItem) => {
    ElMessageBox.confirm('确定删除文档"' + row.docName + '"吗？此操作不可恢复！', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        deleteKnowledgeDoc([row.id]).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            refreshRemove()
          }
        })
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>

<style scoped></style>
