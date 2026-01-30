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
              />
            </ElTab-pane>
          </ElTabs>
        </ElCard>
      </div>
      <div class="flex flex-col flex-grow min-w-0">
        <ElCard class="tree-card art-card-xs flex flex-col h-full mt-0" shadow="never">
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

  defineOptions({ name: 'MenuPermission' })

  const activeTab = ref('role')
  const treeProps = {
    children: 'children',
    label: 'label'
  }

  // 角色树相关
  const roleTreeRef = ref()
  const roleTreeData = ref<Api.SystemManage.RoleOptionItem[]>([])
  const handleRoleNodeClick = (node: Api.SystemManage.RoleOptionItem) => {
    console.log(node)
  }

  // 部门树相关
  const deptTreeRef = ref()
  const deptTreeData = ref<DeptOptionItem[]>([])
  const handleDeptNodeClick = (node: DeptOptionItem) => {
    console.log(node)
  }

  // 用户树相关
  const userTreeRef = ref()
  const userTreeData = ref<DeptUserTreeItem[]>([])
  const handleUserNodeClick = (node: DeptUserTreeItem) => {
    console.log(node)
  }

  // 功能树相关
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
      menuTreeData.value = res || []
    })
  })

  const handleSave = () => {
    console.log('保存功能授权')
  }
</script>
