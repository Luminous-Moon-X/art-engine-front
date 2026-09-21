<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增部门' : '编辑部门'"
    width="55%"
    align-center
    @close="handleClose"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElRow>
        <ElCol :span="24">
          <ElFormItem label="上级部门" prop="parentId">
            <ElTreeSelect
              v-model="form.parentId"
              :data="allDeptList"
              :render-after-expand="false"
              check-strictly
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="部门名称" prop="deptName">
            <ElInput v-model="form.deptName" placeholder="请输入部门名称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="排序号" prop="orderNum">
            <ElInputNumber v-model="form.orderNum" placeholder="请输入排序号" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="负责人" prop="chargePerson">
            <ElInput v-model="form.chargePerson" placeholder="请输入负责人" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="电话" prop="chargePersonTel">
            <ElInput v-model="form.chargePersonTel" placeholder="请输入负责人电话" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="邮箱" prop="chargePersonEmail">
            <ElInput v-model="form.chargePersonEmail" placeholder="请输入负责人邮箱" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enableFlag">
            <ElSwitch v-model="form.enableFlag" />
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
  import { addDept, editDept, fetchGetAllDept } from '@/api/dept'
  import { DeptRowItem, DeptOptionItem } from '@/types/dept'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    deptData?: DeptRowItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    deptData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  const allDeptList = ref<DeptOptionItem[]>([])

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
    deptName: [
      { required: true, message: '请输入部门名称', trigger: 'blur' },
      { min: 2, max: 40, message: '长度在 2 到 40 个字符', trigger: 'blur' }
    ],
    orderNum: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
    parentId: [{ required: true, message: '请选择上级部门', trigger: 'blur' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<DeptRowItem>({
    id: undefined,
    deptName: '',
    orderNum: 0,
    chargePerson: '',
    chargePersonTel: '',
    chargePersonEmail: '',
    parentId: -1,
    enableFlag: true,
    children: []
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal) {
        initForm()
        await fetchGetAllDept().then((res) => (allDeptList.value = res))
      }
    }
  )

  /**
   * 监听部门数据变化，更新表单
   */
  watch(
    () => props.deptData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.deptData) {
      Object.assign(form, props.deptData)
    } else {
      Object.assign(form, {
        id: undefined,
        deptName: '',
        orderNum: 0,
        chargePerson: '',
        chargePersonTel: '',
        chargePersonEmail: '',
        parentId: -1,
        enableFlag: true,
        children: []
      })
      if (props.deptData) {
        form.parentId = props.deptData.id ?? null
      }
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
      // 调用新增/编辑接口
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      let res: Promise<boolean>
      if (props.dialogType === 'add') {
        res = addDept(form)
      } else {
        res = editDept(form)
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
