<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增字典项' : '编辑字典项'"
    width="35%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="字典项名称" prop="dictLabel">
        <ElInput v-model="form.dictLabel" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典项值" prop="dictValue">
        <ElInput v-model="form.dictValue" placeholder="请输入字典项值" />
      </ElFormItem>
      <ElFormItem label="排序号" prop="orderNum">
        <ElInputNumber v-model="form.orderNum" placeholder="请输入排序号" />
      </ElFormItem>
      <ElFormItem label="显示样式" prop="showStyle">
        <ElSelect v-model="form.showStyle" placeholder="请选择显示样式">
          <ElOption label="primary" value="primary" />
          <ElOption label="info" value="info" />
          <ElOption label="success" value="success" />
          <ElOption label="warning" value="warning" />
          <ElOption label="danger" value="danger" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { addDictValue, editDictValue } from '@/api/dict'
  import { DictValueRowItem } from '@/types/dict'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    dictData?: DictValueRowItem
    dictId: number
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    dictData: undefined,
    dictId: 0
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

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
    dictLabel: [
      { required: true, message: '请输入字典项名称', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    dictValue: [
      { required: true, message: '请输入字典项值', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ],
    orderNum: [{ required: true, message: '请输入排序号', trigger: 'change' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<DictValueRowItem>({
    id: null,
    dictId: props.dictId,
    dictLabel: '',
    dictValue: '',
    showStyle: 'info',
    orderNum: 0
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  /**
   * 监听角色数据变化，更新表单
   */
  watch(
    () => props.dictData,
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
    if (props.dialogType === 'edit' && props.dictData) {
      Object.assign(form, props.dictData)
    } else {
      Object.assign(form, {
        id: null,
        dictId: props.dictId,
        dictLabel: '',
        dictValue: '',
        showStyle: 'info',
        orderNum: 0
      })
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
        res = addDictValue(form)
      } else {
        res = editDictValue(form)
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
