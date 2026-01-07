<template>
  <div class="art-icon-selector w-full">
    <el-popover
      v-model:visible="visible"
      placement="bottom-start"
      trigger="click"
      :width="popoverWidth"
      popper-class="art-icon-selector-popper"
      :fallback-placements="['bottom-end', 'top-start', 'top-end']"
    >
      <template #reference>
        <div
          class="relative flex items-center w-full h-8 px-3 py-1 bg-white dark:bg-g-300/10 border border-[var(--el-border-color)] rounded cursor-pointer hover:border-[var(--el-border-color-hover)] transition-colors"
          :class="{ 'border-theme ring-2 ring-theme/20': visible }"
        >
          <!-- Icon Preview -->
          <div class="flex-shrink-0 mr-2 flex items-center justify-center w-5 h-5">
            <ArtSvgIcon v-if="modelValue" :icon="modelValue" class="text-lg" />
            <span v-else class="text-g-400 text-xs">无</span>
          </div>

          <!-- Icon Name / Placeholder -->
          <div class="flex-1 truncate text-sm text-g-700 dark:text-g-300">
            {{ modelValue || placeholder }}
          </div>

          <!-- Clear Button (visible on hover or when value exists) -->
          <div
            v-if="modelValue && !disabled"
            class="flex-shrink-0 ml-2 flex items-center justify-center w-5 h-5 hover:bg-g-100 dark:hover:bg-g-700 rounded-full transition-colors group"
            @click.stop="handleClear"
          >
            <ArtSvgIcon icon="ri:close-line" class="text-g-400 group-hover:text-g-600" />
          </div>
          <div v-else class="flex-shrink-0 ml-2">
            <ArtSvgIcon
              icon="ri:arrow-down-s-line"
              class="text-g-400 transition-transform duration-300"
              :class="{ 'rotate-180': visible }"
            />
          </div>
        </div>
      </template>

      <!-- Popover Content -->
      <div class="flex flex-col h-[380px]">
        <!-- Search -->
        <div class="mb-3">
          <el-input
            v-model="searchText"
            placeholder="搜索图标..."
            prefix-icon="Search"
            clearable
            size="default"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
            </template>
          </el-input>
        </div>

        <!-- Tabs -->
        <el-tabs v-model="activeTab" class="icon-selector-tabs mb-2">
          <el-tab-pane label="全部" name="all" />
          <el-tab-pane
            v-for="cat in iconCategories"
            :key="cat.key"
            :label="cat.name"
            :name="cat.key"
          />
        </el-tabs>

        <!-- Icon Grid -->
        <div class="flex-1 overflow-hidden relative">
          <el-scrollbar>
            <div
              v-if="displayIcons.length > 0"
              class="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1 p-1"
            >
              <div
                v-for="icon in displayIcons"
                :key="icon"
                class="flex flex-col items-center justify-center aspect-square rounded cursor-pointer transition-all duration-200 border border-transparent hover:bg-theme/10 hover:border-theme/50 hover:shadow-sm group"
                :class="{ 'bg-theme/10 border-theme text-theme': modelValue === icon }"
                @click="handleSelect(icon)"
                :title="icon"
              >
                <ArtSvgIcon
                  :icon="icon"
                  class="text-2xl mb-1 transition-transform group-hover:scale-110"
                />
                <!-- <span class="text-[10px] text-g-500 truncate w-full text-center px-1 scale-90">{{ icon.replace('ri:', '') }}</span> -->
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center h-full text-g-400 py-10">
              <ArtSvgIcon icon="ri:inbox-line" class="text-4xl mb-2 opacity-50" />
              <span class="text-sm">未找到相关图标</span>
            </div>
          </el-scrollbar>
        </div>

        <!-- Footer Info -->
        <div
          class="mt-2 pt-2 border-t border-g-100 dark:border-g-700 text-xs text-g-500 flex justify-between items-center"
        >
          <span>已加载 {{ displayIcons.length }} 个图标</span>
          <span v-if="modelValue" class="text-theme">{{ modelValue }}</span>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useWindowSize, refDebounced } from '@vueuse/core'
  import { iconCategories, allIcons } from './icon-data'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ArtIconSelector' })

  interface Props {
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    width?: string | number
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '请选择图标',
    disabled: false,
    width: 450
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
  }>()

  const visible = ref(false)
  const searchText = ref('')
  const activeTab = ref('all')

  // Responsive handling
  const { width: windowWidth } = useWindowSize()
  // 300ms debounce for performance
  const debouncedWindowWidth = refDebounced(windowWidth, 300)

  const popoverWidth = computed(() => {
    const w = debouncedWindowWidth.value
    const maxW =
      typeof props.width === 'number' ? props.width : parseInt(props.width as string) || 450

    // Ensure 10px safety margin on each side (20px total)
    // If screen width is smaller than (maxW + 20px), adapt width
    if (w < maxW + 24) {
      return Math.max(280, w - 24) // Min width fallback 280px
    }

    return maxW
  })

  // Filter icons based on search text and active tab
  const displayIcons = computed(() => {
    let icons: string[] = []

    if (activeTab.value === 'all') {
      icons = allIcons
    } else {
      const category = iconCategories.find((c) => c.key === activeTab.value)
      icons = category ? category.icons : []
    }

    if (searchText.value) {
      const lowerSearch = searchText.value.toLowerCase()
      icons = icons.filter((icon) => icon.toLowerCase().includes(lowerSearch))
    }

    return icons
  })

  const handleSelect = (icon: string) => {
    emit('update:modelValue', icon)
    emit('change', icon)
    visible.value = false
  }

  const handleClear = () => {
    emit('update:modelValue', '')
    emit('change', '')
  }
</script>

<style lang="scss">
  .art-icon-selector-popper {
    max-width: 95vw;
    padding: 12px !important;
    transition: width 0.3s ease;

    .el-tabs__header {
      margin-bottom: 10px;
    }

    .el-tabs__nav-wrap::after {
      height: 1px;
      background-color: var(--el-border-color-lighter);
    }

    .el-tabs__item {
      height: 32px;
      padding: 0 12px;
      font-size: 13px;
      line-height: 32px;

      &.is-active {
        font-weight: 600;
      }
    }
  }
</style>
