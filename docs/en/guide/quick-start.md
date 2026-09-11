# Quick Start

## Requirements

| Dependency | Version requirement |
| ---------- | ------------------- |
| Node.js    | >= 20.19.0          |
| pnpm       | >= 8.8.0            |
| Java       | >= 21               |
| postgresql | 17.10               |

## Step 1: Fetch the Repositories

```bash
# Get the frontend
git pull https://github.com/Luminous-Moon-X/art-engine-front.git

# Get the backend
git pull https://github.com/Luminous-Moon-X/art-engine.git
```

## Step 2: Start the Backend

1. Modify the database and Redis configuration in **application-dev.yml**
2. Start Spring Boot; the service is available at http://127.0.0.1:8089/ by default

## Step 3: Start the Frontend

Change **VITE_API_PROXY_URL** in **env.development** to the backend service address.

```bash
# Install pnpm (if it is not installed yet)
npm install -g pnpm

# Install dependencies
pnpm install

# If the installation fails, try
pnpm install --ignore-scripts

# Start the dev server
pnpm dev
```

Once it starts successfully, open http://127.0.0.1:3006/ in your browser.

## Step 4: Log In

On the login page, enter your account and password, then press the slider and drag it all the way to the right to complete the verification.

| Role                 | Account      | Password |
| -------------------- | ------------ | -------- |
| Super Admin          | `superadmin` | `123456` |
| Default Tenant Admin | `admin`      | `123456` |

## Common Commands

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `pnpm dev`        | Start the development environment (port 3006 by default) |
| `pnpm build`      | Type-check and build for production (output to `dist/`)  |
| `pnpm serve`      | Preview the build output locally                         |
| `pnpm docs:dev`   | Start the local documentation site (port 8086)           |
| `pnpm docs:build` | Build the documentation site                             |
| `pnpm clean:dev`  | Clear all demo data to get a clean project               |

## Environment Variable Reference

| Variable | Description | Default value |
| --- | --- | --- |
| `VITE_PORT` | Development server port | `3006` |
| `VITE_API_URL` | Base path for API requests | `/` in development |
| `VITE_API_PROXY_URL` | API proxy target for the development environment | `http://localhost:8080` |
| `VITE_BASE_URL` | Base path for application deployment | `/` |

## Next Steps

- Need to publish to a server: [Deploy](./deploy)
- Want to learn how each feature is operated: [Features](./features/login)
