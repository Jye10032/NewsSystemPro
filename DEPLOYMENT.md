# 部署指南

本项目采用前后端分离部署方案：
- 前端：GitHub Pages（静态托管）
- 后端：Vercel（动态API服务）

## 📦 后端部署到 Vercel

### 前置准备
1. 注册 [Vercel 账号](https://vercel.com)
2. 安装 Vercel CLI（可选）：`npm i -g vercel`

### 部署步骤

#### 方式一：通过 Vercel 网站（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New" → "Project"
3. 导入你的 GitHub 仓库
4. 配置项目：
   - Framework Preset: 选择 "Other"
   - Root Directory: `./` (保持默认)
   - Build Command: 留空
   - Output Directory: 留空
5. 点击 "Deploy"

部署完成后，Vercel 会提供一个 URL，例如：`https://newssystem-api.vercel.app`

#### 方式二：通过 CLI

```bash
# 登录 Vercel
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

### 重要配置说明

项目已包含以下配置文件：

- `server.js`: 独立的 json-server 服务器
- `vercel.json`: Vercel 部署配置
- `db/db.cjs`: 数据库文件（确保此文件存在）

## 🌐 前端部署到 GitHub Pages

### 配置后端 API 地址

1. 获取 Vercel 部署后的 URL
2. 修改 `.env.production` 文件：
   ```env
   VITE_API_BASE_URL=https://your-backend-url.vercel.app
   ```
3. 提交更改到 Git

### 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 手动触发部署：
   - 进入 Actions 标签页
   - 选择 "Deploy to GitHub Pages" workflow
   - 点击 "Run workflow"

部署成功后，前端将部署到：
```
https://<your-username>.github.io/<repo-name>/
```

## 🔧 本地开发

保持原有开发流程不变：

```bash
# 启动后端（json-server）
npm run serve

# 启动前端开发服务器
npm run dev
```

本地开发时，API 会自动使用 `.env.development` 中的配置（http://localhost:8000）

## 🚨 常见问题

### 1. 后端 CORS 错误
确保 `server.js` 中已配置 CORS：
```javascript
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
  next()
})
```

### 2. 数据库文件未找到
确保 `db/db.cjs` 文件存在且格式正确。Vercel 部署时会包含此文件。

### 3. API 请求失败
检查 `.env.production` 中的 `VITE_API_BASE_URL` 是否正确配置为 Vercel 部署后的 URL。

### 4. GitHub Pages 404 错误
如果是 SPA 路由问题，需要添加 `public/404.html` 重定向配置（已包含在项目中）。

## 📊 部署验证

部署完成后，验证以下内容：

- [ ] 后端 API 可访问：访问 `https://your-backend-url.vercel.app/users`
- [ ] 前端页面正常加载
- [ ] 登录功能正常
- [ ] 数据获取正常
- [ ] CRUD 操作正常

## 🔄 更新部署

### 更新后端
推送代码到 GitHub，Vercel 会自动重新部署。

### 更新前端
推送代码到 GitHub，或手动触发 GitHub Actions workflow。

## 💡 其他部署选项

如果不使用 Vercel，也可以选择：

- **Railway**: https://railway.app （支持 Node.js，免费额度）
- **Render**: https://render.com （免费套餐，但启动较慢）
- **Heroku**: https://heroku.com （需要绑定信用卡）
- **Glitch**: https://glitch.com （适合小型项目）

部署流程类似，主要是修改对应平台的配置文件。
