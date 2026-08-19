<template>
  <div class="art-full-height">
    <ArtSearchBar
      v-model="searchFormState"
      :items="searchItems"
      class="kb-search-form"
      label-width="100px"
      :show-reset="true"
      :show-search="true"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #action>
        <ElButton type="primary" :icon="Plus" v-ripple @click="openCreate">创建知识库</ElButton>
      </template>
    </ArtSearchBar>

    <div class="mt-3 flex-1 min-h-0 overflow-auto">
      <div v-if="list.length === 0 && !loading" class="flex h-full items-center justify-center">
        <ElEmpty description="暂无知识库" />
      </div>
      <div
        v-else
        class="grid grid-cols-5 gap-5 max-2xl:grid-cols-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="group cursor-pointer overflow-hidden rounded-lg border border-g-300/60 bg-white transition hover:shadow-md"
          @click="openDrawer(item)"
        >
          <div class="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
            <ElImage
              v-if="coverLoaded(item.coverOssFileId)"
              class="h-full w-full"
              :src="coverLoaded(item.coverOssFileId)"
              fit="cover"
              lazy
            />
            <div v-else-if="coverLoading(item.coverOssFileId)" class="cover-loading">
              <ElIcon class="is-loading" :size="24"><Loading /></ElIcon>
            </div>
            <div v-else class="kb-cover">
              <span class="kb-cover-title">{{ item.kbName }}</span>
            </div>
          </div>
          <div class="p-3">
            <div class="flex items-center justify-between gap-2">
              <h3 class="truncate text-base font-medium text-g-800">{{ item.kbName }}</h3>
              <div class="flex shrink-0 items-center gap-1" @click.stop>
                <ElButton link type="primary" size="small" @click="openEdit(item)">编辑</ElButton>
                <ElButton link type="danger" size="small" @click="handleDelete(item)">删除</ElButton>
              </div>
            </div>
            <p class="mt-1 line-clamp-2 min-h-10 text-sm text-g-500">{{ item.kbDesc || '暂无描述' }}</p>
            <p class="mt-2 text-xs text-g-400">{{ item.createTime || '' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center py-4">
      <ElPagination
        v-model:current-page="pageNumber"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="loadList"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 创建/编辑知识库弹框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '创建知识库' : '编辑知识库'"
      width="520px"
      align-center
      destroy-on-close
      @closed="resetForm"
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" class="kb-edit-form">
        <ElFormItem label="知识库名称" prop="kbName">
          <ElInput v-model="form.kbName" maxlength="100" show-word-limit placeholder="请输入知识库名称" />
        </ElFormItem>
        <ElFormItem label="知识库描述" prop="kbDesc">
          <ElInput
            v-model="form.kbDesc"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="请输入知识库描述"
          />
        </ElFormItem>
        <ElFormItem label="封面">
          <div class="w-full">
            <ElUpload
              :auto-upload="false"
              :show-file-list="false"
              :limit="1"
              accept="image/*"
              :on-change="handleCoverChange"
            >
              <template #trigger>
                <ElButton :loading="coverUploading">上传封面</ElButton>
              </template>
            </ElUpload>

            <div
              v-if="coverLoaded(form.coverOssFileId)"
              class="mt-3 h-40 w-64 overflow-hidden rounded-md border border-g-200 bg-gray-100"
            >
              <ElImage
                class="h-full w-full"
                :src="coverLoaded(form.coverOssFileId)"
                fit="cover"
              />
            </div>
            <div
              v-else-if="coverLoading(form.coverOssFileId)"
              class="mt-3 h-40 w-64 overflow-hidden rounded-md"
            >
              <div class="cover-loading">
                <ElIcon class="is-loading" :size="20"><Loading /></ElIcon>
              </div>
            </div>
          </div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 文档管理抽屉 -->
    <ElDrawer
      v-model="drawerVisible"
      class="art-kb-drawer"
      size="85%"
      :destroy-on-close="true"
    >
      <template #header>
        <div>
          <p class="text-base font-medium">文档管理</p>
          <p class="mt-1 text-sm text-g-500">{{ currentKb?.kbName }}</p>
        </div>
      </template>

      <KnowledgeDocList v-if="currentKb" :kb-id="currentKb.id" />
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { fetchKnowledgeBasePage, addKnowledgeBase, editKnowledgeBase, deleteKnowledgeBase } from '@/api/knowledge-base'
  import { uploadOssFile, downloadOssFile } from '@/api/oss'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Loading } from '@element-plus/icons-vue'
  import type { KnowledgeBaseRowItem, KnowledgeBaseForm } from '@/types/knowledge-base'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import KnowledgeDocList from './modules/knowledge-doc-list.vue'

  defineOptions({ name: 'KnowledgeBaseManagement' })

  /** 查询表单 */
  const searchFormState = ref<{ kbName: string }>({ kbName: '' })

  const searchItems = computed(() => [
    {
      key: 'kbName',
      label: '知识库名称',
      type: 'input',
      props: { placeholder: '请输入知识库名称' }
    }
  ])

  /** 列表数据 */
  const loading = ref(false)
  const list = ref<KnowledgeBaseRowItem[]>([])
  const total = ref(0)
  const pageNumber = ref(1)
  const pageSize = ref(12)

  /** 封面文件ID -> 加载状态与临时预览地址（通过后端下载接口获取） */
  const coverMap = reactive<Record<number, { status: 'loading' | 'success' | 'error'; url?: string }>>({})

  /** 封面是否已加载成功，返回可展示的预览地址（空串表示未加载成功） */
  const coverLoaded = (id?: number | null): string => {
    if (id == null) return ''
    const state = coverMap[id]
    return state?.status === 'success' ? (state.url ?? '') : ''
  }

  /** 封面是否正在加载中 */
  const coverLoading = (id?: number | null): boolean => {
    if (id == null) return false
    return coverMap[id]?.status === 'loading'
  }

  /** 下载封面并生成临时预览地址 */
  const loadCover = async (id: number) => {
    if (!id || coverMap[id]) return
    coverMap[id] = { status: 'loading' }
    try {
      const blob = await downloadOssFile(id)
      coverMap[id] = { status: 'success', url: URL.createObjectURL(blob) }
    } catch (error) {
      console.log('加载封面失败:', error)
      coverMap[id] = { status: 'error' }
    }
  }

  /** 创建/编辑弹框 */
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive<KnowledgeBaseForm>({
    id: null,
    kbName: '',
    kbDesc: '',
    coverOssFileId: null
  })
  const rules: FormRules = {
    kbName: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }]
  }
  const coverUploading = ref(false)

  /** 文档管理抽屉 */
  const drawerVisible = ref(false)
  const currentKb = ref<KnowledgeBaseRowItem | null>(null)

  const loadList = async () => {
    loading.value = true
    try {
      const res = await fetchKnowledgeBasePage({
        kbName: searchFormState.value.kbName,
        pageNumber: pageNumber.value,
        pageSize: pageSize.value
      })
      list.value = res?.records ?? []
      total.value = res?.totalRow ?? 0
      list.value.forEach((item) => {
        if (item.coverOssFileId != null) {
          loadCover(item.coverOssFileId)
        }
      })
    } catch (error) {
      console.log('获取知识库列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pageNumber.value = 1
    loadList()
  }

  const handleReset = () => {
    searchFormState.value.kbName = ''
    pageNumber.value = 1
    loadList()
  }

  const handleSizeChange = () => {
    pageNumber.value = 1
    loadList()
  }

  const resetForm = () => {
    Object.assign(form, { id: null, kbName: '', kbDesc: '', coverOssFileId: null })
    formRef.value?.clearValidate()
  }

  const openCreate = () => {
    dialogType.value = 'add'
    resetForm()
    dialogVisible.value = true
  }

  const openEdit = (item: KnowledgeBaseRowItem) => {
    dialogType.value = 'edit'
    Object.assign(form, {
      id: item.id,
      kbName: item.kbName,
      kbDesc: item.kbDesc ?? '',
      coverOssFileId: item.coverOssFileId ?? null
    })
    if (item.coverOssFileId != null) {
      loadCover(item.coverOssFileId)
    }
    dialogVisible.value = true
  }

  const handleCoverChange = async (uploadFile: UploadFile) => {
    const file = uploadFile.raw
    if (!file) return
    coverUploading.value = true
    try {
      // 存储对象存储文件ID，桶为私有，展示时通过下载接口获取
      const res = await uploadOssFile(file, '/knowledge-cover')
      form.coverOssFileId = res?.id ?? null
      if (form.coverOssFileId != null) {
        await loadCover(form.coverOssFileId)
      }
    } catch (error) {
      console.log('封面上传失败:', error)
    } finally {
      coverUploading.value = false
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }
    submitting.value = true
    try {
      const payload: KnowledgeBaseForm = {
        id: form.id ?? null,
        kbName: form.kbName,
        kbDesc: form.kbDesc,
        coverOssFileId: form.coverOssFileId ?? null
      }
      if (dialogType.value === 'add') {
        await addKnowledgeBase(payload)
        ElMessage.success('创建成功')
      } else {
        await editKnowledgeBase(payload)
        ElMessage.success('保存成功')
      }
      dialogVisible.value = false
      loadList()
    } catch (error) {
      console.log('提交失败:', error)
    } finally {
      submitting.value = false
    }
  }

  const handleDelete = (item: KnowledgeBaseRowItem) => {
    ElMessageBox.confirm(
      `确定删除知识库"${item.kbName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(() => {
        deleteKnowledgeBase([item.id]).then((res) => {
          if (res) {
            ElMessage.success('删除成功')
            loadList()
          }
        })
      })
      .catch(() => {})
  }

  const openDrawer = (item: KnowledgeBaseRowItem) => {
    currentKb.value = item
    drawerVisible.value = true
  }

  onMounted(() => {
    loadList()
  })

  onBeforeUnmount(() => {
    Object.values(coverMap).forEach((state) => {
      if (state.url) URL.revokeObjectURL(state.url)
    })
  })
</script>

<style lang="scss">
  /* 防止知识库名称等较长 label 换行 */
  .kb-search-form,
  .kb-edit-form {
    .el-form-item__label {
      white-space: nowrap;
    }
  }

  .art-kb-drawer {
    .el-drawer__body {
      display: flex;
      flex-direction: column;
      padding: 16px;
      overflow: hidden;
    }
  }

  /* 封面加载中 */
  .cover-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #c0c4cc;
    background: #f5f7fa;
  }

  /* 默认封面：传统书籍封皮 */
  .kb-cover {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(180deg, #3e4b57 0%, #2b3540 100%);
    color: #f0e9da;

    /* 压印内框（左右对称） */
    &::after {
      content: '';
      position: absolute;
      inset: 10px;
      border: 1px solid rgba(240, 233, 218, 0.4);
      pointer-events: none;
    }

    .kb-cover-title {
      position: relative;
      z-index: 1;
      padding: 0 34px;
      text-align: center;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.08em;
      line-height: 1.65;
      color: inherit;
      max-height: 4.95em;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      word-break: break-all;
    }
  }
</style>