<template>
  <ElDialog
    v-model="visible"
    title="上传文件"
    width="600px"
    align-center
    destroy-on-close
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px" status-icon>
      <ElFormItem label="上传路径" prop="directory">
        <ElInput
          v-model="form.directory"
          placeholder="请输入上传路径，例如：/folder/upload"
          maxlength="100"
        />
      </ElFormItem>
      <ElFormItem label="文件" prop="file" required>
        <ElUpload
          class="upload-btn"
          action="#"
          :auto-upload="false"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :show-file-list="true"
          :limit="1"
        >
          <template v-slot:trigger>
            <ElButton type="primary">选择文件</ElButton>
          </template>
        </ElUpload>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">上传</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { uploadOssFile } from '@/api/oss'
  import { OssFileUploadForm } from '@/types/oss'

  interface Props {
    modelValue: boolean
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false
  })

  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const rules = reactive<FormRules>({
    file: [{ required: true, message: '请选择文件', trigger: 'blur' }]
  })

  const form = reactive<OssFileUploadForm>({
    directory: null,
    file: null
  })

  const handleChange = (uploadFile: UploadFile) => {
    form.file = uploadFile.raw as File
  }

  const handleRemove = () => {
    form.file = null
  }

  watch(
    () => props.modelValue,
    () => {
      if (props.modelValue) initForm()
    },
    { deep: true }
  )

  const initForm = () => {
    Object.assign(form, {
      directory: null,
      file: null
    })
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitting.value = true
      await uploadOssFile(form.file!, form.directory)
      ElMessage.success('上传成功')
      emit('success')
      visible.value = false
    } catch (error) {
      console.log('表单提交失败:', error)
    } finally {
      submitting.value = false
    }
  }
</script>
