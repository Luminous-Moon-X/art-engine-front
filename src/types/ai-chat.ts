/**
 * AI对话相关类型
 */

/** 对话列表项 */
export interface AiConversationItem {
  /** 对话ID */
  conversationId: string
  /** 对话名称 */
  conversationName: string
  /** 对话轮次数 */
  turnCount: number
  /** 对话创建时间 */
  createTime: string
}

/** 对话消息类型 */
export type ChatMessageType = 'USER' | 'AI'

/** 对话消息项 */
export interface AiChatMessageItem {
  /** 消息类型：USER-用户消息 / AI-AI回答 */
  messageType: ChatMessageType
  /** 消息内容 */
  content: string
  /** 消息时间 */
  createTime: string
}

/** SSE流式对话完成事件 */
export interface AiChatDoneEvent {
  /** 对话ID */
  conversationId: string
  /** 对话名称（首轮完成后为AI总结的主题） */
  conversationName: string
  /** 对话轮次数 */
  turnCount: number
}

/** SSE流式对话错误事件 */
export interface AiChatErrorEvent {
  /** 错误信息 */
  message: string
}
