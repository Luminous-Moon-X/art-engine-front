<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增对象存储配置' : '编辑对象存储配置'"
    width="600px"
    align-center
    destroy-on-close
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px" status-icon>
      <ElFormItem label="配置名称" prop="configName">
        <ElInput v-model="form.configName" placeholder="请输入配置名称" maxlength="100" />
      </ElFormItem>

      <ElFormItem label="服务地址" prop="endpoint">
        <ElInput
          v-model="form.endpoint"
          placeholder="例如 http://127.0.0.1:9000 或 https://s3.amazonaws.com"
          maxlength="255"
        />
      </ElFormItem>

      <ElFormItem label="Access Key" prop="accessKey">
        <ElInput v-model="form.accessKey" placeholder="请输入Access Key" maxlength="255" />
      </ElFormItem>

      <ElFormItem
        label="Secret Key"
        prop="secretKey"
        :required="dialogType === 'add'"
        :rules="dialogType === 'add' ? rules.secretKey : []"
      >
        <ElInput
          v-model="form.secretKey"
          type="password"
          show-password
          :placeholder="dialogType === 'add' ? '请输入Secret Key' : '留空表示不修改'"
          maxlength="255"
        />
      </ElFormItem>

      <ElFormItem label="桶（Bucket）" prop="bucketName">
        <ElInput v-model="form.bucketName" placeholder="请输入Bucket名称" maxlength="255" />
      </ElFormItem>

      <ElFormItem label="是否启用" prop="enableFlag">
        <ElSwitch v-model="form.enableFlag" />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { addOssConfig, editOssConfig } from '@/api/oss'
  import { OssConfigForm, OssConfigRowItem, OssConfigSubmitParams } from '@/types/oss'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    ossData?: OssConfigRowItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    ossData: undefined
  })

  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const rules = reactive<FormRules>({
    configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
    endpoint: [{ required: true, message: '请输入S3服务地址', trigger: 'blur' }],
    accessKey: [{ required: true, message: '请输入Access Key', trigger: 'blur' }],
    secretKey: [{ required: true, message: '请输入Secret Key', trigger: 'blur' }],
    bucketName: [{ required: true, message: '请输入Bucket名称', trigger: 'blur' }]
  })

  const form = reactive<OssConfigForm>({
    id: null,
    configName: '',
    endpoint: '',
    accessKey: '',
    secretKey: '',
    bucketName: '',
    enableFlag: false,
    remark: ''
  })

  watch(
    () => [props.modelValue, props.ossData],
    () => {
      if (props.modelValue) initForm()
    },
    { deep: true }
  )

  const initForm = () => {
    if (props.dialogType === 'edit' && props.ossData) {
      Object.assign(form, {
        id: props.ossData.id,
        configName: props.ossData.configName,
        endpoint: props.ossData.endpoint,
        accessKey: props.ossData.accessKey,
        secretKey: '',
        bucketName: props.ossData.bucketName,
        enableFlag: props.ossData.enableFlag === 1,
        remark: props.ossData.remark || ''
      })
    } else {
      Object.assign(form, {
        id: null,
        configName: '',
        endpoint: '',
        accessKey: '',
        secretKey: '',
        bucketName: '',
        enableFlag: false,
        remark: ''
      })
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitting.value = true
      const params: OssConfigSubmitParams = {
        ...form,
        enableFlag: form.enableFlag ? 1 : 0
      }
      if (props.dialogType === 'add') {
        await addOssConfig(params)
        ElMessage.success('新增成功')
      } else {
        await editOssConfig(params)
        ElMessage.success('修改成功')
      }
      emit('success')
      visible.value = false
    } catch (error) {
      console.log('表单提交失败:', error)
    } finally {
      submitting.value = false
    }
  }
</script>
