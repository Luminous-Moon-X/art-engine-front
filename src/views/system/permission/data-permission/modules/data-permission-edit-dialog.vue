<!-- 数据权限新增/编辑弹窗 -->
<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增数据权限' : '编辑数据权限'"
    width="720px"
    align-center
    destroy-on-close
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="24"
      :gutter="20"
      label-width="140px"
      :show-reset="false"
      :show-submit="false"
    >
      <!-- 授权客体：多选，左侧表名 + 右侧表备注 -->
      <template #permissionObject>
        <ElSelect
          v-model="form.permissionObject"
          multiple
          filterable
          clearable
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          placeholder="请选择授权客体（可多选，不选表示对所有表生效）"
        >
          <ElOption
            v-for="item in tableOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="flex items-center justify-between gap-4 w-full">
              <span>{{ item.label }}</span>
              <span class="text-xs text-gray-400">{{ item.comment || '-' }}</span>
            </div>
          </ElOption>
        </ElSelect>
      </template>

      <!-- 权限字段：单选一个表时为字段下拉（左字段名 + 右字段备注），多选表时为手动输入 -->
      <template #columnCondition>
        <ElSelect
          v-if="isSingleTable"
          v-model="form.columnCondition"
          filterable
          clearable
          placeholder="请选择权限字段"
        >
          <ElOption
            v-for="item in columnOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="flex items-center justify-between gap-4 w-full">
              <span>{{ item.label }}</span>
              <span class="text-xs text-gray-400">{{ item.comment || '-' }}</span>
            </div>
          </ElOption>
        </ElSelect>
        <ElInput v-else v-model="form.columnCondition" clearable placeholder="请手动输入字段名" />
      </template>
    </ArtForm>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import {
    addDataPermission,
    editDataPermission,
    fetchPermissionTableColumnList,
    fetchPermissionTableList
  } from '@/api/data-permission'
  import {
    DataPermissionForm,
    DataPermissionOptionItem,
    DataPermissionRowItem,
    DataPermissionSubmitParams
  } from '@/types/data-permission'
  import { getDeptTreeNoTop } from '@/api/dept'
  import { getDict } from '@/utils/dict'
  import { loadSubjectOptions } from './subject-options'
  import type { DeptOptionItem } from '@/types/dept'
  import type { DictItem } from '@/types/dict'

  defineOptions({ name: 'DataPermissionEditDialog' })

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    permissionData?: DataPermissionRowItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  /** 授权范围字典值（与 PermissionRow.permissionScope 约定一致：4-自定义部门范围，5-自定义字段） */
  const PERMISSION_SCOPE_CUSTOM_DEPT = '4'
  const PERMISSION_SCOPE_CUSTOM_COLUMN = '5'

  /** 字段关系字典值：无需填写字段值的两种关系（与 PermissionRow.columnRelation 约定一致） */
  const COLUMN_RELATION_NULL = 'null'
  const COLUMN_RELATION_NOT_NULL = 'not_null'

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    permissionData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<InstanceType<typeof ArtForm>>()
  const submitting = ref(false)

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 表单初始化标记
   * 初始化期间不触发动态字段的联动清空逻辑
   */
  let initializing = false

  /**
   * 下拉框选项
   * 授权主体类型、授权范围、字段关系取自数据字典，其余取自对应业务接口
   */
  const subjectTypeOptions = ref<DictItem[]>([])
  const permissionSubjectOptions = ref<{ label: string; value: string }[]>([])
  const permissionScopeOptions = ref<DictItem[]>([])
  const columnRelationOptions = ref<DictItem[]>([])

  /** 授权客体（数据库表）选项 */
  const tableOptions = ref<DataPermissionOptionItem[]>([])
  /** 权限字段选项（授权客体仅选择一个表时可用） */
  const columnOptions = ref<DataPermissionOptionItem[]>([])
  /** 自定义部门权限（部门树）选项 */
  const deptTreeOptions = ref<DeptOptionItem[]>([])

  /**
   * 字典项转下拉选项
   */
  const toSelectOptions = (list: DictItem[]) =>
    list.map((item) => ({ label: item.dictLabel, value: item.dictValue }))

  /**
   * 表单数据
   */
  const form = reactive<DataPermissionForm>({
    id: undefined,
    subjectType: '',
    permissionSubject: '',
    permissionObject: [],
    permissionScope: '',
    customDeptScope: [],
    columnCondition: '',
    columnRelation: '',
    columnValue: '',
    enableFlag: true
  })

  /**
   * 授权范围是否为自定义部门范围
   */
  const isCustomDeptScope = computed(() => form.permissionScope === PERMISSION_SCOPE_CUSTOM_DEPT)

  /**
   * 授权范围是否为自定义字段
   */
  const isCustomColumnScope = computed(
    () => form.permissionScope === PERMISSION_SCOPE_CUSTOM_COLUMN
  )

  /**
   * 授权客体是否只选择了一个表
   */
  const isSingleTable = computed(() => form.permissionObject.length === 1)

  /**
   * 是否需要填写字段值
   * 字段关系已选择，且不是「为空」「不为空」时才需要
   */
  const needColumnValue = computed(() => {
    const relation = form.columnRelation
    return !!relation && relation !== COLUMN_RELATION_NULL && relation !== COLUMN_RELATION_NOT_NULL
  })

  /**
   * 表单验证规则
   */
  const rules = reactive<FormRules>({
    subjectType: [{ required: true, message: '请选择授权主体类型', trigger: 'change' }],
    permissionSubject: [{ required: true, message: '请选择授权主体', trigger: 'change' }],
    permissionScope: [{ required: true, message: '请选择授权范围', trigger: 'change' }],
    customDeptScope: [{ required: true, message: '请选择自定义部门权限', trigger: 'change' }],
    columnCondition: [
      { required: true, message: '请选择或输入权限字段', trigger: ['blur', 'change'] }
    ],
    columnRelation: [{ required: true, message: '请选择字段关系', trigger: 'change' }],
    columnValue: [{ required: true, message: '请输入字段值', trigger: 'blur' }]
  })

  /**
   * 表单项配置
   */
  const formItems = computed<FormItem[]>(() => [
    {
      label: '授权主体类型',
      key: 'subjectType',
      type: 'select',
      props: {
        placeholder: '请选择授权主体类型',
        clearable: true,
        options: toSelectOptions(subjectTypeOptions.value)
      }
    },
    {
      label: '授权主体',
      key: 'permissionSubject',
      type: 'select',
      props: {
        placeholder: '请先选择授权主体类型',
        clearable: true,
        filterable: true,
        options: permissionSubjectOptions.value
      }
    },
    {
      label: '授权客体',
      key: 'permissionObject',
      type: 'select',
      props: {
        placeholder: '请选择授权客体（可多选，不选表示对所有表生效）'
      }
    },
    {
      label: '授权范围',
      key: 'permissionScope',
      type: 'select',
      props: {
        placeholder: '请选择授权范围',
        clearable: true,
        options: toSelectOptions(permissionScopeOptions.value)
      }
    },
    {
      label: '自定义部门权限',
      key: 'customDeptScope',
      type: 'treeselect',
      hidden: !isCustomDeptScope.value,
      props: {
        data: deptTreeOptions.value,
        props: { label: 'label', children: 'children' },
        multiple: true,
        showCheckbox: true,
        checkStrictly: true,
        filterable: true,
        clearable: true,
        collapseTags: true,
        collapseTagsTooltip: true,
        maxCollapseTags: 2,
        placeholder: '请选择部门（可多选）'
      }
    },
    {
      label: '权限字段',
      key: 'columnCondition',
      type: isSingleTable.value ? 'select' : 'input',
      hidden: !isCustomColumnScope.value,
      props: {
        placeholder: isSingleTable.value ? '请选择权限字段' : '请手动输入字段名',
        clearable: true,
        filterable: true
      }
    },
    {
      label: '字段关系',
      key: 'columnRelation',
      type: 'select',
      hidden: !isCustomColumnScope.value,
      props: {
        placeholder: '请选择字段关系',
        clearable: true,
        options: toSelectOptions(columnRelationOptions.value)
      }
    },
    {
      label: '字段值',
      key: 'columnValue',
      type: 'input',
      hidden: !isCustomColumnScope.value || !needColumnValue.value,
      props: {
        placeholder: '请输入字段值',
        clearable: true
      }
    }
  ])

  /**
   * 加载下拉选项
   * 失败时保持空列表并打印错误，避免静默无数据
   */
  const loadOptions = <T,>(promise: Promise<T[]>, apply: (list: T[]) => void) => {
    promise
      .then((res) => apply(res || []))
      .catch((err) => {
        console.error('[数据权限] 下拉选项加载失败：', err)
      })
  }

  /**
   * 加载授权主体选项
   * 角色 -> 角色列表，部门 -> 部门列表，用户 -> 用户列表
   */
  const loadPermissionSubjectOptions = (subjectType: string) => {
    loadOptions(loadSubjectOptions(subjectType), (list) => {
      permissionSubjectOptions.value = list
    })
  }

  /**
   * 加载权限字段选项
   * 仅在授权客体只选择一个表时加载该表的字段列表
   */
  const loadColumnOptions = () => {
    if (form.permissionObject.length !== 1) {
      columnOptions.value = []
      return
    }
    loadOptions(fetchPermissionTableColumnList(form.permissionObject[0]), (list) => {
      columnOptions.value = list.map((item) => ({
        label: item.columnName,
        value: item.columnName,
        comment: item.columnComment
      }))
    })
  }

  /**
   * 逗号字符串转数组
   */
  const toArray = (value?: string): string[] =>
    value
      ? value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : []

  /**
   * 初始化字典与业务选项
   */
  onMounted(() => {
    loadOptions(getDict('system_permission_subject_type'), (list) => {
      subjectTypeOptions.value = list
    })
    loadOptions(getDict('system_permission_scope'), (list) => {
      permissionScopeOptions.value = list
    })
    loadOptions(getDict('system_permission_column_relation'), (list) => {
      columnRelationOptions.value = list
    })
    loadOptions(getDeptTreeNoTop(), (list) => {
      deptTreeOptions.value = list
    })
    loadOptions(fetchPermissionTableList(), (list) => {
      tableOptions.value = list.map((item) => ({
        label: item.tableName,
        value: item.tableName,
        comment: item.tableComment
      }))
    })
  })

  /**
   * 授权主体类型变化：重新加载授权主体选项并清空已选授权主体
   */
  watch(
    () => form.subjectType,
    (value) => {
      if (initializing) return
      form.permissionSubject = ''
      loadPermissionSubjectOptions(value)
    },
    { flush: 'sync' }
  )

  /**
   * 授权范围变化：清空不再展示的动态字段值
   */
  watch(
    () => form.permissionScope,
    (value) => {
      if (initializing) return
      if (value !== PERMISSION_SCOPE_CUSTOM_DEPT) {
        form.customDeptScope = []
      }
      if (value !== PERMISSION_SCOPE_CUSTOM_COLUMN) {
        form.columnCondition = ''
        form.columnRelation = ''
        form.columnValue = ''
      }
    },
    { flush: 'sync' }
  )

  /**
   * 授权客体变化：权限字段的可选项随之变化，清空已选权限字段
   */
  watch(
    () => form.permissionObject,
    () => {
      if (initializing) return
      form.columnCondition = ''
      loadColumnOptions()
    },
    { deep: true, flush: 'sync' }
  )

  /**
   * 字段关系变化：字段值不再展示时清空字段值
   */
  watch(
    () => form.columnRelation,
    () => {
      if (initializing) return
      if (!needColumnValue.value) {
        form.columnValue = ''
      }
    },
    { flush: 'sync' }
  )

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    initializing = true
    if (props.dialogType === 'edit' && props.permissionData) {
      Object.assign(form, {
        id: props.permissionData.id,
        subjectType: props.permissionData.subjectType || '',
        permissionSubject: props.permissionData.permissionSubject || '',
        permissionObject: toArray(props.permissionData.permissionObject),
        permissionScope: props.permissionData.permissionScope || '',
        customDeptScope: toArray(props.permissionData.customDeptScope).map((item) => Number(item)),
        columnCondition: props.permissionData.columnCondition || '',
        columnRelation: props.permissionData.columnRelation || '',
        columnValue: props.permissionData.columnValue || '',
        enableFlag: props.permissionData.enableFlag ?? true
      })
    } else {
      Object.assign(form, {
        id: undefined,
        subjectType: '',
        permissionSubject: '',
        permissionObject: [],
        permissionScope: '',
        customDeptScope: [],
        columnCondition: '',
        columnRelation: '',
        columnValue: '',
        enableFlag: true
      })
    }
    initializing = false
    // 按当前表单值加载联动数据
    loadPermissionSubjectOptions(form.subjectType)
    loadColumnOptions()
  }

  /**
   * 监听弹窗打开，初始化表单数据
   */
  watch(
    () => [props.modelValue, props.permissionData],
    () => {
      if (props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
    } catch {
      return
    }

    submitting.value = true
    const isAdd = props.dialogType === 'add'
    const params: DataPermissionSubmitParams = {
      ...form,
      permissionObject: form.permissionObject.join(','),
      customDeptScope: form.customDeptScope.join(',')
    }
    const request = isAdd ? addDataPermission(params) : editDataPermission(params)

    request
      .then((res) => {
        if (res) {
          ElMessage.success(isAdd ? '新增成功' : '修改成功')
          emit('success')
          visible.value = false
        }
      })
      .finally(() => {
        submitting.value = false
      })
  }
</script>
