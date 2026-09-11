# 部署

前端打包后是**纯静态文件**，可以部署到 Nginx、Apache、IIS、对象存储或任意静态托管平台。本文以 Nginx 为例。

## 一、部署前准备

确认后端服务地址（Art Engine 后端，本地默认 `http://localhost:8089`）

## 二、后端打包

```bash
gradle clean build
```

## 三、前端打包

```bash
pnpm install
pnpm run build
```

## 四、部署到 Nginx

把 `dist/` 目录中的文件上传到服务器（例如 `/usr/share/nginx/html`），Nginx 配置参考：

```nginx
server {
    listen       3006;
    server_name  your-domain.com;
    root         /usr/share/nginx/html;
    index        index.html;

    # 单页应用：找不到的路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 直接使用打包时生成的 .gz 文件，省去服务器实时压缩
    gzip_static on;

    # 接口反向代理（与 VITE_API_URL = / 搭配使用）
    location /api/ {
        proxy_pass http://127.0.0.1:8089;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

修改配置后执行 `nginx -t` 检查语法，再 `nginx -s reload` 生效。

## 六、常见问题

| 现象 | 原因与处理 |
| --- | --- |
| 刷新页面出现 404 | 服务器缺少单页应用回退，补上 `try_files $uri $uri/ /index.html` |
| 页面空白、静态资源 404 | `VITE_BASE_URL` 与实际部署路径不一致，重新设置后打包 |
| 接口 404 或跨域报错 | `VITE_API_URL` 未指向真实后端，或反向代理未配置 |
| 首次加载偏慢 | 确认服务器已启用 gzip（本项目已生成 `.gz` 文件，Nginx 可开 `gzip_static`） |
| 登录后菜单为空 | 后端模式下菜单来自接口，检查后端是否正常返回菜单数据 |
