<!-- Markdown编辑器组件 插件地址：https://imzbf.github.io/md-editor-v3/ -->
<template>
  <MdEditor
    v-model="modelValue"
    :style="{ height }"
    :theme="editorTheme"
    :language="language"
    :preview-theme="previewTheme"
    :toolbars-exclude="toolbarsExclude"
    :no-upload-img="true"
    :placeholder="placeholder"
  />
</template>

<script setup lang="ts">
  import { MdEditor } from 'md-editor-v3'
  import type { ToolbarNames } from 'md-editor-v3'
  import 'md-editor-v3/lib/style.css'
  import { useSettingStore } from '@/store/modules/setting'

  defineOptions({ name: 'ArtMarkdownEditor' })

  interface Props {
    /** 编辑器高度 */
    height?: string
    /** 界面语言（zh-CN / en-US） */
    language?: string
    /** 预览主题 */
    previewTheme?: string
    /** 排除的工具栏项 */
    toolbarsExclude?: ToolbarNames[]
    /** 占位符文本 */
    placeholder?: string
  }

  withDefaults(defineProps<Props>(), {
    height: '500px',
    language: 'zh-CN',
    previewTheme: 'default',
    toolbarsExclude: () => ['github'],
    placeholder: ''
  })

  const modelValue = defineModel<string>({ required: true })

  /** 跟随系统明暗主题切换编辑器主题 */
  const { isDark } = storeToRefs(useSettingStore())
  const editorTheme = computed(() => (isDark.value ? 'dark' : 'light'))
</script>

<style lang="scss" scoped>
  /* 编辑器内容区高度受外层高度约束 */
  :deep(.md-editor) {
    height: 100%;
  }
</style>
