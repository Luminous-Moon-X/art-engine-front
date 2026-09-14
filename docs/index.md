---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Art Engine'
  text: '一个现代化的后台管理系统'
  tagline: 美观、优雅、安全、快捷和AI集成
  # 首页标题 / 描述右侧的大 Logo；尺寸在 docs/.vitepress/theme/custom.css 中调整
  image:
    src: /logo-big.png
    alt: Art Engine
  actions:
    - theme: brand
      text: 什么是Art Engine?
      link: /zh/guide/what-is-art-engine
    - theme: alt
      text: 快速开始
      link: /zh/guide/quick-start

features:
  - title: 最新主流技术栈
    details: 采用Java21、Spring Boot 3.x、Vue 3、Typescript等最新主流技术
  - title: 速度真的很快
    details: 独特设计二级缓存机制，服务启动自动加载常用数据为两级缓存，保证极快速度和数据安全
  - title: 界面美观
    details: 兼具设计美学与高效开发，提供主题色、布局模式、暗色模式和系统配置示例
  - title: 集成AI
    details: 支持配置本地部署AI，上传文档构建本地知识库，涉密文档保护，保障数据安全
---
