<div align="center">
  <img src="./src/assets/images/common/logo-title.png" alt="Art Design Pro" width="420" />
</div>

<br />

<p align="center">
  The frontend admin console of the <b>Art Engine</b> platform,<br />
  built with <b>Vue 3 · TypeScript · Vite · Element Plus · Tailwind CSS</b>.
</p>

<div align="center">English | <a href="./README.zh-CN.md">简体中文</a></div>

<br />

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE) [![stars](https://img.shields.io/github/stars/Luminous-Moon-X/art-engine-front)](https://github.com/Luminous-Moon-X/art-engine-front/stargazers) [![forks](https://img.shields.io/github/forks/Luminous-Moon-X/art-engine-front)](https://github.com/Luminous-Moon-X/art-engine-front/network/members)

</div>

<br />

## ✨ What makes this project special?

- **Beautiful and smooth** — a modern interface with polished interactions that feel like a commercial product
- **Ready-to-use components** — tables, forms, search bars, charts, rich-text editors and more, so you can assemble business pages quickly
- **Faster development** — common page patterns (lists, forms, charts…) are wrapped into easy-to-use building blocks
- **Flexible theming** — light / dark / follow-system themes, custom primary colors, multiple menu layouts, page transitions, watermark, lock screen and more
- **Multi-language** — Chinese and English are built in
- **Two running modes** — connect to the real backend, or run on built-in mock data with no backend at all
- **Clean start** — one command removes all demo data, leaving a clean base project

## 🖼️ Preview

<kbd><img src="./src/assets/images/common/light.png" alt="Light theme" /></kbd>

<kbd><img src="./src/assets/images/common/dark.png" alt="Dark theme" /></kbd>

## 🛠️ Tech Stack

Vue 3 · TypeScript · Vite · Vue Router · Pinia · Element Plus · Tailwind CSS · Axios · ECharts · vue-i18n · xlsx · Mock.js

Code quality: ESLint · Prettier · Stylelint · Husky · lint-staged · commitizen (cz-git)

## 🚀 Quick Start

**Requirements**: Node.js >= 20.19.0, pnpm >= 8.8.0

```bash
# install dependencies
pnpm install

# if pnpm install fails, try:
pnpm install --ignore-scripts

# start the dev server (default http://localhost:3006)
pnpm dev

# type-check and build for production (output to dist/)
pnpm build

# preview the production build
pnpm serve
```

### Useful Scripts

| Command                  | Description                  |
| ------------------------ | ---------------------------- |
| `pnpm dev`               | Start the dev server         |
| `pnpm build`             | Build for production         |
| `pnpm serve`             | Preview the production build |
| `pnpm lint` / `pnpm fix` | Code check / auto-fix        |
| `pnpm lint:prettier`     | Format code                  |
| `pnpm lint:stylelint`    | Fix styles                   |
| `pnpm commit`            | Commit with commitizen       |
| `pnpm clean:dev`         | Remove demo data             |

### Environment Variables

Main options in `.env` / `.env.development` / `.env.production`:

| Variable             | Description                                    | Default                 |
| -------------------- | ---------------------------------------------- | ----------------------- |
| `VITE_PORT`          | Dev server port                                | `3006`                  |
| `VITE_ACCESS_MODE`   | `backend` (real API) or `frontend` (mock data) | `backend`               |
| `VITE_API_URL`       | API base path                                  | `/`                     |
| `VITE_API_PROXY_URL` | Dev proxy target (backend address)             | `http://localhost:8080` |
| `VITE_BASE_URL`      | Deployment base path                           | `/`                     |

## 🔌 Backend Integration

This project is the frontend of the **Art Engine** platform. In `backend` mode (the default) requests go through `/api`, which is proxied to the backend during development:

- Dev: `VITE_API_PROXY_URL = http://localhost:8080` (Art Engine's default address)
- Prod: set `VITE_API_URL` to the real backend address

See the [Art Engine](https://github.com/Luminous-Moon-X/art-engine) backend repository.

## 🌐 Browser Compatibility

Chrome, Edge, Firefox, Safari and other modern browsers.

## 📄 License

[MIT](./LICENSE)
