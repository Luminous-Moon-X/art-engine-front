<template>
  <ElDialog
    v-model="visible"
    title="代码生成"
    width="1100px"
    align-center
    class="code-gen-dialog"
    @closed="handleClosed"
  >
    <div class="flex h-[550px] overflow-hidden rounded-lg border border-gray-100">
      <!-- 左侧：数据表选择 -->
      <div class="flex w-[320px] flex-col bg-gray-50/50">
        <div
          class="flex items-center justify-between border-b border-gray-100 px-5 py-4 text-sm font-medium text-gray-900"
        >
          <span>数据表选择</span>
          <span class="text-xs font-normal text-gray-500"
            >已选 {{ innerSelectedTables.length }} 项</span
          >
        </div>
        <div class="flex-1 overflow-hidden p-2">
          <ElTable
            ref="tableRef"
            :data="tables"
            row-key="id"
            height="100%"
            class="custom-table"
            :header-cell-style="{ background: 'transparent', color: '#666' }"
            @selection-change="handleSelectionChange"
          >
            <ElTableColumn type="selection" width="40" />
            <ElTableColumn prop="tableName" label="表名" show-overflow-tooltip min-width="120">
              <template #default="{ row }">
                <span class="font-medium text-gray-700">{{ row.tableName }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="tableDescription"
              label="描述"
              show-overflow-tooltip
              min-width="100"
            >
              <template #default="{ row }">
                <span class="text-gray-500">{{ row.tableDescription }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <!-- 右侧：配置信息 -->
      <div class="flex flex-1 flex-col bg-white">
        <div class="border-b border-gray-100 px-8 py-4 text-sm font-medium text-gray-900">
          生成配置
        </div>
        <div class="flex-1 overflow-y-auto px-8 py-6">
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-position="top"
            class="custom-form"
          >
            <div class="grid grid-cols-2 gap-x-8">
              <ElFormItem label="模块名称" prop="moduleName">
                <ElInput v-model="formData.moduleName" placeholder="例如：art-business" />
                <div class="mt-1 text-xs text-gray-400">生成的模块名称，将作为项目子模块</div>
              </ElFormItem>

              <ElFormItem label="根包路径" prop="rootPackage">
                <ElInput v-model="formData.rootPackage" placeholder="例如：com.art" />
                <div class="mt-1 text-xs text-gray-400">Java 代码的根包路径</div>
              </ElFormItem>

              <ElFormItem label="作者名称" prop="authorName">
                <ElInput v-model="formData.authorName" placeholder="例如：Art Engine" />
                <div class="mt-1 text-xs text-gray-400">生成代码注释中的作者信息</div>
              </ElFormItem>
            </div>

            <ElDivider class="!my-6" border-style="dashed" />

            <ElFormItem label="生成内容" prop="generateContent" class="mb-0">
              <div class="w-full overflow-hidden rounded-lg bg-gray-50 p-4">
                <ElCheckboxGroup v-model="formData.generateContent" class="custom-checkbox-group">
                  <ElCheckboxButton label="Controller">Controller</ElCheckboxButton>
                  <ElCheckboxButton label="Service">Service</ElCheckboxButton>
                  <ElCheckboxButton label="Mapper">Mapper</ElCheckboxButton>
                  <ElCheckboxButton label="MapperXml">Mapper Xml</ElCheckboxButton>
                  <ElCheckboxButton label="VO">VO</ElCheckboxButton>
                  <ElCheckboxButton label="BO">BO</ElCheckboxButton>
                  <ElCheckboxButton label="Entity">Entity</ElCheckboxButton>
                </ElCheckboxGroup>
              </div>
            </ElFormItem>
          </ElForm>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between px-2 pt-2">
        <div class="text-xs text-gray-400">
          <ElIcon class="mr-1 translate-y-[1px]"><InfoFilled /></ElIcon>
          配置将应用于所有选中的数据表
        </div>
        <div class="dialog-footer">
          <ElButton @click="handleCancel">取消</ElButton>
          <ElButton type="primary" @click="handleGenerate" :disabled="!innerSelectedTables.length">
            生成代码
          </ElButton>
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { InfoFilled } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, TableInstance } from 'element-plus'
  import type { CodeGeneratorRow } from '@/api/develop/generator'

  defineOptions({ name: 'CodeGenDialog' })

  interface Props {
    modelValue: boolean
    tables: CodeGeneratorRow[]
    defaultSelectedTables: CodeGeneratorRow[]
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'generate', data: GenerateCodeFormData, tables: CodeGeneratorRow[]): void
  }

  export interface GenerateCodeFormData {
    moduleName: string
    generateContent: string[]
    rootPackage: string
    authorName: string
  }

  const props = withDefaults(defineProps<Props>(), {
    tables: () => [],
    defaultSelectedTables: () => []
  })
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const tableRef = ref<TableInstance>()
  const innerSelectedTables = ref<CodeGeneratorRow[]>([])

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        nextTick(() => {
          if (tableRef.value) {
            tableRef.value.clearSelection()
            props.defaultSelectedTables.forEach((row) => {
              const found = props.tables.find((t) => t.id === row.id)
              if (found) {
                tableRef.value!.toggleRowSelection(found, true)
              }
            })
          }
        })
      }
    }
  )

  const handleSelectionChange = (selection: CodeGeneratorRow[]) => {
    innerSelectedTables.value = selection
  }

  const formData = reactive<GenerateCodeFormData>({
    moduleName: '',
    generateContent: ['Controller', 'Service', 'Mapper', 'MapperXml', 'VO', 'BO', 'Entity'],
    rootPackage: '',
    authorName: ''
  })

  const rules = reactive<FormRules>({
    moduleName: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
    generateContent: [
      {
        type: 'array',
        required: true,
        message: '请至少选择一项生成内容',
        trigger: 'change'
      }
    ],
    rootPackage: [{ required: true, message: '请输入根包', trigger: 'blur' }],
    authorName: [{ required: true, message: '请输入作者名称', trigger: 'blur' }]
  })

  const handleCancel = () => {
    visible.value = false
  }

  const handleGenerate = async () => {
    if (!formRef.value) return

    if (innerSelectedTables.value.length === 0) {
      ElMessage.warning('请至少选择一张数据表')
      return
    }

    await formRef.value.validate((valid) => {
      if (valid) {
        emit('generate', { ...formData }, innerSelectedTables.value)
        visible.value = false
      }
    })
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    innerSelectedTables.value = []
  }
</script>

<style scoped>
  .dialog-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  /* 自定义表格样式，移除边框，增加通透感 */
  :deep(.custom-table) {
    --el-table-border-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-row-hover-bg-color: var(--el-color-primary-light-9);

    background-color: transparent;
  }

  :deep(.custom-table .el-table__inner-wrapper::before) {
    display: none; /* 移除底部横线 */
  }

  :deep(.custom-table .el-table__cell) {
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  /* 自定义 Checkbox Button 样式 */
  .custom-checkbox-group {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    width: 100%;
    padding-bottom: 2px; /* 防止滚动条遮挡阴影 */
    overflow-x: auto;
  }

  /* 隐藏滚动条 */
  .custom-checkbox-group::-webkit-scrollbar {
    display: none;
  }

  :deep(.custom-checkbox-group .el-checkbox-button__inner) {
    padding: 9px 16px;
    font-size: 13px;
    background: white;
    border: 1px solid var(--el-border-color);
    border-radius: 6px !important;
    box-shadow: none !important;
    transition: all 0.3s;
  }

  :deep(.custom-checkbox-group .el-checkbox-button.is-checked .el-checkbox-button__inner) {
    color: white;
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 6px var(--el-color-primary-light-5) !important;
  }

  /* 覆盖 Element Dialog 默认样式优化 */
  :global(.code-gen-dialog .el-dialog__body) {
    padding: 20px 24px !important; /* 调整内边距 */
  }
</style>
