<!-- 用户搜索组件（示例表格页使用） -->
<template>
  <div class="mb-4 flex flex-wrap items-center gap-3 rounded-md bg-box p-3">
    <ElInput
      v-model="formData.userName"
      class="!w-45"
      placeholder="请输入用户名"
      clearable
      @keyup.enter="handleSearch"
    />
    <ElInput
      v-model="formData.userPhone"
      class="!w-45"
      placeholder="请输入手机号"
      clearable
      @keyup.enter="handleSearch"
    />
    <ElInput
      v-model="formData.userEmail"
      class="!w-52"
      placeholder="请输入邮箱"
      clearable
      @keyup.enter="handleSearch"
    />
    <ElButton type="primary" :icon="Search" @click="handleSearch">搜索</ElButton>
    <ElButton :icon="Refresh" @click="handleReset">重置</ElButton>
  </div>
</template>

<script setup lang="ts">
  import { Search, Refresh } from '@element-plus/icons-vue'

  defineOptions({ name: 'UserSearch' })

  interface UserFilter {
    userName?: string
    userPhone?: string
    userEmail?: string
    name?: string
    [key: string]: string | undefined
  }

  const props = defineProps<{
    /** 搜索条件（支持v-model） */
    modelValue?: UserFilter
  }>()

  const emit = defineEmits<{
    /** 更新搜索条件 */
    (e: 'update:modelValue', value: UserFilter): void
    /** 触发搜索 */
    (e: 'search', value: UserFilter): void
    /** 重置搜索条件 */
    (e: 'reset'): void
  }>()

  const formData = reactive<UserFilter>({
    userName: '',
    userPhone: '',
    userEmail: '',
    ...(props.modelValue ?? {})
  })

  const handleSearch = (): void => {
    emit('update:modelValue', { ...formData })
    emit('search', { ...formData })
  }

  const handleReset = (): void => {
    formData.userName = ''
    formData.userPhone = ''
    formData.userEmail = ''
    formData.name = undefined
    emit('update:modelValue', { ...formData })
    emit('reset')
  }
</script>
