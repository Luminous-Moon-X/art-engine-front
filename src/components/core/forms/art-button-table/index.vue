<!-- 表格按钮 -->
<template>
  <ElTooltip v-if="showTooltip" :content="text" :show-after="500" placement="top">
    <div
      :class="[
        'inline-flex items-center justify-center gap-1 min-w-8 h-8 px-2.5 mr-2.5 text-sm c-p rounded-md align-middle art-button-table',
        buttonClass
      ]"
      :style="{ backgroundColor: buttonBgColor, color: iconColor }"
      @click="handleClick"
      v-auth="auth"
    >
      <ArtSvgIcon :icon="iconContent" />
    </div>
  </ElTooltip>
  <div
    v-else
    :class="[
      'inline-flex items-center justify-center gap-1 min-w-8 h-8 px-2.5 mr-2.5 text-sm c-p rounded-md align-middle art-button-table',
      buttonClass
    ]"
    :style="{ backgroundColor: buttonBgColor, color: iconColor }"
    @click="handleClick"
    v-auth="auth"
  >
    <ArtSvgIcon :icon="iconContent" />
    <span v-if="showText" class="whitespace-nowrap">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ArtButtonTable' })

  interface Props {
    /** 按钮类型 */
    type?: 'add' | 'edit' | 'delete' | 'more' | 'view'
    /** 按钮展示形式：icon 仅图标，text 图标 + 文本 */
    showType?: 'icon' | 'text'
    /** 按钮文本：showType 为 text 时展示在图标后，showType 为 icon 时作为悬浮提示 */
    text?: string
    /** 按钮图标 */
    icon?: string
    /** 按钮样式类 */
    iconClass?: string
    /** icon 颜色 */
    iconColor?: string
    /** 按钮背景色 */
    buttonBgColor?: string
    /** 按钮权限 */
    auth?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    showType: 'text'
  })

  const emit = defineEmits<{
    (e: 'click'): void
  }>()

  // 默认按钮配置
  const defaultButtons = {
    add: { icon: 'ri:add-fill', class: 'bg-theme/12 text-theme' },
    edit: { icon: 'ri:pencil-line', class: 'bg-secondary/12 text-secondary' },
    delete: { icon: 'ri:delete-bin-5-line', class: 'bg-error/12 text-error' },
    view: { icon: 'ri:eye-line', class: 'bg-info/12 text-info' },
    more: { icon: 'ri:more-2-fill', class: '' }
  } as const

  // 获取图标内容
  const iconContent = computed(() => {
    return props.icon || (props.type ? defaultButtons[props.type]?.icon : '') || ''
  })

  // 获取按钮样式类
  const buttonClass = computed(() => {
    return props.iconClass || (props.type ? defaultButtons[props.type]?.class : '') || ''
  })

  // 是否展示文字：showType 为 text 且传入了文本，否则降级为纯图标按钮
  const showText = computed(() => {
    return props.showType === 'text' && !!props.text?.trim()
  })

  // 是否展示悬浮提示：showType 为 icon 且传入了文本
  const showTooltip = computed(() => {
    return props.showType === 'icon' && !!props.text?.trim()
  })

  const handleClick = () => {
    emit('click')
  }
</script>

<style scoped>
  .art-button-table {
    position: relative;
    overflow: hidden;
  }

  .art-button-table::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background: linear-gradient(135deg, currentcolor 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .art-button-table:hover::before {
    opacity: 0.16;
  }

  .art-button-table > * {
    position: relative;
    z-index: 1;
  }
</style>
