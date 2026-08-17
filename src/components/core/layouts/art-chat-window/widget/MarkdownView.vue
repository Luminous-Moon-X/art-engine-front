<!-- Markdown渲染组件 -->
<template>
  <div class="markdown-view" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
  import MarkdownIt from 'markdown-it'
  import hljs from 'highlight.js/lib/core'
  import javascript from 'highlight.js/lib/languages/javascript'
  import typescript from 'highlight.js/lib/languages/typescript'
  import java from 'highlight.js/lib/languages/java'
  import python from 'highlight.js/lib/languages/python'
  import json from 'highlight.js/lib/languages/json'
  import xml from 'highlight.js/lib/languages/xml'
  import css from 'highlight.js/lib/languages/css'
  import sql from 'highlight.js/lib/languages/sql'
  import bash from 'highlight.js/lib/languages/bash'
  import markdown from 'highlight.js/lib/languages/markdown'
  import 'highlight.js/styles/github.css'

  defineOptions({ name: 'MarkdownView' })

  // 按需注册常用语言，控制打包体积
  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('typescript', typescript)
  hljs.registerLanguage('java', java)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('html', xml)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('sql', sql)
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('shell', bash)
  hljs.registerLanguage('markdown', markdown)

  const props = defineProps<{
    /** Markdown原文 */
    content: string
  }>()

  const md = new MarkdownIt({
    // 不渲染原始HTML，避免XSS
    html: false,
    linkify: true,
    breaks: true,
    highlight: (code: string, lang: string): string => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        } catch {
          // 高亮失败时降级为转义展示
        }
      }
      return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
    }
  })

  // 链接统一新窗口打开
  type LinkOpenRule = NonNullable<typeof md.renderer.rules.link_open>
  const defaultLinkOpen: LinkOpenRule =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  const renderedHtml = computed(() => md.render(props.content || ''))
</script>

<style scoped lang="scss">
  .markdown-view {
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;

    :deep(p) {
      margin: 4px 0;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 10px 0 6px;
      font-weight: 600;
      line-height: 1.4;
    }

    :deep(h1) {
      font-size: 20px;
    }

    :deep(h2) {
      font-size: 18px;
    }

    :deep(h3) {
      font-size: 16px;
    }

    :deep(h4),
    :deep(h5),
    :deep(h6) {
      font-size: 15px;
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 20px;
      margin: 4px 0;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      margin: 2px 0;
    }

    :deep(blockquote) {
      padding: 2px 10px;
      margin: 6px 0;
      color: var(--art-gray-600);
      border-left: 3px solid var(--art-gray-400);
    }

    :deep(a) {
      color: var(--theme-color);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    :deep(code) {
      padding: 2px 5px;
      font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
      font-size: 14px;
      color: inherit;
      background-color: color-mix(in srgb, var(--art-gray-400) 40%, transparent);
      border-radius: 4px;
    }

    :deep(pre.hljs) {
      padding: 10px 12px;
      margin: 8px 0;
      overflow-x: auto;
      border: 1px solid var(--art-card-border);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
    }

    :deep(pre code) {
      padding: 0;
      font-size: 14px;
      color: inherit;
      background-color: transparent;
    }

    :deep(table) {
      margin: 6px 0;
      border-collapse: collapse;
    }

    :deep(th),
    :deep(td) {
      padding: 4px 10px;
      border: 1px solid var(--art-card-border);
    }

    :deep(th) {
      font-weight: 600;
      background-color: var(--art-gray-200);
    }

    :deep(hr) {
      margin: 10px 0;
      border: none;
      border-top: 1px solid var(--art-card-border);
    }

    :deep(img) {
      max-width: 100%;
      border-radius: 6px;
    }
  }

  /* ==================== 代码块暗色主题 ==================== */

  /* highlight.js 的 github.css 主题固定为白底，暗色模式下覆盖为 GitHub Dark 配色 */
  :global(.dark .hljs) {
    color: #c9d1d9;
    background: #0d1117;
  }

  :global(.dark .hljs-doctag),
  :global(.dark .hljs-keyword),
  :global(.dark .hljs-meta .hljs-keyword),
  :global(.dark .hljs-template-tag),
  :global(.dark .hljs-template-variable),
  :global(.dark .hljs-type),
  :global(.dark .hljs-variable.language_) {
    color: #ff7b72;
  }

  :global(.dark .hljs-title),
  :global(.dark .hljs-title.class_),
  :global(.dark .hljs-title.class_.inherited__),
  :global(.dark .hljs-title.function_) {
    color: #d2a8ff;
  }

  :global(.dark .hljs-attr),
  :global(.dark .hljs-attribute),
  :global(.dark .hljs-literal),
  :global(.dark .hljs-meta),
  :global(.dark .hljs-number),
  :global(.dark .hljs-operator),
  :global(.dark .hljs-variable),
  :global(.dark .hljs-selector-attr),
  :global(.dark .hljs-selector-class),
  :global(.dark .hljs-selector-id) {
    color: #79c0ff;
  }

  :global(.dark .hljs-regexp),
  :global(.dark .hljs-string),
  :global(.dark .hljs-meta .hljs-string) {
    color: #a5d6ff;
  }

  :global(.dark .hljs-built_in),
  :global(.dark .hljs-symbol) {
    color: #ffa657;
  }

  :global(.dark .hljs-comment),
  :global(.dark .hljs-code),
  :global(.dark .hljs-formula) {
    color: #8b949e;
  }

  :global(.dark .hljs-name),
  :global(.dark .hljs-quote),
  :global(.dark .hljs-selector-tag),
  :global(.dark .hljs-selector-pseudo) {
    color: #7ee787;
  }

  :global(.dark .hljs-subst) {
    color: #c9d1d9;
  }

  :global(.dark .hljs-section) {
    font-weight: bold;
    color: #1f6feb;
  }

  :global(.dark .hljs-bullet) {
    color: #f2cc60;
  }

  :global(.dark .hljs-emphasis) {
    font-style: italic;
    color: #c9d1d9;
  }

  :global(.dark .hljs-strong) {
    font-weight: bold;
    color: #c9d1d9;
  }

  :global(.dark .hljs-addition) {
    color: #aff5b4;
    background-color: #033a16;
  }

  :global(.dark .hljs-deletion) {
    color: #ffdcd7;
    background-color: #67060c;
  }
</style>
