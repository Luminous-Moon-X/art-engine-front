# Art Icon Selector 图标选择器

基于 Element Plus Popover 和 Iconify 实现的高级图标选择器组件，支持图标搜索、分类筛选、深色模式适配。

## 功能特性

- 🎨 **可视化选择**：网格化展示图标，支持悬停预览。
- 🔍 **搜索过滤**：支持通过图标名称实时搜索。
- 📑 **分类管理**：内置系统、用户、文档、设备等常用分类。
- 🌓 **深色适配**：完美适配系统亮色/暗色主题。
- ⚡ **高性能**：虚拟滚动支持（通过 Element Plus Scrollbar）。
- 🔌 **表单集成**：支持 `v-model` 双向绑定，可直接用于表单组件。

## 使用方法

### 基础用法

```vue
<script setup lang="ts">
  import { ref } from 'vue'
  import ArtIconSelector from '@/components/core/base/art-icon-selector/index.vue'

  const icon = ref('ri:home-line')
</script>

<template>
  <ArtIconSelector v-model="icon" />
</template>
```

### 在 ArtForm 中使用

```typescript
import ArtIconSelector from '@/components/core/base/art-icon-selector/index.vue'

const formItems = [
  {
    label: '图标',
    key: 'icon',
    render: ArtIconSelector, // 直接作为渲染组件传入
    props: {
      placeholder: '请选择菜单图标',
      width: 450
    }
  }
]
```

## 属性 (Props)

| 属性名        | 类型      | 默认值         | 说明                   |
| ------------- | --------- | -------------- | ---------------------- | ---------- |
| `modelValue`  | `string`  | `''`           | 绑定的图标值 (v-model) |
| `placeholder` | `string`  | `'请选择图标'` | 占位文本               |
| `disabled`    | `boolean` | `false`        | 是否禁用               |
| `width`       | `string   | number`        | `450`                  | 弹出层宽度 |

## 事件 (Events)

| 事件名              | 说明                 | 回调参数          |
| ------------------- | -------------------- | ----------------- |
| `update:modelValue` | 更新绑定值时触发     | `(value: string)` |
| `change`            | 选中图标或清空时触发 | `(value: string)` |

## 图标数据扩展

图标数据定义在 `icon-data.ts` 文件中，你可以按照以下格式扩展更多分类或图标：

```typescript
export const iconCategories = [
  {
    name: '新分类',
    key: 'new-category',
    icons: ['ri:icon-name-1', 'ri:icon-name-2']
  }
  // ...
]
```
