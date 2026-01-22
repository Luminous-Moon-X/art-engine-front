<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增字典' : '编辑字典'"
    width="35%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem label="字典名称" prop="dictName">
        <ElInput v-model="form.dictName" placeholder="请输入字典名称" />
      </ElFormItem>
      <ElFormItem label="字典编码" prop="dictCode">
        <ElInput
          v-model="form.dictCode"
          placeholder="请输入字典编码"
          :disabled="dialogType === 'edit'"
        />
      </ElFormItem>
      <ElFormItem label="字典类型" prop="dictType">
        <ElSelect v-model="form.dictType" placeholder="请选择字典类型">
          <ElOption label="普通字典" value="normal" />
          <ElOption label="系统字典" value="system" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="是否启用">
        <ElSwitch v-model="form.enableFlag" />
      </ElFormItem>
      <ElFormItem label="描述" prop="remark">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入字典描述" />
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
  import { addDict, editDict } from '@/api/dict'
  import { DictRowItem } from '@/types/dict'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    dictData?: DictRowItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    dictData: undefined
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
    dictName: [
      { required: true, message: '请输入字典名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    dictCode: [
      { required: true, message: '请输入字典编码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    dictType: [{ required: true, message: '请选择字典类型', trigger: 'change' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<DictRowItem>({
    id: null,
    dictName: '',
    dictCode: '',
    dictType: '',
    remark: '',
    enableFlag: true
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
        dictName: '',
        dictCode: '',
        dictType: '',
        remark: '',
        enableFlag: true
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
        res = addDict(form)
      } else {
        res = editDict(form)
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
