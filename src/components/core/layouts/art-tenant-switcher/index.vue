<!-- 顶栏租户切换器（仅超级管理员且多租户启用时显示） -->
<template>
  <div v-if="visible" class="art-tenant-switcher">
    <ElDropdown trigger="click" @command="handleSwitch">
      <div class="switcher-trigger" :title="currentTenantName">
        <ArtSvgIcon icon="ri:building-2-line" class="switcher-icon" />
        <span class="switcher-name">
          <span class="switcher-label">{{ $t('topBar.tenant.label') }}：</span>
          <span class="switcher-value">{{ currentTenantName }}</span>
        </span>
        <ArtSvgIcon icon="ri:arrow-down-s-line" class="switcher-arrow" />
      </div>
      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            v-for="item in tenantList"
            :key="item.id"
            :command="item.id"
            :disabled="item.id === currentTenantId"
          >
            <span class="flex-c justify-between w-full">
              <span class="drop-name">{{ item.tenantName }}</span>
              <ArtSvgIcon
                icon="ri:check-line"
                class="drop-check"
                v-if="item.id === currentTenantId"
              />
            </span>
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { fetchTenantList } from '@/api/tenant'
  import { useI18n } from 'vue-i18n'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ArtTenantSwitcher' })

  const { t } = useI18n()
  const userStore = useUserStore()

  const tenantList = ref<Api.Tenant.TenantOptionItem[]>([])

  // 仅超级管理员展示，且多租户启用
  const visible = computed(
    () =>
      userStore.isLogin && userStore.getUserInfo.userType === 'superadmin' && userStore.tenantEnable
  )
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
      ElMessage.success(t('topBar.tenant.switchSuccess'))
    }
  }
</script>

<style lang="scss" scoped>
  /* 顶栏胶囊样式：与全局搜索框同高同圆角，hover 高亮主色 */
  .art-tenant-switcher {
    display: flex;
    align-items: center;
    height: 36px; /* 与搜索框 h-9 一致，垂直居中 */
  }

  .switcher-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 36px; /* 固定高度：中间 ElDropdown span 无确定高度，100% 会塌缩 */
    line-height: 1;
    max-width: 200px;
    padding: 0 10px;
    cursor: pointer;
    border: 1px solid var(--art-gray-400);
    border-radius: calc(var(--custom-radius) / 2 + 2px);
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: var(--main-color);
      border-color: var(--main-color);
      background-color: color-mix(in srgb, var(--main-color) 8%, transparent);

      .switcher-icon,
      .switcher-label,
      .switcher-value,
      .switcher-arrow {
        color: var(--main-color);
      }
    }

    .switcher-icon {
      flex-shrink: 0;
      font-size: 15px;
      color: var(--art-gray-500);
    }

    .switcher-name {
      display: flex;
      align-items: center;
      min-width: 0;
      font-size: 12px;
      font-weight: normal;
      line-height: 1;
      white-space: nowrap;

      .switcher-label {
        color: var(--art-gray-500);
      }

      .switcher-value {
        max-width: 96px;
        overflow: hidden;
        color: var(--art-gray-700);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .switcher-arrow {
      flex-shrink: 0;
      margin-left: 2px;
      font-size: 14px;
      color: var(--art-gray-400);
    }
  }

  /* 窄屏下退化为图标按钮，节省顶栏空间 */
  @media screen and (width <= 768px) {
    .switcher-trigger {
      width: 36px;
      padding: 0;
      justify-content: center;

      .switcher-name,
      .switcher-arrow {
        display: none;
      }
    }
  }
</style>
