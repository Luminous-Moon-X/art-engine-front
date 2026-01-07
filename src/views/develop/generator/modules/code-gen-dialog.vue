<template>
  <ElDialog v-model="visible" title="代码生成" width="500px" align-center @closed="handleClosed">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="模块名称" prop="moduleName">
        <ElInput v-model="formData.moduleName" placeholder="例如：art-business" />
      </ElFormItem>

      <ElFormItem label="生成内容" prop="generateContent">
        <ElCheckboxGroup v-model="formData.generateContent">
          <ElCheckbox label="Controller">Controller</ElCheckbox>
          <ElCheckbox label="Service">Service</ElCheckbox>
          <ElCheckbox label="Mapper">Mapper</ElCheckbox>
          <ElCheckbox label="MapperXml">Mapper Xml</ElCheckbox>
          <ElCheckbox label="VO">VO</ElCheckbox>
          <ElCheckbox label="BO">BO</ElCheckbox>
          <ElCheckbox label="Entity">Entity</ElCheckbox>
        </ElCheckboxGroup>
      </ElFormItem>

      <ElFormItem label="根包" prop="rootPackage">
        <ElInput v-model="formData.rootPackage" placeholder="例如：com.art" />
      </ElFormItem>

      <ElFormItem label="作者名称" prop="authorName">
        <ElInput v-model="formData.authorName" placeholder="例如：张三" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleGenerate">生成</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'CodeGenDialog' })

  interface Props {
    modelValue: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'generate', data: GenerateCodeFormData): void
  }

  export interface GenerateCodeFormData {
    moduleName: string
    generateContent: string[]
    rootPackage: string
    authorName: string
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

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

    await formRef.value.validate((valid) => {
      if (valid) {
        emit('generate', { ...formData })
        visible.value = false
      }
    })
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }
</script>

<style scoped>
  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
</style>
