<!-- 侧边栏底部租户切换器（仅超级管理员且多租户启用时显示） -->
<template>
  <div v-if="visible" class="art-tenant-switcher" :class="{ 'is-collapsed': isCollapsed }">
    <ElDropdown trigger="click" @command="handleSwitch">
      <div class="switcher-trigger" :style="{ color: getMenuTheme.textColor }">
        <ArtSvgIcon icon="ri:building-2-line" class="switcher-icon" />
        <span v-if="!isCollapsed" class="switcher-name">
          <span class="switcher-label">租户：</span>{{ currentTenantName }}
        </span>
        <ArtSvgIcon v-if="!isCollapsed" icon="ri:arrow-down-s-line" class="switcher-arrow" />
      </div>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            v-for="item in tenantList"
            :key="item.id"
            :command="item.id"
            :disabled="item.id === currentTenantId"
          >
            {{ item.tenantName }}
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { useSettingStore } from '@/store/modules/setting'
  import { fetchTenantList } from '@/api/tenant'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ArtTenantSwitcher' })

  const userStore = useUserStore()
  const settingStore = useSettingStore()
  const { menuOpen, getMenuTheme } = storeToRefs(settingStore)

  const tenantList = ref<Api.Tenant.TenantOptionItem[]>([])

  // 仅超级管理员展示，且多租户启用
  const visible = computed(
    () =>
      userStore.isLogin && userStore.getUserInfo.userType === 'superadmin' && userStore.tenantEnable
  )
  const isCollapsed = computed(() => !menuOpen.value)
  const currentTenantId = computed(() => userStore.currentTenant.tenantId)
  const currentTenantName = computed(() => userStore.currentTenant.tenantName || '-')

  // 挂载时刷新多租户开关与租户列表
  onMounted(async () => {
    await userStore.loadTenantConfig()
    if (!visible.value) return
    const list = await fetchTenantList()
    tenantList.value = list || []
  })

  // 切换租户
  const handleSwitch = async (tenantId: number) => {
    if (tenantId === currentTenantId.value) return
    const ok = await userStore.switchTenant(tenantId)
    if (ok) {
      ElMessage.success('租户切换成功')
    }
  }
</script>

<style scoped lang="scss">
  .art-tenant-switcher {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 5;
    box-sizing: border-box;
    width: 100%;
    padding: 8px 10px;
    cursor: pointer;
    border-top: 1px solid rgb(255 255 255 / 10%);
    transition: all 0.25s;

    .switcher-trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;

      .switcher-icon {
        flex-shrink: 0;
        font-size: 18px;
      }

      .switcher-name {
        flex: 1;
        overflow: hidden;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;

        .switcher-label {
          opacity: 0.75;
        }
      }

      .switcher-arrow {
        flex-shrink: 0;
        font-size: 14px;
      }
    }

    &.is-collapsed {
      display: flex;
      justify-content: center;
      padding: 10px 0;

      .switcher-trigger {
        .switcher-icon {
          font-size: 20px;
        }
      }
    }
  }
</style>
