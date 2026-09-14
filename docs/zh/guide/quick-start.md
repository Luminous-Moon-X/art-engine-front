# 快速开始

## 环境要求

| 依赖       | 版本要求   |
| ---------- | ---------- |
| Node.js    | >= 20.19.0 |
| pnpm       | >= 8.8.0   |
| Java       | >= 21      |
| postgresql | 17.10      |

## 第一步：拉取项目

```bash
# 获取前端
git pull https://github.com/Luminous-Moon-X/art-engine-front.git

# 获取后端
git pull https://github.com/Luminous-Moon-X/art-engine.git
```

## 第二步：启动后端

1. 修改**application-dev.yml**中的数据库、Redis配置
2. 启动Spring Boot，服务默认地址为：http://127.0.0.1:8089/

## 第三步 启动前端

将**env.development**中的**VITE_API_PROXY_URL**修改为后端服务地址

```bash
# 安装pnpm（如果没安装）
npm install -g pnpm

# 安装依赖
pnpm install

# 如果安装失败，可以尝试
pnpm install --ignore-scripts

# 启动服务
pnpm dev
```

启动成功后，浏览器访问: http://127.0.0.1:3006/

## 第四步：登录

登录页需要填写账号、密码，并按住滑块拖到最右侧完成验证。

| 角色           | 账号         | 密码     |
| -------------- | ------------ | -------- |
| 超级管理员     | `superadmin` | `123456` |
| 默认租户管理员 | `admin`      | `123456` |

## 常用命令

| 命令              | 说明                                     |
| ----------------- | ---------------------------------------- |
| `pnpm dev`        | 启动开发环境（默认 3006 端口）           |
| `pnpm build`      | 类型检查并打包生产环境（输出到 `dist/`） |
| `pnpm serve`      | 本地预览打包结果                         |
| `pnpm docs:dev`   | 启动本地文档站（8086 端口）              |
| `pnpm docs:build` | 打包文档站                               |
| `pnpm clean:dev`  | 清理全部演示数据，得到一个干净的工程     |

## 环境变量速查

| 变量                 | 说明                 | 默认值                  |
| -------------------- | -------------------- | ----------------------- |
| `VITE_PORT`          | 开发服务器端口       | `3006`                  |
| `VITE_API_URL`       | 接口请求基础路径     | 开发环境为 `/`          |
| `VITE_API_PROXY_URL` | 开发环境接口代理目标 | `http://localhost:8080` |
| `VITE_BASE_URL`      | 应用部署基础路径     | `/`                     |

## 下一步

- 需要发布到服务器：[部署](./deploy)
- 想了解每个功能怎么操作：[功能说明](./features/login)
