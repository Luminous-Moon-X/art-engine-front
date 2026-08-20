/**
 * AI对话相关接口
 */

import request from '@/utils/http'
import { useUserStore } from '@/store/modules/user'
import { fetchKnowledgeBasePage } from '@/api/knowledge-base'
import type {
  AiChatDoneEvent,
  AiChatErrorEvent,
  AiChatMessageItem,
  AiConversationItem
} from '@/types/ai-chat'

/**
 * 获取当前登录用户的所有对话
 */
export function fetchAiConversations() {
  return request.get<AiConversationItem[]>({
    url: '/api/ai/conversations'
  })
}

/**
 * 获取指定对话的全部消息内容
 */
export function fetchAiChatMessages(conversationId: string) {
  return request.get<AiChatMessageItem[]>({
    url: `/api/ai/conversations/${conversationId}/messages`
  })
}

/** SSE流式对话回调 */
export interface ChatStreamCallbacks {
  /** 收到AI回答增量内容 */
  onMessage: (content: string) => void
  /** 对话完成（携带对话信息） */
  onDone: (event: AiChatDoneEvent) => void
  /** 对话出错 */
  onError: (error: Error) => void
}

/**
 * 以SSE方式发起流式AI对话
 *
 * 后端事件约定：
 * - event: message —— data为AI回答的增量内容（JSON字符串）
 * - event: done —— data为对话信息（对话ID、对话名称、轮次数）
 * - event: error —— data为错误信息
 */

/**
 * 获取所有可选知识库（用于AI聊天选择知识库，label为kb_name、value为id）
 */
export async function fetchAiKnowledgeBases(): Promise<{ value: number; label: string }[]> {
  const res = await fetchKnowledgeBasePage({ pageNumber: 1, pageSize: 999 })
  return (res?.records || []).map((item) => ({ value: item.id, label: item.kbName }))
}
/**
 * 重命名对话
 *
 * @param conversationId 对话ID
 * @param newName        新对话名称
 */
export function renameAiConversation(conversationId: string, newName: string) {
  return request.put<boolean>({
    url: '/api/ai/conversations/rename',
    data: { conversationId, newName }
  })
}

/**
 * 删除对话（连同其下全部消息，不可恢复）
 *
 * @param conversationId 对话ID
 */
export function deleteAiConversation(conversationId: string) {
  return request.del<boolean>({
    url: `/api/ai/conversations/${encodeURIComponent(conversationId)}`
  })
}

export async function streamAiChat(
  payload: { chatId: string; question: string; kbId?: number | null },
  callbacks: ChatStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const { accessToken } = useUserStore()
  const baseURL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

  const response = await fetch(`${baseURL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken
        ? {
            Authorization: accessToken,
            satoken: accessToken
          }
        : {})
    },
    body: JSON.stringify(payload),
    signal
  })

  // 后端异常统一返回JSON（HTTP 200 + code != 200），非SSE流
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/event-stream')) {
    let message = 'AI服务请求失败'
    try {
      const body = await response.json()
      if (body && typeof body.msg === 'string' && body.msg) {
        message = body.msg
      }
    } catch {
      // 忽略JSON解析失败，使用默认错误信息
    }
    throw new Error(message)
  }
  if (!response.body) {
    throw new Error('当前浏览器不支持流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  const handleBlock = (block: string): void => {
    let eventName = 'message'
    let data = ''
    const lines = block.split('\n')
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        data += line.slice(5).replace(/^ /, '')
      }
    }
    if (!data) return
    if (eventName === 'message') {
      try {
        callbacks.onMessage(JSON.parse(data) as string)
      } catch {
        callbacks.onMessage(data)
      }
    } else if (eventName === 'done') {
      try {
        callbacks.onDone(JSON.parse(data) as AiChatDoneEvent)
      } catch {
        // 完成事件解析失败不影响主流程
      }
    } else if (eventName === 'error') {
      try {
        const event = JSON.parse(data) as AiChatErrorEvent
        callbacks.onError(new Error(event.message || 'AI服务异常'))
      } catch {
        callbacks.onError(new Error('AI服务异常'))
      }
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let separatorIndex = buffer.indexOf('\n\n')
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex)
      buffer = buffer.slice(separatorIndex + 2)
      if (block.trim()) {
        handleBlock(block)
      }
      separatorIndex = buffer.indexOf('\n\n')
    }
  }
  // 流结束时处理缓冲区中残留的最后一块
  if (buffer.trim()) {
    handleBlock(buffer)
  }
}
