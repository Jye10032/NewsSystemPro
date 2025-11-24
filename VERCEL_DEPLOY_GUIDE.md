# Vercel 重新部署指南

## 方案 A：通过 Vercel Dashboard（最简单）

### 步骤 1：导入项目
1. 访问 https://vercel.com/dashboard
2. 点击 "Add New" → "Project"
3. 找到并选择 `NewsSystemPro` 仓库
4. 点击 "Import"

### 步骤 2：配置项目
项目配置保持默认即可：
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: 留空（我们只部署后端 API）
- **Output Directory**: 留空
- **Install Command**: `npm install`

### 步骤 3：部署
1. 点击 "Deploy" 按钮
2. 等待 1-2 分钟构建完成
3. 复制部署后的 URL

### 步骤 4：验证
访问以下端点测试：
- `https://你的域名.vercel.app/users`
- `https://你的域名.vercel.app/news`

---

## 方案 B：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI（如果未安装）
npm i -g vercel

# 2. 登录
vercel login

# 3. 在项目目录中部署
cd /Users/user/vscode/NewsSystemPro
vercel --prod

# 4. 按照提示操作：
#    - Set up and deploy? Y
#    - Which scope? 选择你的账号
#    - Link to existing project? N (如果是新项目)
#    - What's your project's name? newssystempro
#    - In which directory is your code located? ./
```

---

## 方案 C：检查现有项目配置

如果项目已存在但没有自动部署：

### 1. 检查 Git 集成
1. 进入项目 Settings → Git
2. 确认 Production Branch = `main`
3. 确认 Ignored Build Step 未启用

### 2. 手动触发部署
1. 进入 Deployments 页面
2. 点击最新部署旁边的菜单 (...)
3. 选择 "Redeploy"

### 3. 检查构建日志
如果部署失败：
1. 点击失败的部署
2. 查看 "Build Logs"
3. 查找错误信息

---

## 常见问题

### Q: 部署后仍然是旧版本？
A: 清除浏览器缓存，或使用 Vercel 提供的新 URL

### Q: 部署失败，提示找不到模块？
A: 确保 `package.json` 中包含 `json-server` 依赖

### Q: CORS 错误？
A: 已在 `api/index.js` 中配置，应该不会有问题

### Q: 数据库文件找不到？
A: 确保 `db/db.json` 和 `db/news.json` 都在仓库中

---

## 部署成功后

1. 复制 Vercel 提供的 URL
2. 更新前端配置：
   ```bash
   # 修改 .env.production
   VITE_API_BASE_URL=https://你的新URL.vercel.app
   ```
3. 重新部署前端（会自动触发 GitHub Pages）
