<template>
  <div class="kb-doc-list">
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

    <!-- 编辑文档内容抽屉 -->
    <ElDrawer
      v-model="editDrawerVisible"
      class="art-edit-content-drawer"
      size="85%"
      :destroy-on-close="true"
    >
      <template #header>
        <div>
          <p class="text-base font-medium">编辑文档内容</p>
          <p class="mt-1 text-sm text-g-500">{{ editDocName }}</p>
        </div>
      </template>

      <div v-loading="contentLoading" class="flex-1 min-h-0">
        <ArtMarkdownEditor
          v-if="editDrawerVisible"
          v-model="editContent"
          height="100%"
          placeholder="请输入文档内容..."
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="editDrawerVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="savingContent" @click="handleSaveContent"
            >保存</ElButton
          >
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import {
    uploadKnowledgeDoc,
    fetchKnowledgeDocPage,
    parseKnowledgeDoc,
    vectorKnowledgeDoc,
    fetchKnowledgeDocContent,
    updateKnowledgeDocContent,
    deleteKnowledgeDoc
  } from '@/api/knowledge-doc'
  import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { Delete, Document, EditPen, MagicStick } from '@element-plus/icons-vue'
  import type { KnowledgeDocRowItem, KnowledgeDocStatus } from '@/types/knowledge-doc'
  import type { UploadFile } from 'element-plus'
  import type { VNode } from 'vue'

  defineOptions({ name: 'KnowledgeDocList' })

  interface Props {
    /** 所属知识库ID */
    kbId: number
  }

  const props = defineProps<Props>()

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
  /** 编辑内容抽屉是否可见 */
  const editDrawerVisible = ref(false)
  /** 正在编辑内容的文档ID */
  const editDocId = ref(0)
  /** 正在编辑内容的文档名称 */
  const editDocName = ref('')
  /** 编辑中的文档内容 */
  const editContent = ref('')
  /** 内容加载中状态 */
  const contentLoading = ref(false)
  /** 保存内容中状态 */
  const savingContent = ref(false)

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
        pageSize: 10,
        kbId: props.kbId
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
          prop: 'kbId',
          label: '知识库ID',
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
          width: 300,
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
      ...(row.parseStatus === 'complete'
        ? [
            h(
              ElButton,
              {
                type: 'primary',
                link: true,
                size: 'small',
                icon: EditPen,
                onClick: () => handleEditContent(row)
              },
              () => '编辑内容'
            )
          ]
        : []),
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
      await uploadKnowledgeDoc(file, props.kbId)
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
      .catch(() => {})
  }

  /** 打开编辑内容抽屉并加载文档内容 */
  const handleEditContent = async (row: KnowledgeDocRowItem) => {
    editDocId.value = row.id
    editDocName.value = row.docName
    editContent.value = ''
    editDrawerVisible.value = true
    contentLoading.value = true
    try {
      const res = await fetchKnowledgeDocContent(row.id)
      editContent.value = res?.content ?? ''
    } catch (error) {
      console.log('获取文档内容失败:', error)
    } finally {
      contentLoading.value = false
    }
  }

  /** 保存编辑后的文档内容 */
  const handleSaveContent = async () => {
    savingContent.value = true
    try {
      const res = await updateKnowledgeDocContent(editDocId.value, editContent.value)
      if (res) {
        ElMessage.success('保存成功')
        editDrawerVisible.value = false
        refreshData()
      }
    } catch (error) {
      console.log('保存文档内容失败:', error)
    } finally {
      savingContent.value = false
    }
  }

  /** 处理向量：先校验文档解析状态，确认后调用后端接口 */
  const handleVector = (row: KnowledgeDocRowItem) => {
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
      .catch(() => {})
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
      .catch(() => {})
  }
</script>

<style lang="scss">
  .kb-doc-list {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* 编辑内容抽屉：内容区占满剩余高度，markdown编辑器随抽屉尺寸自适应 */
  .art-edit-content-drawer {
    .el-drawer__body {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
</style>