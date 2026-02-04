<!-- 菜单权限管理页面 -->
<template>
  <div class="art-full-height">
    <div class="box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto">
      <div class="flex-shrink-0 w-80 h-full max-md:w-full max-md:h-auto max-md:mb-5">
        <ElCard class="tree-card art-card-xs flex flex-col h-full mt-0" shadow="never">
          <ElTabs v-model="activeTab">
            <ElTab-pane label="角色" name="role">
              <ElScrollbar>
                <ElTree
                  ref="roleTreeRef"
                  :data="roleTreeData"
                  :props="treeProps"
                  node-key="value"
                  default-expand-all
                  highlight-current
                  :expand-on-click-node="false"
                  @node-click="handleRoleNodeClick"
                  v-if="roleTreeVisible"
                />
              </ElScrollbar>
            </ElTab-pane>
            <ElTab-pane label="部门" name="dept">
              <ElTree
                ref="deptTreeRef"
                :data="deptTreeData"
                :props="treeProps"
                node-key="value"
                highlight-current
                :expand-on-click-node="false"
                @node-click="handleDeptNodeClick"
                v-if="deptTreeVisible"
              />
            </ElTab-pane>
            <ElTab-pane label="用户" name="user">
              <ElTree
                ref="userTreeRef"
                :data="userTreeData"
                :props="treeProps"
                node-key="value"
                highlight-current
                :expand-on-click-node="false"
                @node-click="handleUserNodeClick"
                v-if="userTreeVisible"
              />
            </ElTab-pane>
          </ElTabs>
        </ElCard>
      </div>
      <div class="flex flex-col flex-grow min-w-0">
        <ElCard
          class="tree-card art-card-xs flex flex-col h-full mt-0"
          shadow="never"
          v-loading="menuTreeLoading"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <b>功能授权</b>
              <ElButton v-ripple type="primary" @click="handleSave">保存</ElButton>
            </div>
          </template>
          <ElScrollbar>
            <ElTree
              ref="menuTreeRef"
              :data="menuTreeData"
              :props="treeProps"
              node-key="value"
              highlight-current
              show-checkbox
              :expand-on-click-node="false"
              v-if="menuTreeVisible"
            />
          </ElScrollbar>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { getDeptTreeNoTop } from '@/api/dept'
  import { fetchGetRoleSelect } from '@/api/role'
  import { DeptOptionItem } from '@/types/dept'
  import { MenuTreeItem } from '@/types/menu'
  import { getAllMenuTree } from '@/api/menu'
  import { DeptUserTreeItem } from '@/types/user'
  import { userTree } from '@/api/user'
  import { getMenuPermission, setPermission } from '@/api/permission'

  defineOptions({ name: 'MenuPermission' })

  const activeTab = ref('role')
  const treeProps = {
    children: 'children',
    label: 'label'
  }

  // 监听 activeTab 变化，重置当前节点键和菜单树可见性
  watch(activeTab, (newValue) => {
    currentNodeKey.value = undefined
    menuTreeVisible.value = false
    // 重置授权主体树选择状态
    if (newValue === 'role') {
      roleTreeVisible.value = true
      deptTreeVisible.value = false
      userTreeVisible.value = false
    } else if (newValue === 'dept') {
      deptTreeVisible.value = true
      roleTreeVisible.value = false
      userTreeVisible.value = false
    } else if (newValue === 'user') {
      userTreeVisible.value = true
      roleTreeVisible.value = false
      deptTreeVisible.value = false
    }
  })

  // 当前选中节点键
  const currentNodeKey = ref<number>()

  // 角色树相关
  const roleTreeRef = ref()
  const roleTreeVisible = ref(true)
  const roleTreeData = ref<Api.SystemManage.RoleOptionItem[]>([])
  const handleRoleNodeClick = (node: Api.SystemManage.RoleOptionItem) => {
    showMenuPermission('role', node.value)
  }

  // 部门树相关
  const deptTreeRef = ref()
  const deptTreeVisible = ref(false)
  const deptTreeData = ref<DeptOptionItem[]>([])
  const handleDeptNodeClick = (node: DeptOptionItem) => {
    showMenuPermission('dept', node.value)
  }

  // 用户树相关
  const userTreeRef = ref()
  const userTreeVisible = ref(false)
  const userTreeData = ref<DeptUserTreeItem[]>([])
  const handleUserNodeClick = (node: DeptUserTreeItem) => {
    showMenuPermission('user', node.value)
  }

  // 显示菜单权限
  const showMenuPermission = (type: string, id: number) => {
    currentNodeKey.value = id
    menuTreeVisible.value = true
    menuTreeLoading.value = true

    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 500))
    const request = getMenuPermission(type, id)

    Promise.all([request, minLoadingTime])
      .then(([res]) => {
        menuTreeRef.value.setCheckedKeys(res || [])
      })
      .finally(() => {
        menuTreeLoading.value = false
      })
  }

  // 功能树相关
  const menuTreeVisible = ref(false)
  const menuTreeLoading = ref(false)
  const menuTreeRef = ref()
  const menuTreeData = ref<MenuTreeItem[]>([])

  // 初始化数据
  onMounted(() => {
    // 初始化角色树
    fetchGetRoleSelect().then((res) => {
      roleTreeData.value = res || []
    })

    // 初始化部门树
    getDeptTreeNoTop().then((res) => {
      deptTreeData.value = res || []
    })

    // 初始化用户树
    userTree().then((res) => {
      userTreeData.value = res || []
    })

    // 初始化功能树
    getAllMenuTree().then((res) => {
      const menuList = res || []
      const index = menuList.findIndex((item: any) => item.label === '首页')
      if (index !== -1) {
        menuList.splice(index, 1)
      }
      menuTreeData.value = menuList
    })
  })

  // 保存授权
  const handleSave = () => {
    if (!currentNodeKey.value) {
      ElMessage.warning('请选择一个授权主体！')
      return
    }
    const checkedKeys = menuTreeRef.value.getCheckedKeys()
    setPermission(activeTab.value, currentNodeKey.value, checkedKeys).then((res) => {
      if (res) {
        ElMessage.success('授权成功！')
      } else {
        ElMessage.error('授权失败！')
      }
    })
  }
</script>
