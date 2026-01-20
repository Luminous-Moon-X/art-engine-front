<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="860px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="width > 640 ? 12 : 24"
      :gutter="20"
      label-width="100px"
      :show-reset="false"
      :show-submit="false"
    >
      <template #menuType>
        <ElRadioGroup v-model="form.menuType" :disabled="props.lockType">
          <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
          <ElRadioButton value="button" label="button">按钮</ElRadioButton>
        </ElRadioGroup>
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { ElIcon, ElTooltip } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { AppRouteRecord } from '@/types/router'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import ArtIconSelector from '@/components/core/base/art-icon-selector/index.vue'
  import { useWindowSize } from '@vueuse/core'
  import { type MenuRowItem } from '@/types/menu'
  import { fetchGetMenuById, addMenu, editMenu } from '@/api/menu'

  const { width } = useWindowSize()

  /**
   * 创建带 tooltip 的表单标签
   * @param label 标签文本
   * @param tooltip 提示文本
   * @returns 渲染函数
   */
  const createLabelTooltip = (label: string, tooltip: string) => {
    return () =>
      h('span', { class: 'flex items-center' }, [
        h('span', label),
        h(
          ElTooltip,
          {
            content: tooltip,
            placement: 'top'
          },
          () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled))
        )
      ])
  }

  interface Props {
    visible: boolean
    editData?: AppRouteRecord | any
    type?: 'menu' | 'button'
    lockType?: boolean
    parentId?: number
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'menu',
    lockType: false,
    parentId: -1
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const isEdit = computed(() => form.id !== null)

  const form = reactive<MenuRowItem & { menuType: 'menu' | 'button' }>({
    id: null,
    enableFlag: true,
    menuType: 'menu',
    menuName: '',
    routePath: '',
    permissionSign: '',
    componentPath: '',
    menuIcon: '',
    orderNum: 1,
    externalLink: '',
    activationPath: '',
    keepAlive: false,
    hideFlag: false,
    iframeFlag: false,
    showBadge: false,
    fixedTab: false,
    hideTab: false,
    fullScreen: false,
    parentId: -1,
    children: []
  })

  const rules = reactive<FormRules>({
    menuName: [
      { required: true, message: '请输入菜单名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    routePath: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    permissionSign: [{ required: true, message: '请输入权限标识', trigger: 'blur' }]
  })

  /**
   * 表单项配置
   */
  const formItems = computed<FormItem[]>(() => {
    const baseItems: FormItem[] = [{ label: '菜单类型', key: 'menuType', span: 24 }]

    // Switch 组件的 span：小屏幕 12，大屏幕 6
    const switchSpan = width.value < 640 ? 12 : 6

    if (form.menuType === 'menu') {
      return [
        ...baseItems,
        { label: '菜单名称', key: 'menuName', type: 'input', props: { placeholder: '菜单名称' } },
        {
          label: createLabelTooltip(
            '路由地址',
            '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'
          ),
          key: 'routePath',
          type: 'input',
          props: { placeholder: '如：/dashboard 或 console' }
        },
        {
          label: '权限标识',
          key: 'permissionSign',
          type: 'input',
          props: { placeholder: '如：User' }
        },
        {
          label: createLabelTooltip(
            '组件路径',
            '一级父级菜单：填写 /index/index\n具体页面：填写组件路径（如 /system/user）\n目录菜单：留空'
          ),
          key: 'componentPath',
          type: 'input',
          props: { placeholder: '如：/system/user 或留空' }
        },
        {
          label: '图标',
          key: 'menuIcon',
          render: ArtIconSelector,
          props: { placeholder: '如：ri:user-line' }
        },
        {
          label: '菜单排序',
          key: 'orderNum',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
        },
        {
          label: '外部链接',
          key: 'externalLink',
          type: 'input',
          props: { placeholder: '如：https://www.example.com' }
        },
        {
          label: createLabelTooltip(
            '激活路径',
            '用于详情页等隐藏菜单，指定高亮显示的父级菜单路径\n例如：用户详情页高亮显示"用户管理"菜单'
          ),
          key: 'activationPath',
          type: 'input',
          props: { placeholder: '如：/system/user' }
        },
        { label: '是否启用', key: 'enableFlag', type: 'switch', span: switchSpan },
        { label: '页面缓存', key: 'keepAlive', type: 'switch', span: switchSpan },
        { label: '隐藏菜单', key: 'hideFlag', type: 'switch', span: switchSpan },
        { label: '是否内嵌', key: 'iframeFlag', type: 'switch', span: switchSpan },
        { label: '显示徽章', key: 'showBadge', type: 'switch', span: switchSpan },
        { label: '固定标签', key: 'fixedTab', type: 'switch', span: switchSpan },
        { label: '隐藏标签', key: 'hideTab', type: 'switch', span: switchSpan },
        { label: '全屏页面', key: 'fullScreen', type: 'switch', span: switchSpan }
      ]
    } else {
      return [
        ...baseItems,
        {
          label: '权限名称',
          key: 'menuName',
          type: 'input',
          props: { placeholder: '如：新增、编辑、删除' }
        },
        {
          label: '权限标识',
          key: 'permissionSign',
          type: 'input',
          props: { placeholder: '如：add、edit、delete' }
        },
        {
          label: '权限排序',
          key: 'orderNum',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
        }
      ]
    }
  })

  const dialogTitle = computed(() => {
    const type = form.menuType === 'menu' ? '菜单' : '按钮'
    return isEdit.value ? `编辑${type}` : `新建${type}`
  })

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    formRef.value?.reset()
    form.enableFlag = true
    form.menuType = 'menu'
    form.orderNum = 1
  }

  /**
   * 加载表单数据（编辑模式）
   */
  const loadFormData = (): void => {
    if (!props.editData) return
    const id = props.editData.id
    fetchGetMenuById(id).then((res: MenuRowItem) => {
      Object.assign(form, res)
    })
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      let res: Promise<boolean>
      if (isEdit.value) {
        res = editMenu(form)
      } else {
        res = addMenu(form)
      }
      res.then((success) => {
        if (success) {
          ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`)
          handleCancel()
          emit('success')
        } else {
          ElMessage.error(`${isEdit.value ? '编辑' : '新增'}失败`)
        }
      })
    } catch {
      ElMessage.error('表单校验失败，请检查输入')
    }
  }

  /**
   * 取消操作
   */
  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  /**
   * 对话框关闭后的回调
   */
  const handleClosed = (): void => {
    resetForm()
  }

  /**
   * 监听对话框显示状态
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        resetForm()
        form.menuType = props.type
        form.parentId = props.parentId
        nextTick(() => {
          if (props.editData) {
            loadFormData()
          }
        })
      }
    }
  )

  /**
   * 监听菜单类型变化
   */
  watch(
    () => props.type,
    (newType) => {
      if (props.visible) {
        form.menuType = newType
      }
    }
  )
</script>
