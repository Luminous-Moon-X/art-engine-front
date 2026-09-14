<div align="center">
  <img src="./src/assets/images/common/logo-title.png" alt="Art Design Pro" width="420" />
</div>

<br />

<p align="center">
  <b>Art Engine</b> 平台的前端管理后台，<br />
  基于 <b>Vue 3 · TypeScript · Vite · Element Plus · Tailwind CSS</b> 构建。
</p>

<div align="center"><a href="./README.md">English</a> | 简体中文</div>

<br />

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE) [![stars](https://img.shields.io/github/stars/Luminous-Moon-X/art-engine-front)](https://github.com/Luminous-Moon-X/art-engine-front/stargazers) [![forks](https://img.shields.io/github/forks/Luminous-Moon-X/art-engine-front)](https://github.com/Luminous-Moon-X/art-engine-front/network/members)

</div>

<br />

## ✨ 这个项目有什么特别之处？

- **好看又流畅**：现代化界面设计，交互体验媲美商业产品
- **组件拿来即用**：表格、表单、搜索栏、图表、富文本编辑器等常用组件开箱即用，快速拼装业务页面
- **开发更高效**：列表、表单、图表等常见页面模式已封装成易用的积木式能力
- **主题灵活多变**：浅色 / 暗黑 / 跟随系统主题、自定义主题色、多种菜单布局、页面过渡动画、水印、锁屏等
- **多语言**：内置中英文切换
- **两种运行模式**：可对接真实后端，也可以不依赖后端、使用内置 Mock 数据直接运行演示
- **干净起步**：一条命令清理全部演示数据，得到可直接开发的工程

## 🖼️ 预览

<kbd><img src="./src/assets/images/common/light.png" alt="浅色主题" /></kbd>

<kbd><img src="./src/assets/images/common/dark.png" alt="暗黑主题" /></kbd>

## 🛠️ 技术栈

Vue 3 · TypeScript · Vite · Vue Router · Pinia · Element Plus · Tailwind CSS · Axios · ECharts · vue-i18n · xlsx · Mock.js

代码规范：ESLint · Prettier · Stylelint · Husky · lint-staged · commitizen (cz-git)

## 🚀 快速开始

**环境要求**：Node.js >= 20.19.0，pnpm >= 8.8.0

```bash
# 安装依赖
pnpm install

# 如果安装失败，尝试：
pnpm install --ignore-scripts

# 启动本地开发环境（默认 http://localhost:3006）
pnpm dev

# 类型检查并打包生产环境（输出到 dist/）
pnpm build

# 预览生产构建产物
pnpm serve
```

### 常用脚本

| 命令                     | 说明                   |
| ------------------------ | ---------------------- |
| `pnpm dev`               | 启动开发环境           |
| `pnpm build`             | 打包生产环境           |
| `pnpm serve`             | 预览构建产物           |
| `pnpm lint` / `pnpm fix` | 代码检查 / 自动修复    |
| `pnpm lint:prettier`     | 格式化代码             |
| `pnpm lint:stylelint`    | 修复样式               |
| `pnpm commit`            | 规范提交（commitizen） |
| `pnpm clean:dev`         | 清理演示数据           |

### 环境变量

主要配置项位于 `.env`、`.env.development`、`.env.production`：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `VITE_PORT` | 开发服务器端口 | `3006` |
| `VITE_ACCESS_MODE` | `backend`（对接真实接口）/ `frontend`（Mock 数据） | `backend` |
| `VITE_API_URL` | API 请求基础路径 | `/` |
| `VITE_API_PROXY_URL` | 开发环境代理目标（后端地址） | `http://localhost:8080` |
| `VITE_BASE_URL` | 应用部署基础路径 | `/` |

## 🔌 后端联调

本项目是 **Art Engine** 平台的前端。在 `backend` 模式（默认）下，请求通过 `/api` 前缀访问后端，开发环境由 Vite 代理转发：

- 开发环境：`VITE_API_PROXY_URL = http://localhost:8080`（Art Engine 默认地址）
- 生产环境：将 `VITE_API_URL` 配置为真实后端地址

服务端实现请参见 [Art Engine](https://github.com/Luminous-Moon-X/art-engine) 后端仓库。

## 🌐 浏览器兼容性

支持 Chrome、Edge、Firefox、Safari 等现代主流浏览器。

## 📄 License

[MIT](./LICENSE)
