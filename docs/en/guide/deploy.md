# Deploy

Once built, the frontend is **pure static files** and can be deployed to Nginx, Apache, IIS, object storage, or any static hosting platform. This guide uses Nginx as an example.

## 1. Before You Deploy

Confirm the backend service address (the Art Engine backend, `http://localhost:8089` by default).

## 2. Build the Backend

```bash
gradle clean build
```

## 3. Build the Frontend

```bash
pnpm install
pnpm run build
```

## 4. Deploy to Nginx

Upload the files in the `dist/` directory to your server (for example `/usr/share/nginx/html`), and use the following Nginx configuration as a reference:

```nginx
server {
    listen       3006;
    server_name  your-domain.com;
    root         /usr/share/nginx/html;
    index        index.html;

    # Single-page application: fall back to index.html for paths that do not exist
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Serve the .gz files generated at build time instead of compressing on the fly
    gzip_static on;

    # Reverse proxy for the API (used together with VITE_API_URL = /)
    location /api/ {
        proxy_pass http://127.0.0.1:8089;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

After changing the configuration, run `nginx -t` to check the syntax, then `nginx -s reload` to apply it.

## 6. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| A 404 when refreshing the page | The server is missing the single-page application fallback; add `try_files $uri $uri/ /index.html` |
| Blank page, 404 for static assets | `VITE_BASE_URL` does not match the actual deployment path; set it again and rebuild |
| API 404 or cross-origin errors | `VITE_API_URL` does not point to the real backend, or the reverse proxy is not configured |
| Slow first load | Check that gzip is enabled on the server (this project already generates `.gz` files, so Nginx can turn on `gzip_static`) |
| Empty menu after logging in | In backend mode the menu comes from the API; check that the backend returns menu data correctly |
