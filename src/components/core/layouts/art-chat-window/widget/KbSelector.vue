<!-- 自定义知识库选择下拉组件（不使用组件库，纯手写样式） -->
<template>
  <div class="kb-selector">
    <!-- 触发器 -->
    <div class="kb-trigger-wrap">
      <button
        type="button"
        class="kb-trigger"
        :class="{ open: open }"
        :title="selectedKbName || '选择知识库'"
        @click.stop="toggle"
      >
        <ArtSvgIcon icon="ri:database-2-line" class="kb-trigger-icon" />
        <span class="kb-trigger-text">{{ selectedKbName || '选择知识库' }}</span>
        <ArtSvgIcon icon="ri:arrow-down-s-line" class="kb-trigger-arrow" />
      </button>
      <!-- 右上角清除按钮 -->
      <button
        v-if="modelValue != null"
        type="button"
        class="kb-clear"
        title="清除所选知识库"
        @click.stop="clear"
      >
        <ArtSvgIcon icon="ri:close-line" class="kb-clear-icon" />
      </button>
    </div>

    <!-- 下拉面板 -->
    <Transition name="kb-drop">
      <div v-if="open" class="kb-drop">
        <div class="kb-drop-head">
          <span class="kb-drop-title">选择知识库</span>
          <span class="kb-drop-count">{{ options.length }}</span>
        </div>

        <div v-if="loading" class="kb-drop-state">
          <span class="kb-loading-spin"></span>
          <span>加载中…</span>
        </div>

        <div v-else-if="options.length === 0" class="kb-drop-state">
          <span class="kb-empty-icon"><ArtSvgIcon icon="ri:inbox-line" /></span>
          <span>暂无知识库</span>
        </div>

        <ul v-else class="kb-list">
          <li
            v-for="opt in options"
            :key="opt.value"
            class="kb-item"
            :class="{ selected: opt.value === modelValue }"
            @click="select(opt.value)"
          >
            <ArtSvgIcon icon="ri:database-2-line" class="kb-item-icon" />
            <span class="kb-item-label">{{ opt.label }}</span>
            <ArtSvgIcon v-if="opt.value === modelValue" icon="ri:check-line" class="kb-item-check" />
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  export interface KbOption {
    /** 知识库ID */
    value: number
    /** 知识库名称（kb_name） */
    label: string
  }

  const props = withDefaults(
    defineProps<{
      modelValue?: number | null
      options?: KbOption[]
      loading?: boolean
    }>(),
    {
      modelValue: null,
      options: () => [],
      loading: false
    }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void
  }>()

  const open = ref(false)

  const selectedKbName = computed(() =>
    props.modelValue == null
      ? ''
      : props.options.find((o) => o.value === props.modelValue)?.label || ''
  )

  const toggle = (): void => {
    open.value = !open.value
  }

  /**
   * 清除所选知识库，恢复为空（kbId 重新为 null）
   */
  const clear = (): void => {
    emit('update:modelValue', null)
    open.value = false
  }

  const select = (value: number | null): void => {
    emit('update:modelValue', value)
    open.value = false
  }

  // 点击外部关闭
  const onDocumentClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement
    if (open.value && !target.closest('.kb-selector')) {
      open.value = false
    }
  }

  // Esc 关闭
  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && open.value) {
      open.value = false
    }
  }

  watch(
    () => props.options,
    (val) => {
      if (props.modelValue != null && !val.some((o) => o.value === props.modelValue)) {
        emit('update:modelValue', null)
      }
    }
  )

  onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
    document.removeEventListener('keydown', onKeydown)
  })
</script>

<style scoped lang="scss">
  .kb-selector {
    position: relative;
    flex-shrink: 0;
  }

  .kb-trigger-wrap {
    position: relative;
    display: inline-flex;
    max-width: 180px;
  }

  .kb-trigger {
    display: flex;
    gap: 6px;
    align-items: center;
    max-width: 180px;
    height: 30px;
    padding: 0 10px;
    font-size: 12px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: color-mix(in srgb, var(--default-box-color) 55%, transparent);
    border: 1px solid var(--art-card-border);
    border-radius: 10px;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

    &:hover,
    &.open {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, transparent);
      border-color: color-mix(in srgb, var(--theme-color) 45%, transparent);
    }

    .kb-trigger-icon {
      flex-shrink: 0;
      font-size: 14px;
    }

    .kb-trigger-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .kb-trigger-arrow {
      flex-shrink: 0;
      font-size: 14px;
      transition: transform 0.2s ease;
    }

    &.open .kb-trigger-arrow {
      transform: rotate(180deg);
    }
  }

  /* 右上角清除按钮 */
  .kb-clear {
    position: absolute;
    top: -6px;
    right: -6px;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    color: #fff;
    cursor: pointer;
    background: var(--art-gray-500);
    border: none;
    border-radius: 999px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
    transition: background 0.15s ease, transform 0.15s ease;

    &:hover {
      background: var(--theme-color);
      transform: scale(1.08);
    }

    .kb-clear-icon {
      font-size: 12px;
    }
  }
  .kb-drop {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    z-index: 60;
    width: 240px;
    max-height: 280px;
    overflow-y: auto;
    padding: 6px;
    background: color-mix(in srgb, var(--default-box-color) 97%, transparent);
    backdrop-filter: blur(20px);
    border: 1px solid var(--art-card-border);
    border-radius: 14px;
    box-shadow: 0 12px 32px rgb(0 0 0 / 16%);
  }

  .kb-drop-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px 8px;
    border-bottom: 1px solid var(--art-card-border);

    .kb-drop-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--art-gray-800);
    }

    .kb-drop-count {
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      font-size: 11px;
      line-height: 18px;
      color: var(--art-gray-500);
      text-align: center;
      background: var(--art-hover-color);
      border-radius: 999px;
    }
  }

  .kb-list {
    padding: 4px 0;
    margin: 0;
    list-style: none;
  }

  .kb-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 10px;
    font-size: 13px;
    color: var(--art-gray-700);
    cursor: pointer;
    border-radius: 9px;
    transition: color 0.12s ease, background 0.12s ease;

    .kb-item-icon {
      flex-shrink: 0;
      font-size: 15px;
      color: var(--art-gray-400);
      transition: color 0.12s ease;
    }

    .kb-item-label {
      overflow: hidden;
      flex: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .kb-item-check {
      flex-shrink: 0;
      font-size: 15px;
      color: var(--theme-color);
    }

    &:hover {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 9%, transparent);

      .kb-item-icon {
        color: var(--theme-color);
      }
    }

    &.selected {
      color: var(--theme-color);
      font-weight: 500;
      background: color-mix(in srgb, var(--theme-color) 10%, transparent);

      .kb-item-icon {
        color: var(--theme-color);
      }
    }
  }

  .kb-drop-state {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 28px 12px;
    font-size: 12px;
    color: var(--art-gray-500);

    .kb-empty-icon {
      font-size: 20px;
      color: var(--art-gray-400);
    }
  }

  .kb-loading-spin {
    width: 13px;
    height: 13px;
    border: 2px solid var(--art-gray-400);
    border-top-color: var(--theme-color);
    border-radius: 50%;
    animation: kb-spin 0.8s linear infinite;
  }

  @keyframes kb-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .kb-drop-enter-active,
  .kb-drop-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
    transform-origin: bottom left;
  }

  .kb-drop-enter-from,
  .kb-drop-leave-to {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
</style>