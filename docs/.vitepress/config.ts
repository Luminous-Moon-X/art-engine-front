import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Art Engine',
  description: '一个现代化的后台管理系统',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  /**
   * 多语言配置：必须放在顶层（站点配置）中。
   * 只有这里定义了多个语言，右上角的语言切换菜单才会出现；
   * 每个语言自己的导航、侧边栏、界面文案写在各自的 `themeConfig` 中。
   *
   * - `root`：默认语言（简体中文），首页为 `/`，文档位于 `/zh/` 目录
   * - `en`：英文，首页与文档均位于 `/en/` 目录
   */
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-Hans',
      dir: 'ltr',
      link: '/',
      title: 'Art Engine',
      description: '一个现代化的后台管理系统',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: '功能说明', link: '/zh/guide/what-is-art-engine' },
          { text: '开发说明', link: '/zh/dev/' }
        ],
        sidebar: {
          // 该 key 同时覆盖 /zh/guide/features/ 下的功能说明页面
          '/zh/guide/': [
            { text: '什么是 Art Engine?', link: '/zh/guide/what-is-art-engine' },
            { text: '快速开始', link: '/zh/guide/quick-start' },
            { text: '部署', link: '/zh/guide/deploy' },
            {
              text: '功能说明',
              items: [
                { text: '登录与认证', link: '/zh/guide/features/login' },
                {
                  text: '系统管理',
                  items: [
                    { text: '账号管理', link: '/zh/guide/features/account' },
                    { text: '组织管理', link: '/zh/guide/features/org' },
                    { text: '角色管理', link: '/zh/guide/features/role' },
                    { text: '功能权限管理', link: '/zh/guide/features/permission' },
                    { text: '数据字典', link: '/zh/guide/features/dict' },
                    { text: '规则管理', link: '/zh/guide/features/rule' },
                    { text: '日志管理', link: '/zh/guide/features/log' }
                  ]
                },
                {
                  text: '平台能力',
                  items: [
                    { text: '租户管理', link: '/zh/guide/features/tenant' },
                    { text: '文件管理', link: '/zh/guide/features/file' },
                    { text: '知识库与 AI 问答', link: '/zh/guide/features/knowledge' }
                  ]
                },
                { text: '个人中心', link: '/zh/guide/features/profile' },
                { text: '界面与通用操作', link: '/zh/guide/features/ux' }
              ]
            }
          ]
        },
        outline: { label: '本页目录', level: [2, 3] },
        docFooter: { prev: '上一篇', next: '下一篇' },
        langMenuLabel: '切换语言',
        darkModeSwitchLabel: '外观',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        navMenuLabel: '主导航',
        mobileMenuLabel: '菜单',
        extraMenuLabel: '更多选项',
        skipToContentLabel: '跳转到正文',
        notFound: {
          title: '页面不存在',
          quote: '页面可能已被移动或删除，请检查地址是否正确。',
          link: '/',
          linkLabel: '返回首页',
          linkText: '返回首页'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      dir: 'ltr',
      link: '/en/',
      title: 'Art Engine',
      description: 'A modern back-end management system',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Features', link: '/en/guide/what-is-art-engine' },
          { text: 'Development Guide', link: '/en/dev/' }
        ],
        sidebar: {
          // This key also covers the feature pages under /en/guide/features/
          '/en/guide/': [
            { text: 'What is Art Engine?', link: '/en/guide/what-is-art-engine' },
            { text: 'Quick Start', link: '/en/guide/quick-start' },
            { text: 'Deploy', link: '/en/guide/deploy' },
            {
              text: 'Features',
              items: [
                { text: 'Login & Authentication', link: '/en/guide/features/login' },
                {
                  text: 'System Management',
                  items: [
                    { text: 'Account Management', link: '/en/guide/features/account' },
                    { text: 'Organization Management', link: '/en/guide/features/org' },
                    { text: 'Role Management', link: '/en/guide/features/role' },
                    {
                      text: 'Feature Permission Management',
                      link: '/en/guide/features/permission'
                    },
                    { text: 'Data Dictionary', link: '/en/guide/features/dict' },
                    { text: 'Rule Management', link: '/en/guide/features/rule' },
                    { text: 'Log Management', link: '/en/guide/features/log' }
                  ]
                },
                {
                  text: 'Platform Capabilities',
                  items: [
                    { text: 'Tenant Management', link: '/en/guide/features/tenant' },
                    { text: 'File Management', link: '/en/guide/features/file' },
                    { text: 'Knowledge Base & AI Chat', link: '/en/guide/features/knowledge' }
                  ]
                },
                { text: 'User Center', link: '/en/guide/features/profile' },
                { text: 'UI & Common Operations', link: '/en/guide/features/ux' }
              ]
            }
          ]
        },
        outline: { label: 'On this page', level: [2, 3] },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        langMenuLabel: 'Change language',
        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light theme',
        darkModeSwitchTitle: 'Switch to dark theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to top',
        navMenuLabel: 'Main Navigation',
        mobileMenuLabel: 'Menu',
        extraMenuLabel: 'More options',
        skipToContentLabel: 'Skip to content',
        notFound: {
          title: 'Page Not Found',
          quote: 'This page could not be found. It may have been moved or deleted.',
          link: '/en/',
          linkLabel: 'Go to home',
          linkText: 'Take me home'
        }
      }
    }
  },
  // 所有语言共享的主题配置（各语言的 themeConfig 会覆盖同名项）
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: 'https://github.com/Luminous-Moon-X/art-engine' }],
    /**
     * 语言切换链接解析。
     *
     * VitePress 默认把「当前页面路径」直接拼到语言目录后面，无法处理
     * 「中文首页在 `/`、中文文档却在 `/zh/`」这种结构，因此这里手动接管：
     *
     * 1. 目标语言下存在同名页面时，替换语言目录前缀即可；
     * 2. 英文站点已与中文站点一一对应，未翻译的页面仍回退到英文首页，避免出现 404；
     * 3. 没有对应页面时回退到目标语言的首页（例如 `/` 与 `/en/` 互为对应页）。
     *
     * 注意：该函数会被序列化进客户端产物，不能引用模块作用域中的变量/函数，
     * 所以相关配置都写在函数内部。
     */
    i18nRouting: (data, route, targetLocale) => {
      // 各语言文档所在的目录（root 的首页在站点根目录，文档在 zh 目录）
      const localeDirs: Record<string, string> = { root: 'zh', en: 'en' }
      // 英文站点已翻译的页面（相对于 en 目录），其余页面回退到英文首页
      const enPages = [
        'guide/what-is-art-engine',
        'guide/quick-start',
        'guide/deploy',
        'guide/features/login',
        'guide/features/account',
        'guide/features/org',
        'guide/features/role',
        'guide/features/permission',
        'guide/features/dict',
        'guide/features/rule',
        'guide/features/log',
        'guide/features/tenant',
        'guide/features/file',
        'guide/features/knowledge',
        'guide/features/profile',
        'guide/features/ux',
        'dev'
      ]
      const locales = data.site.value.locales
      const localeHome = (key: string) => locales[key]?.link || (key === 'root' ? '/' : `/${key}/`)

      const currentDir = localeDirs[data.localeIndex.value] ?? data.localeIndex.value
      const targetDir = localeDirs[targetLocale] ?? targetLocale
      const relativePath = route.data.relativePath
      const prefix = `${currentDir}/`

      if (currentDir && relativePath.startsWith(prefix)) {
        const pagePath = relativePath
          .slice(prefix.length)
          .replace(/(^|\/)index\.md$/, '$1')
          .replace(/\.md$/, '')
          // 目录首页（如 dev/index.md）会剩下结尾斜杠，统一去掉再比对
          .replace(/\/$/, '')

        if (pagePath) {
          if (targetLocale === 'en' && !enPages.includes(pagePath)) {
            return localeHome('en')
          }

          return `/${targetDir}/${pagePath}`.replace(/\/{2,}/g, '/')
        }
      }

      return localeHome(targetLocale)
    }
  }
})
