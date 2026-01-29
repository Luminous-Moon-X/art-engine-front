<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增规则' : '编辑规则'"
    width="50%"
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
      label-width="100px"
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
  import { createRule, updateRule } from '@/api/rule'
  import { RuleRowItem } from '@/types/rule'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import { getDict } from '@/utils/dict'
  import type { DictItem } from '@/types/dict'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    ruleData?: RuleRowItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    ruleData: undefined
  })

  const ruleValueTypeOptions = ref<DictItem[]>([])

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
    ruleName: [
      { required: true, message: '请输入规则名称', trigger: 'blur' },
      { min: 2, max: 40, message: '长度在 2 到 40 个字符', trigger: 'blur' }
    ],
    ruleCode: [
      { required: true, message: '请输入规则编码', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    ruleValue: [{ required: true, message: '请输入规则值', trigger: 'blur' }],
    ruleValueType: [{ required: true, message: '请选择规则值类型', trigger: 'change' }]
  })

  /**
   * 表单数据
   */
  const form = reactive<RuleRowItem>({
    id: undefined,
    ruleName: '',
    ruleCode: '',
    ruleValue: '',
    ruleValueType: 'text',
    remark: '',
    enableFlag: true
  })

  const formItems = computed<FormItem[]>(() => [
    {
      label: '规则编码',
      key: 'ruleCode',
      type: 'input',
      span: 12,
      props: {
        placeholder: '请输入规则编码'
      }
    },
    {
      label: '规则名称',
      key: 'ruleName',
      type: 'input',
      span: 12,
      props: {
        placeholder: '请输入规则名称'
      }
    },
    {
      label: '规则值类型',
      key: 'ruleValueType',
      type: 'select',
      span: 12,
      props: {
        placeholder: '请选择规则值类型',
        options: ruleValueTypeOptions.value.map((item) => ({
          label: item.dictLabel,
          value: item.dictValue
        }))
      }
    },
    {
      label: '是否启用',
      key: 'enableFlag',
      type: 'switch',
      span: 12
    },
    {
      label: '规则值',
      key: 'ruleValue',
      type: ruleValueInputType.value,
      span: 24,
      props: ruleValueInputProps.value
    },
    {
      label: '备注',
      key: 'remark',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        placeholder: '请输入备注'
      }
    }
  ])

  /**
   * 根据规则值类型动态切换输入框类型
   */
  const ruleValueInputType = computed<string>(() => {
    if (form.ruleValueType === 'text') {
      return 'input'
    } else if (form.ruleValueType === 'number') {
      return 'number'
    } else if (form.ruleValueType === 'boolean') {
      return 'switch'
    } else if (form.ruleValueType === 'json') {
      return 'input'
    }
    return 'input'
  })

  /**
   * 根据规则值类型动态切换输入框属性
   */
  const ruleValueInputProps = computed<Record<string, any>>(() => {
    if (form.ruleValueType === 'json') {
      return {
        placeholder: '请输入规则值',
        type: 'textarea'
      }
    }
    return {
      placeholder: '请输入规则值'
    }
  })

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        initForm()
        getDict('system_rule_value_type').then((res) => {
          ruleValueTypeOptions.value = res || []
        })
      }
    }
  )

  /**
   * 监听角色数据变化，更新表单
   */
  watch(
    () => props.ruleData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 监听规则值类型变化，清空规则值
   */
  watch(
    () => form.ruleValueType,
    (newVal) => {
      if (newVal) {
        form.ruleValue = ''
      }
    }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.ruleData) {
      Object.assign(form, props.ruleData)
    } else {
      Object.assign(form, {
        id: undefined,
        ruleName: '',
        ruleCode: '',
        ruleValue: '',
        ruleValueType: 'text',
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
        res = createRule(form)
      } else {
        res = updateRule(form)
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
