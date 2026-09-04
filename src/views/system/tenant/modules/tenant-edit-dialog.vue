<!-- 租户编辑弹窗 -->
<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增租户' : '编辑租户'"
    width="60%"
    align-center
    @close="handleClose"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px">
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="租户名称" prop="tenantName">
            <ElInput v-model="form.tenantName" placeholder="请输入租户名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="租户编码" prop="tenantCode">
            <ElInput
              v-model="form.tenantCode"
              :disabled="dialogType === 'edit'"
              placeholder="请输入租户编码（唯一）"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="租户套餐" prop="packageId">
            <ElSelect
              v-model="form.packageId"
              placeholder="请选择租户套餐"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="item in packageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="到期时间" prop="expireDate">
            <ElDatePicker
              v-model="form.expireDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择到期时间"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="dialogType === 'add'">
        <ElCol :span="12">
          <ElFormItem label="管理员用户名" prop="adminUsername">
            <ElInput v-model="form.adminUsername" placeholder="创建该租户的管理员账号" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enableFlag">
            <ElSwitch v-model="form.enableFlag" :active-value="1" :inactive-value="0" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-else>
        <ElCol :span="12">
          <ElFormItem label="管理员账号" prop="adminUsername">
            <ElInput v-model="form.adminUsername" disabled />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enableFlag">
            <ElSwitch v-model="form.enableFlag" :active-value="1" :inactive-value="0" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { createTenant, updateTenant } from '@/api/tenant'
  import { fetchTenantPackageSelect } from '@/api/tenant-package'

  type TenantListItem = Api.Tenant.TenantListItem

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    tenantData?: TenantListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    tenantData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const packageList = ref<Array<{ label: string; value: number }>>([])

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    tenantName: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
    tenantCode: [{ required: true, message: '请输入租户编码', trigger: 'blur' }],
    packageId: [{ required: true, message: '请选择租户套餐', trigger: 'change' }],
    adminUsername: [{ required: true, message: '请输入管理员用户名', trigger: 'blur' }]
  })

  const emptyForm = () => ({
    id: undefined,
    tenantCode: '',
    tenantName: '',
    packageId: undefined,
    adminUsername: '',
    enableFlag: 1,
    expireDate: '',
    remark: ''
  })

  /**
   * 表单数据
   */
  const form = reactive<Record<string, any>>(emptyForm())

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal) {
        initForm()
        const res = await fetchTenantPackageSelect()
        packageList.value = res || []
      }
    }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    Object.assign(form, emptyForm())
    if (props.dialogType === 'edit' && props.tenantData) {
      Object.assign(form, props.tenantData)
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * 提交表单
   * 验证通过后调用接口保存数据
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      const params = {
        id: form.id,
        tenantCode: form.tenantCode,
        tenantName: form.tenantName,
        packageId: form.packageId,
        adminUsername: form.adminUsername,
        enableFlag: form.enableFlag,
        expireDate: form.expireDate || null,
        remark: form.remark
      }
      let res: Promise<boolean>
      if (props.dialogType === 'add') {
        res = createTenant(params)
      } else {
        res = updateTenant(params)
      }
      res.then((res) => {
        if (res) {
          ElMessage.success(message)
          emit('success')
          handleClose()
        }
      })
    } catch (error) {
      console.log('表单验证失败:', error)
    }
  }
</script>
