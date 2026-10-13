<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增流程定义' : '编辑流程定义'"
    width="60%"
    align-center
    @close="handleClose"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="24"
      :gutter="20"
      label-width="110px"
      :show-reset="false"
      :show-submit="false"
    />
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { createWorkflowDefinition, updateWorkflowDefinition } from '@/api/workflow'
  import { WorkflowDefinitionRowItem } from '@/types/workflow'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    definitionData?: WorkflowDefinitionRowItem
    /** 流程类别候选值（来源于已有流程定义） */
    categoryOptions?: string[]
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    definitionData: undefined,
    categoryOptions: () => []
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
    flowCode: [
      { required: true, message: '请输入流程编码', trigger: 'blur' },
      { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' },
      {
        pattern: /^[A-Za-z0-9_-]+$/,
        message: '仅支持字母、数字、下划线和中划线',
        trigger: 'blur'
      }
    ],
    flowName: [
      { required: true, message: '请输入流程名称', trigger: 'blur' },
      { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' }
    ],
    modelValue: [{ required: true, message: '请选择设计器模型', trigger: 'change' }]
  })

  /** 设计器模型选项 */
  const modelOptions = [
    { label: '经典模型（CLASSICS）', value: 'CLASSICS' },
    { label: '仿钉钉模型（MIMIC）', value: 'MIMIC' }
  ]

  /** 审批表单是否自定义 */
  const formCustomOptions = [
    { label: '系统表单（N）', value: 'N' },
    { label: '自定义表单（Y）', value: 'Y' }
  ]

  /**
   * 表单数据
   */
  const form = reactive<WorkflowDefinitionRowItem>({
    id: undefined,
    flowCode: '',
    flowName: '',
    modelValue: 'CLASSICS',
    category: '',
    formCustom: 'N',
    formPath: '',
    listenerType: '',
    listenerPath: '',
    ext: ''
  })

  const formItems = computed<FormItem[]>(() => [
    {
      label: '流程编码',
      key: 'flowCode',
      type: 'input',
      span: 12,
      props: {
        placeholder: '请输入流程编码，如 leave_apply',
        disabled: props.dialogType === 'edit'
      }
    },
    {
      label: '流程名称',
      key: 'flowName',
      type: 'input',
      span: 12,
      props: {
        placeholder: '请输入流程名称，如 请假申请'
      }
    },
    {
      label: '设计器模型',
      key: 'modelValue',
      type: 'select',
      span: 12,
      props: {
        placeholder: '请选择设计器模型',
        options: modelOptions
      }
    },
    {
      label: '流程类别',
      key: 'category',
      type: 'select',
      span: 12,
      props: {
        placeholder: '请选择或输入流程类别',
        clearable: true,
        filterable: true,
        allowCreate: true,
        defaultFirst: false,
        options: props.categoryOptions.map((item) => ({ label: item, value: item }))
      }
    },
    {
      label: '表单类型',
      key: 'formCustom',
      type: 'select',
      span: 12,
      props: {
        placeholder: '请选择审批表单类型',
        options: formCustomOptions
      }
    },
    {
      label: '表单路径',
      key: 'formPath',
      type: 'input',
      span: 12,
      props: {
        placeholder: '自定义表单时填写，如 /workflow/form/leave'
      }
    },
    {
      label: '监听器类型',
      key: 'listenerType',
      type: 'input',
      span: 12,
      props: {
        placeholder: '请输入监听器类型（可留空）'
      }
    },
    {
      label: '监听器路径',
      key: 'listenerPath',
      type: 'input',
      span: 12,
      props: {
        placeholder: '请输入监听器路径（可留空）'
      }
    },
    {
      label: '扩展字段',
      key: 'ext',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 3,
        placeholder: '预留给业务系统使用的扩展字段（可留空）'
      }
    }
  ])

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        initForm()
      }
    }
  )

  /**
   * 监听流程定义数据变化，更新表单
   */
  watch(
    () => props.definitionData,
    () => {
      if (props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.definitionData) {
      Object.assign(form, {
        id: props.definitionData.id,
        flowCode: props.definitionData.flowCode,
        flowName: props.definitionData.flowName,
        modelValue: props.definitionData.modelValue || 'CLASSICS',
        category: props.definitionData.category || '',
        formCustom: props.definitionData.formCustom || 'N',
        formPath: props.definitionData.formPath || '',
        listenerType: props.definitionData.listenerType || '',
        listenerPath: props.definitionData.listenerPath || '',
        ext: props.definitionData.ext || ''
      })
    } else {
      Object.assign(form, {
        id: undefined,
        flowCode: '',
        flowName: '',
        modelValue: 'CLASSICS',
        category: '',
        formCustom: 'N',
        formPath: '',
        listenerType: '',
        listenerPath: '',
        ext: ''
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
      const message = props.dialogType === 'add' ? '新增成功' : '修改成功'
      const res =
        props.dialogType === 'add'
          ? await createWorkflowDefinition(form)
          : await updateWorkflowDefinition(form)
      if (res) {
        ElMessage.success(message)
        emit('success')
        handleClose()
      }
    } catch (error) {
      console.log('表单验证失败:', error)
    }
  }
</script>
