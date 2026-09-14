<!-- 租户套餐编辑弹窗（勾选系统菜单保存为套餐） -->
<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增套餐' : '编辑套餐'"
    width="620px"
    align-center
    @close="handleClose"
    destroy-on-close
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="套餐名称" prop="packageName">
            <ElInput v-model="form.packageName" placeholder="请输入套餐名称" />
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
          <ElFormItem label="选择菜单">
            <div class="package-tree-panel">
              <!-- 顶栏：已选数量 + 操作按钮 -->
              <div class="package-tree-toolbar">
                <span class="package-tree-count">
                  已选 <b>{{ checkedCount }}</b> 项
                </span>
                <div class="package-tree-actions">
                  <ElButton link type="primary" size="small" @click="toggleExpandAll">
                    {{ isExpandAll ? '全部收起' : '全部展开' }}
                  </ElButton>
                  <ElButton
                    link
                    type="primary"
                    size="small"
                    :disabled="!menuTree.length"
                    class="package-tree-action"
                    @click="toggleSelectAll"
                  >
                    {{ isSelectAll ? '取消全选' : '全部选择' }}
                  </ElButton>
                </div>
              </div>
              <!-- 菜单树 -->
              <ElScrollbar height="320px" wrap-style="overflow-x: auto;">
                <ElTree
                  ref="treeRef"
                  :data="menuTree"
                  show-checkbox
                  node-key="value"
                  :default-expand-all="isExpandAll"
                  :props="{ children: 'children', label: 'label' }"
                  @check="handleTreeCheck"
                />
              </ElScrollbar>
              <!-- 底部提示 -->
              <div class="package-tree-tip">
                <ArtSvgIcon icon="ri:information-line" style="font-size: 14px" />
                <span>不勾选任何菜单表示该套餐不限制菜单范围</span>
              </div>
            </div>
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
  import { getAllMenuTree } from '@/api/menu'
  import {
    createTenantPackage,
    updateTenantPackage,
    fetchTenantPackageById
  } from '@/api/tenant-package'

  type TenantPackageListItem = Api.Tenant.TenantPackageListItem

  interface MenuTreeNode {
    label: string
    value?: string | number | null
    children?: MenuTreeNode[]
    disabled?: boolean
  }

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    packageData?: TenantPackageListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    packageData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const treeRef = ref()
  const menuTree = ref<MenuTreeNode[]>([])
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  // 已勾选菜单数量（全选 + 半选，与保存口径一致）
  const checkedCount = ref(0)

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
    packageName: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }]
  })

  const emptyForm = () => ({
    id: undefined,
    packageName: '',
    enableFlag: 1,
    remark: '',
    permissionSigns: [] as string[]
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
        // 加载系统菜单树
        const res = (await getAllMenuTree()) as unknown as MenuTreeNode[]
        menuTree.value = (res || []).filter((item) => item && item.value != null)
        // 编辑时回显套餐已勾选的菜单
        if (props.dialogType === 'edit' && props.packageData) {
          loadPackageSigns(props.packageData.id)
        }
      }
    }
  )

  /**
   * 加载套餐已勾选的菜单权限标识并回显
   */
  const loadPackageSigns = async (id: number) => {
    const detail = await fetchTenantPackageById(id)
    if (!detail) return
    form.permissionSigns = detail.permissionSigns || []
    const validKeys = (detail.permissionSigns || []).filter((sign) => sign && sign.trim())
    treeRef.value?.setCheckedKeys(validKeys)
    checkedCount.value = validKeys.length
  }

  /**
   * 初始化表单数据
   * 根据弹窗类型填充表单或重置表单
   */
  const initForm = () => {
    Object.assign(form, emptyForm())
    checkedCount.value = 0
    isExpandAll.value = true
    isSelectAll.value = false
    if (props.dialogType === 'edit' && props.packageData) {
      form.id = props.packageData.id
      form.packageName = props.packageData.packageName
      form.enableFlag = props.packageData.enableFlag
      form.remark = props.packageData.remark
    }
  }

  /**
   * 关闭弹窗并重置表单
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
    treeRef.value?.setCheckedKeys([])
  }

  /**
   * 递归获取所有节点 key
   */
  const getAllNodeKeys = (nodes: MenuTreeNode[]): string[] => {
    const keys: string[] = []
    const traverse = (nodeList: MenuTreeNode[]): void => {
      nodeList.forEach((node) => {
        if (node.value) keys.push(String(node.value))
        if (node.children?.length) traverse(node.children)
      })
    }
    traverse(nodes)
    return keys
  }

  /**
   * 切换全部展开/收起状态
   */
  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return
    Object.values(tree.store.nodesMap).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })
    isExpandAll.value = !isExpandAll.value
  }

  /**
   * 切换全选/取消全选状态
   */
  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return
    if (!isSelectAll.value) {
      tree.setCheckedKeys(getAllNodeKeys(menuTree.value))
    } else {
      tree.setCheckedKeys([])
    }
    isSelectAll.value = !isSelectAll.value
    updateCheckedCount()
  }

  /**
   * 树节点选中状态变化时同步全选按钮状态与已选数量
   */
  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return
    const allKeys = getAllNodeKeys(menuTree.value)
    isSelectAll.value = tree.getCheckedKeys().length === allKeys.length && allKeys.length > 0
    updateCheckedCount()
  }

  /**
   * 更新已选数量（仅全选节点，与保存口径一致）
   */
  const updateCheckedCount = () => {
    const tree = treeRef.value
    if (!tree) return
    checkedCount.value = tree.getCheckedKeys().length
  }

  /**
   * 收集选中的菜单权限标识（仅全选节点）
   *
   * 说明：半选父节点（仅部分子节点被勾选）不保存——父菜单因存在范围内子菜单
   * 会被后端菜单范围逻辑自动保留，保存/回显口径一致，避免级联放大。
   */
  const collectPermissionSigns = (): string[] => {
    const tree = treeRef.value
    if (!tree) return []
    const signs = tree.getCheckedKeys() as string[]
    return signs.filter((sign) => sign && sign.trim())
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
        packageName: form.packageName,
        enableFlag: form.enableFlag,
        remark: form.remark,
        permissionSigns: collectPermissionSigns()
      }
      let res: Promise<boolean>
      if (props.dialogType === 'add') {
        res = createTenantPackage(params)
      } else {
        res = updateTenantPackage(params)
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

<style scoped lang="scss">
  /* 菜单选择面板：顶栏 + 树 + 底部提示 一体边框，风格与表单区统一 */
  .package-tree-panel {
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    border: 1px solid var(--art-card-border);
    border-radius: 6px;

    /* 顶栏：已选数量 + 操作按钮 */
    .package-tree-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      height: 34px;
      padding: 0 10px;
      border-bottom: 1px solid var(--art-card-border);

      .package-tree-count {
        font-size: 12px;
        color: var(--art-gray-500);

        b {
          margin: 0 2px;
          font-size: 14px;
          color: var(--theme-color, var(--el-color-primary));
        }
      }

      .package-tree-actions {
        display: flex;
        align-items: center;

        .package-tree-action {
          margin-left: 4px;
        }
      }
    }

    /* 树区域：节点文字不换行，横向溢出由滚动条承接 */
    :deep(.el-tree) {
      font-size: 13px;

      .el-tree-node__label {
        white-space: nowrap;
      }
    }

    /* 底部提示 */
    .package-tree-tip {
      display: flex;
      align-items: center;
      gap: 4px;
      box-sizing: border-box;
      padding: 6px 10px;
      font-size: 12px;
      color: var(--art-gray-500);
      border-top: 1px solid var(--art-card-border);
    }
  }
</style>
