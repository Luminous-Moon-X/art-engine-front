<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增租户' : '编辑租户'"
    width="600px"
    @closed="handleDialogClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px" status-icon>
      <ElFormItem label="租户名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入租户名称" />
      </ElFormItem>

      <ElFormItem label="有效期" prop="expireDate">
        <ElDatePicker
          v-model="formData.expireDate"
          type="date"
          placeholder="选择有效截止日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="启用状态" prop="status">
        <ElSwitch v-model="formData.status" />
      </ElFormItem>

      <ElDivider content-position="left">管理员账号信息</ElDivider>

      <ElFormItem label="管理员账号" prop="adminAccount">
        <ElInput
          v-model="formData.adminAccount"
          placeholder="请输入管理员账号"
          :disabled="dialogType === 'edit'"
          autocomplete="off"
        />
      </ElFormItem>

      <ElFormItem
        label="管理员密码"
        prop="adminPassword"
        :rules="dialogType === 'add' ? formRules.adminPassword : []"
      >
        <ElInput
          v-model="formData.adminPassword"
          type="password"
          placeholder="请输入密码"
          show-password
          autocomplete="new-password"
          @input="checkPasswordStrength"
        />
        <div v-if="formData.adminPassword" class="mt-2">
          <div class="text-xs text-gray-500 mb-1">密码强度: {{ passwordStrengthText }}</div>
          <ElProgress
            :percentage="passwordStrength"
            :color="passwordStrengthColor"
            :show-text="false"
          />
        </div>
      </ElFormItem>

      <ElFormItem label="备注" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">确认</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { createTenant, updateTenant } from '@/api/tenant'

  const emit = defineEmits(['success'])

  const visible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const formData = reactive<Api.Tenant.CreateTenantParams & { id?: number }>({
    name: '',
    expireDate: '',
    status: true,
    adminAccount: '',
    adminPassword: '',
    description: ''
  })

  const formRules = reactive<FormRules>({
    name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
    expireDate: [{ required: true, message: '请选择有效期', trigger: 'change' }],
    adminAccount: [
      { required: true, message: '请输入管理员账号', trigger: 'blur' },
      { min: 4, message: '账号长度至少4位', trigger: 'blur' }
    ],
    adminPassword: [
      { required: true, message: '请输入管理员密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ]
  })

  // 密码强度
  const passwordStrength = ref(0)
  const passwordStrengthColor = computed(() => {
    if (passwordStrength.value < 40) return '#f56c6c'
    if (passwordStrength.value < 80) return '#e6a23c'
    return '#67c23a'
  })
  const passwordStrengthText = computed(() => {
    if (passwordStrength.value < 40) return '弱'
    if (passwordStrength.value < 80) return '中'
    return '强'
  })

  const checkPasswordStrength = (val: string) => {
    let score = 0
    if (val.length >= 6) score += 20
    if (/[A-Z]/.test(val)) score += 20
    if (/[a-z]/.test(val)) score += 20
    if (/[0-9]/.test(val)) score += 20
    if (/[^A-Za-z0-9]/.test(val)) score += 20
    passwordStrength.value = score
  }

  const handleDialogClosed = () => {
    formRef.value?.resetFields()
    passwordStrength.value = 0
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          if (dialogType.value === 'add') {
            await createTenant(formData)
            ElMessage.success('创建成功')
          } else {
            await updateTenant(formData as Api.Tenant.UpdateTenantParams)
            ElMessage.success('更新成功')
          }
          visible.value = false
          emit('success')
        } catch (error) {
          console.error(error)
        } finally {
          submitting.value = false
        }
      }
    })
  }

  const open = (type: 'add' | 'edit', row?: Api.Tenant.TenantListItem) => {
    dialogType.value = type
    visible.value = true

    if (type === 'add') {
      // Reset form data for add
      formData.id = undefined
      formData.name = ''
      formData.expireDate = ''
      formData.status = true
      formData.adminAccount = ''
      formData.adminPassword = ''
      formData.description = ''
      passwordStrength.value = 0
    } else if (row) {
      // Fill form data for edit
      Object.assign(formData, row)
      formData.adminPassword = '' // Do not echo password on edit
    }
  }

  defineExpose({
    open
  })
</script>
