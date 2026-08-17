<!-- 系统聊天窗口 -->
<template>
  <Teleport to="body">
    <Transition name="chat-drawer">
      <div v-if="isDrawerVisible" class="chat-overlay fixed inset-0 z-[3200] flex justify-end">
        <!-- 遮罩 -->
        <div class="chat-backdrop absolute inset-0" @click="closeChat"></div>

        <!-- 抽屉面板 -->
        <aside
          class="chat-panel relative flex h-full w-[min(1400px,calc(100vw-32px))] flex-col overflow-hidden max-md:w-full"
        >
          <div class="flex min-h-0 flex-1">
            <!-- 左侧对话列表 -->
            <aside class="flex w-72 shrink-0 flex-col border-r border-g-400/50 max-sm:w-44">
              <!-- 品牌区 -->
              <div class="flex items-center gap-2.5 px-4 pb-3 pt-4">
                <ArtLogo :size="34" class="shrink-0" />
                <div class="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <p class="shrink-0 text-lg font-bold leading-5 text-gray-600">Art 智能助手</p>
                  <p
                    class="flex items-center gap-1 text-[11px] leading-4"
                    :class="isOnline ? 'text-g-500' : 'text-danger'"
                  >
                    <span
                      class="inline-block h-1.5 w-1.5 rounded-full"
                      :class="isOnline ? 'bg-success' : 'bg-danger'"
                    ></span>
                    {{ isOnline ? '在线' : '连接异常' }}
                  </p>
                </div>
              </div>

              <!-- 新对话 -->
              <div class="px-3 pb-2.5">
                <button class="new-conv-btn" @click="startNewConversation">
                  <ArtSvgIcon icon="ri:add-line" class="text-base" />
                  <span>新对话</span>
                </button>
              </div>

              <!-- 对话列表 -->
              <div class="chat-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                <div
                  v-if="isLoadingConversations && conversations.length === 0"
                  class="flex-cc py-8 text-g-500"
                >
                  <ElIcon class="is-loading"><Loading /></ElIcon>
                </div>
                <button
                  v-for="item in conversations"
                  :key="item.conversationId"
                  class="conv-item"
                  :class="{ active: item.conversationId === activeConversationId }"
                  @click="selectConversation(item)"
                >
                  <ArtSvgIcon icon="ri:message-3-line" class="conv-item-icon shrink-0" />
                  <span class="min-w-0 flex-1 text-left">
                    <span class="block truncate">{{ item.conversationName }}</span>
                    <span class="mt-0.5 block text-[11px] text-g-500">
                      {{ formatConversationTime(item.createTime) }}
                    </span>
                  </span>
                </button>
                <div
                  v-if="!isLoadingConversations && conversations.length === 0"
                  class="py-10 text-center text-xs text-g-500"
                >
                  暂无历史对话
                </div>
              </div>
            </aside>

            <!-- 右侧聊天区域 -->
            <main class="flex min-w-0 flex-1 flex-col">
              <!-- 标题栏 -->
              <header class="flex-cb border-b border-g-400/50 px-5 py-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{{ currentConversationName }}</p>
                  <p class="mt-0.5 text-[11px] text-g-500">
                    {{ isStreaming ? '正在生成回复…' : `共 ${messages.length} 条消息` }}
                  </p>
                </div>
                <button class="icon-btn shrink-0" title="关闭" @click="closeChat">
                  <ArtSvgIcon icon="ri:close-line" class="text-lg" />
                </button>
              </header>

              <!-- 消息区域 -->
              <div
                ref="messageContainer"
                v-loading="isLoadingMessages"
                class="chat-scroll min-h-0 flex-1 overflow-y-auto px-5 py-6"
              >
                <!-- 欢迎区 -->
                <div
                  v-if="messages.length === 0 && !isLoadingMessages"
                  class="mx-auto flex min-h-[340px] w-full max-w-[780px] flex-col items-center justify-center pb-6 text-center"
                >
                  <div class="welcome-logo">
                    <ArtSvgIcon icon="ri:sparkling-2-line" class="text-3xl text-white" />
                  </div>
                  <p class="mt-4 text-lg font-semibold">你好，我是 Art Bot</p>
                  <p class="mt-1 text-sm text-g-500">基于 DeepSeek 大模型，有什么可以帮你的吗？</p>
                  <div class="mt-6 flex max-w-md flex-wrap justify-center gap-2">
                    <button
                      v-for="item in suggestions"
                      :key="item"
                      class="suggestion-chip"
                      @click="fillSuggestion(item)"
                    >
                      {{ item }}
                    </button>
                  </div>
                </div>

                <!-- 消息列表 -->
                <template v-for="message in messages" :key="message.id">
                  <div
                    class="msg-row mx-auto w-full max-w-[780px]"
                    :class="message.type === 'USER' ? 'msg-row-user' : 'msg-row-ai'"
                  >
                    <div
                      class="msg-body"
                      :class="message.type === 'USER' ? 'items-end' : 'items-start'"
                    >
                      <div v-if="message.type === 'USER'" class="user-bubble">
                        {{ message.content }}
                      </div>
                      <div v-else class="ai-bubble">
                        <MarkdownView :content="message.content" />
                        <span v-if="message.streaming" class="typing-cursor"></span>
                        <div v-if="message.stopped" class="mt-1.5 text-[11px] text-g-500">
                          已停止生成
                        </div>
                        <div v-if="message.error" class="mt-1.5 text-[11px] text-danger">
                          {{ message.error }}
                        </div>
                      </div>
                      <div v-if="message.type === 'AI' && message.content" class="msg-actions">
                        <button
                          class="copy-btn"
                          :class="{ copied: copiedMessageId === message.id }"
                          :title="'复制AI回答的markdown文本'"
                          @click="copyAiMessage(message)"
                        >
                          <ArtSvgIcon
                            :icon="
                              copiedMessageId === message.id ? 'ri:check-line' : 'ri:file-copy-line'
                            "
                            class="text-lg"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- 输入区域 -->
              <footer class="px-5 pb-4 pt-1">
                <div
                  class="input-shell mx-auto w-full max-w-[820px]"
                  :class="{ focused: inputFocused }"
                >
                  <textarea
                    ref="inputRef"
                    v-model="messageText"
                    rows="1"
                    class="chat-textarea"
                    :placeholder="
                      isStreaming
                        ? 'Art Bot 正在回复…'
                        : '给 Art Bot 发送消息，Enter 发送 / Shift+Enter 换行'
                    "
                    @keydown="handleKeydown"
                    @focus="inputFocused = true"
                    @blur="inputFocused = false"
                  ></textarea>
                  <button
                    class="send-btn"
                    :class="isStreaming ? 'is-stop' : { disabled: !messageText.trim() }"
                    :title="isStreaming ? '停止生成' : '发送'"
                    @click="isStreaming ? stopStreaming() : sendMessage()"
                  >
                    <ArtSvgIcon v-if="!isStreaming" icon="ri:arrow-up-line" class="text-lg" />
                    <span v-else class="stop-icon"></span>
                  </button>
                </div>
                <p class="mx-auto mt-2 w-full max-w-[820px] text-center text-[11px] text-g-400"
                  >AI 生成内容仅供参考，请注意甄别</p
                >
              </footer>
            </main>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { Loading } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { mittBus } from '@/utils/sys'
  import { fetchAiChatMessages, fetchAiConversations, streamAiChat } from '@/api/ai-chat'
  import type {
    AiChatDoneEvent,
    AiChatMessageItem,
    AiConversationItem,
    ChatMessageType
  } from '@/types/ai-chat'
  import MarkdownView from './widget/MarkdownView.vue'

  defineOptions({ name: 'ArtChatWindow' })

  // 本地消息结构
  interface LocalChatMessage {
    id: number
    type: ChatMessageType
    content: string
    time: string
    /** 是否正在流式接收 */
    streaming?: boolean
    /** 是否被用户手动停止 */
    stopped?: boolean
    /** 错误信息 */
    error?: string
  }

  // 本地对话结构（persisted=false 表示尚未落库的新对话）
  interface LocalConversation extends AiConversationItem {
    persisted: boolean
  }

  // 组件状态
  const isDrawerVisible = ref(false)
  const isOnline = ref(true)
  const isLoadingConversations = ref(false)
  const isLoadingMessages = ref(false)
  const isStreaming = ref(false)
  const inputFocused = ref(false)

  // 对话相关状态
  const conversations = ref<LocalConversation[]>([])
  const activeConversationId = ref('')
  const messages = ref<LocalChatMessage[]>([])
  const messageId = ref(1)
  const messageContainer = ref<HTMLElement | null>(null)
  const abortController = ref<AbortController | null>(null)
  // 消息加载序号，防止切换对话时的竞态覆盖
  let messagesRequestSeq = 0

  // 输入状态
  const messageText = ref('')
  const inputRef = ref<HTMLTextAreaElement | null>(null)

  // 复制状态
  const copiedMessageId = ref<number | null>(null)
  let copyTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 复制文本到剪贴板（兼容非安全上下文降级方案）
   */
  const copyText = async (text: string): Promise<void> => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (!ok) {
      throw new Error('复制失败')
    }
  }

  /**
   * 复制AI回答的markdown文本
   */
  const copyAiMessage = async (message: LocalChatMessage): Promise<void> => {
    try {
      await copyText(message.content)
      copiedMessageId.value = message.id
      if (copyTimer) {
        clearTimeout(copyTimer)
      }
      copyTimer = setTimeout(() => {
        copiedMessageId.value = null
      }, 1500)
    } catch (error) {
      console.log('复制失败:', error)
      ElMessage.error('复制失败')
    }
  }

  // 欢迎区快捷提问
  const suggestions = [
    '介绍一下系统的主要功能',
    '用一句话解释什么是 RAG',
    '帮我写一段 Python 快速排序',
    '如何提升团队开发效率'
  ]

  const currentConversation = computed(() =>
    conversations.value.find((item) => item.conversationId === activeConversationId.value)
  )
  const currentConversationName = computed(
    () => currentConversation.value?.conversationName || 'Art Bot'
  )

  // 工具函数
  const formatTime = (time?: string): string => {
    if (!time) return ''
    const date = new Date(time)
    if (Number.isNaN(date.getTime())) return time
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const formatConversationTime = (time?: string): string => {
    if (!time) return ''
    const date = new Date(time)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    const isToday = date.toDateString() === new Date().toDateString()
    if (isToday) {
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }

  const scrollToBottom = (): void => {
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    })
  }

  const toLocalMessage = (msg: AiChatMessageItem): LocalChatMessage => ({
    id: messageId.value++,
    type: msg.messageType,
    content: msg.content,
    time: formatTime(msg.createTime)
  })

  /**
   * 输入框自适应高度
   */
  const resizeTextarea = (): void => {
    const el = inputRef.value
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  /**
   * 点击快捷提问
   */
  const fillSuggestion = (item: string): void => {
    messageText.value = item
    nextTick(() => {
      resizeTextarea()
      inputRef.value?.focus()
    })
  }

  /**
   * 加载当前登录用户的所有对话
   */
  const loadConversations = async (): Promise<void> => {
    isLoadingConversations.value = true
    try {
      const list = await fetchAiConversations()
      // 保留尚未落库的临时新对话
      const pending = conversations.value.filter((item) => !item.persisted)
      conversations.value = [...pending, ...list.map((item) => ({ ...item, persisted: true }))]
      isOnline.value = true
    } catch {
      isOnline.value = false
    } finally {
      isLoadingConversations.value = false
    }
  }

  /**
   * 移除没有发送过消息的临时新对话
   */
  const removeEmptyPendingConversation = (): void => {
    const active = conversations.value.find(
      (item) => item.conversationId === activeConversationId.value
    )
    if (active && !active.persisted && messages.value.length === 0) {
      conversations.value = conversations.value.filter(
        (item) => item.conversationId !== activeConversationId.value
      )
    }
  }

  /**
   * 开始一个新的对话（仅在前端显示"新对话"标签，未落库）
   */
  const startNewConversation = (): void => {
    if (isStreaming.value) {
      stopStreaming()
    }
    removeEmptyPendingConversation()
    const item: LocalConversation = {
      conversationId: crypto.randomUUID(),
      conversationName: '新对话',
      turnCount: 0,
      createTime: new Date().toISOString(),
      persisted: false
    }
    conversations.value.unshift(item)
    activeConversationId.value = item.conversationId
    messages.value = []
    messageText.value = ''
    nextTick(() => {
      resizeTextarea()
      inputRef.value?.focus()
    })
  }

  /**
   * 选择对话并加载其消息
   */
  const selectConversation = async (item: LocalConversation): Promise<void> => {
    if (item.conversationId === activeConversationId.value) {
      return
    }
    // 切换对话时中止当前流式输出
    if (isStreaming.value) {
      stopStreaming()
    }
    removeEmptyPendingConversation()
    activeConversationId.value = item.conversationId
    // 临时新对话尚无服务端数据
    if (!item.persisted) {
      messages.value = []
      return
    }
    const seq = ++messagesRequestSeq
    isLoadingMessages.value = true
    try {
      const list = await fetchAiChatMessages(item.conversationId)
      if (seq !== messagesRequestSeq) {
        return
      }
      messages.value = list.map(toLocalMessage)
      isOnline.value = true
    } catch (error) {
      if (seq !== messagesRequestSeq) {
        return
      }
      ElMessage.error((error as Error).message || '加载消息失败')
      messages.value = []
    } finally {
      if (seq === messagesRequestSeq) {
        isLoadingMessages.value = false
        scrollToBottom()
      }
    }
  }

  /**
   * 流式对话完成处理
   */
  const finishStreaming = (aiMessage: LocalChatMessage, event: AiChatDoneEvent): void => {
    aiMessage.streaming = false
    isStreaming.value = false
    isOnline.value = true
    // 更新本地对话信息并同步服务端对话列表
    const conversation = conversations.value.find(
      (item) => item.conversationId === event.conversationId
    )
    if (conversation) {
      conversation.persisted = true
      conversation.conversationName = event.conversationName
      conversation.turnCount = event.turnCount
    }
    loadConversations()
  }

  /**
   * 发送消息
   */
  const sendMessage = async (): Promise<void> => {
    const text = messageText.value.trim()
    if (!text || isStreaming.value) {
      return
    }
    // 没有活动对话时先创建一个新对话
    if (!activeConversationId.value) {
      startNewConversation()
    }
    const chatId = activeConversationId.value
    messageText.value = ''

    const now = new Date().toISOString()
    // 添加用户消息
    messages.value.push({
      id: messageId.value++,
      type: 'USER',
      content: text,
      time: formatTime(now)
    })
    // 添加AI占位消息
    messages.value.push({
      id: messageId.value++,
      type: 'AI',
      content: '',
      time: formatTime(now),
      streaming: true
    })
    // 注意：必须从响应式数组取回代理对象，直接改原始对象不会触发视图更新，
    // 否则流式内容会在SSE结束后才一次性渲染
    const aiMessage = messages.value[messages.value.length - 1]
    isStreaming.value = true
    abortController.value = new AbortController()
    scrollToBottom()

    try {
      await streamAiChat(
        { chatId, question: text },
        {
          onMessage: (chunk: string) => {
            // 打字机效果：增量追加内容并实时渲染
            aiMessage.content += chunk
            scrollToBottom()
          },
          onDone: (event: AiChatDoneEvent) => {
            finishStreaming(aiMessage, event)
          },
          onError: (error: Error) => {
            aiMessage.streaming = false
            aiMessage.error = error.message
            isStreaming.value = false
            isOnline.value = false
          }
        },
        abortController.value.signal
      )
    } catch (error) {
      aiMessage.streaming = false
      if (abortController.value?.signal.aborted) {
        // 用户主动停止，保留已生成内容
        aiMessage.stopped = true
      } else {
        aiMessage.error = (error as Error).message || 'AI服务异常'
        isOnline.value = false
      }
      isStreaming.value = false
    } finally {
      abortController.value = null
      // 兜底：连接正常关闭但未收到done事件时，结束打字状态并同步对话列表
      if (aiMessage.streaming) {
        aiMessage.streaming = false
        loadConversations()
      }
    }
  }

  /**
   * 停止当前流式输出
   */
  const stopStreaming = (): void => {
    abortController.value?.abort()
    isStreaming.value = false
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage && lastMessage.type === 'AI' && lastMessage.streaming) {
      lastMessage.streaming = false
      lastMessage.stopped = true
    }
  }

  /**
   * 输入框按键处理：Enter发送、Shift+Enter换行
   */
  const handleKeydown = (event: KeyboardEvent): void => {
    // 中文输入法组词中不触发发送
    if (event.isComposing || event.keyCode === 229) {
      return
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  /**
   * Esc 关闭抽屉
   */
  const handleEscKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && isDrawerVisible.value) {
      closeChat()
    }
  }

  // 聊天窗口控制方法
  const openChat = async (): Promise<void> => {
    isDrawerVisible.value = true
    nextTick(() => {
      resizeTextarea()
      scrollToBottom()
    })
    await loadConversations()
    // 无活动对话时自动选中最近一条对话
    if (!activeConversationId.value && conversations.value.length > 0) {
      await selectConversation(conversations.value[0])
    }
  }

  const closeChat = (): void => {
    isDrawerVisible.value = false
  }

  // 抽屉打开时锁定页面滚动
  watch(isDrawerVisible, (visible) => {
    document.body.style.overflow = visible ? 'hidden' : ''
  })

  watch(messageText, resizeTextarea)

  // 生命周期
  onMounted(() => {
    mittBus.on('openChat', openChat)
    window.addEventListener('keydown', handleEscKeydown)
  })

  onUnmounted(() => {
    mittBus.off('openChat', openChat)
    window.removeEventListener('keydown', handleEscKeydown)
    document.body.style.overflow = ''
  })
</script>

<style scoped lang="scss">
  /* ==================== 抽屉过渡动画 ==================== */
  .chat-drawer-enter-active,
  .chat-drawer-leave-active {
    transition: opacity 0.28s ease;
  }

  .chat-drawer-enter-active .chat-panel,
  .chat-drawer-leave-active .chat-panel {
    transition: transform 0.34s cubic-bezier(0.22, 0.9, 0.26, 1);
  }

  .chat-drawer-enter-from,
  .chat-drawer-leave-to {
    opacity: 0;
  }

  .chat-drawer-enter-from .chat-panel,
  .chat-drawer-leave-to .chat-panel {
    transform: translateX(100%);
  }

  /* ==================== 遮罩与面板 ==================== */
  .chat-backdrop {
    background: rgb(0 0 0 / 45%);
    backdrop-filter: blur(2px);
  }

  .chat-panel {
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    backdrop-filter: blur(20px);
    border-left: 1px solid var(--art-card-border);
    box-shadow: -24px 0 64px rgb(0 0 0 / 16%);
  }

  /* ==================== 滚动条 ==================== */
  .chat-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--art-gray-400) transparent;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--art-gray-400);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
  /* ==================== 新对话按钮 ==================== */
  .new-conv-btn {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 38px;
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-color);
    cursor: pointer;
    background: color-mix(in srgb, var(--theme-color) 9%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-color) 40%, transparent);
    border-radius: 12px;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--theme-color) 16%, transparent);
      border-color: color-mix(in srgb, var(--theme-color) 60%, transparent);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  /* ==================== 对话列表项 ==================== */
  .conv-item {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 9px 10px;
    margin-bottom: 2px;
    font-size: 13px;
    color: var(--art-gray-800);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 12px;
    transition: background 0.15s ease;

    &:hover {
      background: var(--art-hover-color);
    }

    &.active {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 12%, transparent);
    }

    .conv-item-icon {
      font-size: 16px;
      color: var(--art-gray-500);
      transition: color 0.15s ease;
    }

    &.active .conv-item-icon {
      color: var(--theme-color);
    }
  }

  /* ==================== 通用图标按钮 ==================== */
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 10px;
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:hover {
      color: var(--art-gray-900);
      background: var(--art-hover-color);
    }
  }

  /* ==================== 欢迎区 ==================== */
  .welcome-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    color: #fff;
    background: linear-gradient(
      135deg,
      var(--theme-color),
      color-mix(in srgb, var(--theme-color) 60%, #8b5cf6)
    );
    border-radius: 24px;
    box-shadow: 0 12px 32px color-mix(in srgb, var(--theme-color) 35%, transparent);
  }

  .suggestion-chip {
    padding: 6px 12px;
    font-size: 12px;
    color: var(--art-gray-700);
    cursor: pointer;
    background: color-mix(in srgb, var(--default-box-color) 60%, transparent);
    border: 1px solid var(--art-card-border);
    border-radius: 999px;
    transition:
      border-color 0.15s ease,
      color 0.15s ease,
      background 0.15s ease;

    &:hover {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, transparent);
      border-color: color-mix(in srgb, var(--theme-color) 55%, transparent);
    }
  }

  /* ==================== 消息气泡 ==================== */
  .msg-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    width: 100%;
    margin-bottom: 24px;
  }

  .msg-row-user {
    flex-direction: row-reverse;
  }

  .msg-body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .user-bubble {
    max-width: 100%;
    padding: 9px 14px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--art-gray-900);
    word-break: break-word;
    white-space: pre-wrap;
    background: #edf3fe;
    border-radius: 16px 16px 4px;
  }

  .ai-bubble {
    width: 100%;
    font-size: 15px;
    color: var(--art-gray-900);
  }

  /* ==================== 消息操作区 ==================== */
  .msg-actions {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-top: 4px;
    margin-left: -6px;
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    color: var(--art-gray-500);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition:
      color 0.15s ease,
      background 0.15s ease;

    &:hover {
      color: var(--theme-color);
      background: color-mix(in srgb, var(--theme-color) 8%, transparent);
    }

    &.copied {
      color: var(--theme-color);
    }
  }

  .typing-cursor {
    display: inline-block;
    width: 7px;
    height: 15px;
    margin-left: 3px;
    vertical-align: -2px;
    background: var(--theme-color);
    border-radius: 2px;
    animation: typing-blink 0.9s steps(2, start) infinite;
  }

  @keyframes typing-blink {
    50% {
      opacity: 0;
    }
  }

  /* ==================== 输入区 ==================== */
  .input-shell {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    padding: 10px 10px 10px 16px;
    background: color-mix(in srgb, var(--default-box-color) 80%, transparent);
    border: 1px solid var(--art-card-border);
    border-radius: 18px;
    box-shadow: 0 4px 18px rgb(0 0 0 / 4%);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &.focused {
      border-color: color-mix(in srgb, var(--theme-color) 55%, transparent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-color) 14%, transparent);
    }
  }

  .chat-textarea {
    flex: 1;
    min-height: 22px;
    max-height: 160px;
    padding: 4px 0;
    font-family: inherit;
    font-size: 14px;
    line-height: 22px;
    color: var(--art-gray-900);
    resize: none;
    background: transparent;
    border: none;
    outline: none;

    &::placeholder {
      color: var(--art-gray-500);
    }
  }

  .send-btn {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: #fff;
    cursor: pointer;
    background: var(--theme-color);
    border: none;
    border-radius: 12px;
    transition:
      opacity 0.2s ease,
      transform 0.15s ease,
      background 0.2s ease;

    &:hover {
      opacity: 0.9;
    }

    &:active {
      transform: scale(0.94);
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    &.is-stop {
      background: transparent;
      border: 1.5px solid var(--theme-color);
    }

    .stop-icon {
      width: 12px;
      height: 12px;
      background: var(--theme-color);
      border-radius: 3px;
    }
  }
</style>
