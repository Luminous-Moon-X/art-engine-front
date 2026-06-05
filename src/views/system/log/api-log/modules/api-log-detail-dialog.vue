<!-- 接口日志详情弹窗 -->
<template>
  <ElDialog v-model="visible" title="接口日志详情" width="700px" destroy-on-close>
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="用户名">{{ logData?.userName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="用户昵称">{{ logData?.nickName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="操作描述" :span="2">{{ logData?.description || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="请求URL" :span="2">{{ logData?.requestUrl || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="请求方法">
        <ElTag :type="methodTagType" size="small">{{ logData?.requestMethod || '-' }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="响应码">
        <ElTag :type="logData?.responseCode === 200 ? 'success' : 'danger'" size="small">
          {{ logData?.responseCode || '-' }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="耗时">
        <span :style="{ color: costTimeColor }">{{ logData?.costTime ?? '-' }}ms</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求IP">{{ logData?.ip || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="请求时间" :span="2">{{ logData?.requestTime || '-' }}</ElDescriptionsItem>
    </ElDescriptions>

    <!-- 请求参数 -->
    <div class="detail-section">
      <div class="detail-section-title">请求参数</div>
      <ElScrollbar max-height="200px">
        <pre class="detail-json">{{ formatJson(logData?.requestParams) }}</pre>
      </ElScrollbar>
    </div>

    <!-- 返回值 -->
    <div class="detail-section">
      <div class="detail-section-title">返回值</div>
      <ElScrollbar max-height="200px">
        <pre class="detail-json">{{ formatJson(logData?.responseResult) }}</pre>
      </ElScrollbar>
    </div>

    <template #footer>
      <ElButton @click="visible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ApiLogRowItem } from '@/types/log'

  const props = defineProps<{
    modelValue: boolean
    logData?: ApiLogRowItem
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 请求方法标签类型
  const methodTagType = computed(() => {
    const methodColors: Record<string, string> = {
      GET: 'success',
      POST: 'primary',
      PUT: 'warning',
      DELETE: 'danger',
      PATCH: 'info'
    }
    return (methodColors[props.logData?.requestMethod || ''] || 'info') as
      | 'success'
      | 'primary'
      | 'warning'
      | 'danger'
      | 'info'
  })

  // 耗时颜色
  const costTimeColor = computed(() => {
    const costTime = props.logData?.costTime ?? 0
    if (costTime < 500) return '#67c23a'
    if (costTime < 1000) return '#e6a23c'
    return '#f56c6c'
  })

  /**
   * 格式化JSON字符串
   */
  const formatJson = (jsonStr?: string): string => {
    if (!jsonStr) return '-'
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2)
    } catch {
      return jsonStr
    }
  }
</script>

<style scoped>
  .detail-section {
    margin-top: 16px;
  }

  .detail-section-title {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 8px;
    color: var(--el-text-color-primary);
  }

  .detail-json {
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    padding: 12px;
    font-size: 12px;
    line-height: 1.6;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
  }
</style>
