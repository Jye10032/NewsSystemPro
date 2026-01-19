# 📰 NewsSystemPro - 新闻管理系统

> 一个基于 React + Vite 的现代化新闻发布与管理平台

📖 [项目开发笔记](https://jye10032.github.io/NewsSystemPro/docs/)

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF.svg)](https://vitejs.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.1.7-1890FF.svg)](https://ant.design/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

[![CI/CD Pipeline](https://github.com/Jye10032/NewsSystemPro/actions/workflows/ci.yml/badge.svg)](https://github.com/Jye10032/NewsSystemPro/actions/workflows/ci.yml)
[![Deploy Status](https://github.com/Jye10032/NewsSystemPro/actions/workflows/deploy.yml/badge.svg)](https://github.com/Jye10032/NewsSystemPro/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/Jye10032/NewsSystemPro/branch/main/graph/badge.svg)](https://codecov.io/gh/Jye10032/NewsSystemPro)

## 🎯 项目简介

NewsSystemPro 是一个功能完整的新闻内容管理系统，提供从内容创作、审核流程到发布管理的全流程解决方案。系统采用前后端分离架构，具备完善的权限管理和数据可视化功能。

### 📚 项目演进

本项目基于 B站教程 [【React项目实战】React全家桶+Antd新闻管理系统项目](https://www.bilibili.com/video/BV1fw411d7R5) 进行学习和改进，从初始版本 [NewsSystem](https://github.com/Jye10032/NewsSystem) 持续迭代优化而来。

**改进历程**：
- 🔗 **初始版本**：[NewsSystem](https://github.com/Jye10032/NewsSystem) - 跟随 B站视频完成的基础实现
- 🚀 **当前版本**：NewsSystemPro - 在初始版本基础上进行了全面升级

**主要升级内容**：
- ✅ 升级到 Vite 构建工具（原项目使用 Create React App）
- ✅ 升级 React Router 到 v6（原项目使用 v5）
- ✅ 升级 Ant Design 到 v5（原项目使用 v4）
- ✅ 优化数据可视化效果（ECharts 图表）
- ✅ 改进代码结构和组件复用
- ✅ 添加完整的测试体系（Vitest + Testing Library）
- ✅ 集成 CI/CD 自动化流程（GitHub Actions）
- ✅ 优化 UI/UX 设计（现代化主题和交互）
- ✅ 添加更多注释和文档说明
- ✅ 优化用户体验细节

### ✨ 核心特性

- 🔐 **完善的权限系统** - 基于角色的访问控制（RBAC），支持超级管理员、区域管理员、编辑三种角色
- 📝 **富文本编辑器** - 集成 Draft.js，支持图片上传、格式化等功能
- 🔄 **完整的审核流程** - 草稿 → 待审核 → 已审核 → 已发布的完整生命周期管理
- 📊 **数据可视化** - 基于 ECharts 的访问量统计、点赞趋势、新闻分类分析
- 🎨 **现代化 UI** - 基于 Ant Design 5 构建，提供流畅的用户体验
- ⚡ **快速开发** - 使用 Vite 构建，享受极速的热更新体验
- 📱 **响应式设计** - 适配不同屏幕尺寸，支持移动端访问

## 🛠️ 技术栈

### 前端核心

- **框架**: React 18.2.0
- **构建工具**: Vite 4.4.5
- **UI 组件库**: Ant Design 5.1.7
- **路由**: React Router 6.21.3
- **状态管理**: Redux 5.0.1 + Redux Thunk + Redux Persist
- **数据请求**: Axios 1.7.7
- **富文本编辑**: React Draft Wysiwyg + Draft.js
- **数据可视化**: ECharts 5.4.1
- **样式**: Sass 1.58.0 + CSS Modules

### 后端服务

- **模拟服务**: json-server 0.17.3
- **并发运行**: concurrently 8.2.2

### 开发工具

- **代码规范**: ESLint 8.45.0
- **类型检查**: TypeScript types

## 📦 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/Jye10032/NewsSystemPro.git

# 进入项目目录
cd NewsSystemPro

# 安装依赖
npm install
```

### 启动项目

```bash
# 同时启动前端和后端服务
npm start

# 或者分别启动
npm run dev      # 启动前端开发服务器 (http://localhost:3000)
npm run server   # 启动后端模拟服务 (http://localhost:8000)
```

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | 123456 |
| 分类管理员 | tom | 123 |
| 分类编辑 | alice | 123 |

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 运行测试

```bash
# 运行所有测试
npm test

# 单次运行测试
npm run test:run

# 查看测试覆盖率
npm run test:coverage

# 打开测试 UI 界面
npm run test:ui
```

**当前测试覆盖率**: 92% (103个测试全部通过) ✅

查看详细测试指南: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

### 默认账户

系统预设了三种角色的测试账户：

| 角色 | 用户名 | 权限说明 |
|------|--------|----------|
| 超级管理员 | admin | 全站所有权限 |
| 区域管理员 | manager | 管理指定区域的内容 |
| 编辑 | editor | 创建和编辑新闻内容 |

## 📂 项目结构

```
NewsSystemPro/
├── public/                 # 静态资源
│   ├── docs/              # 开发文档
│   └── 404.html           # SPA 路由支持
├── src/
│   ├── router/            # 路由配置
│   │   ├── IndexRouter.js # 主路由
│   │   ├── NewsRouter.js  # 后台路由
│   │   └── AuthRoute.js   # 权限路由守卫
│   ├── modules/           # 功能模块
│   │   ├── login/         # 登录模块
│   │   ├── news/          # 新闻模块
│   │   │   ├── components/    # 组件 (NewsEditor)
│   │   │   └── pages/         # 页面 (NewsAdd, NewsDraft...)
│   │   ├── publish/       # 发布模块
│   │   │   ├── components/    # 组件 (NewsPublish)
│   │   │   ├── hooks/         # 自定义 Hook (usePublish)
│   │   │   └── pages/         # 页面 (Published, Unpublished...)
│   │   └── visitor/       # 访客模块
│   │       └── pages/         # 页面 (News, Detail)
│   ├── sandbox/           # 管理后台布局
│   │   ├── home/          # 首页仪表盘
│   │   ├── user-manage/   # 用户管理
│   │   ├── right-manage/  # 权限管理
│   │   └── audit-manage/  # 审核管理
│   ├── redux/             # Redux 状态管理
│   │   ├── store.js       # Store 配置
│   │   └── reducers/      # Reducers
│   ├── test/              # 测试文件
│   │   ├── components/    # 组件测试
│   │   ├── hooks/         # Hook 测试
│   │   ├── redux/         # Redux 测试
│   │   └── router/        # 路由测试
│   └── styles/            # 全局样式
├── db/                    # 数据库文件
│   ├── db.json            # 用户、权限、菜单数据
│   └── news.json          # 新闻数据
├── .github/workflows/     # CI/CD 配置
└── vite.config.js         # Vite 配置
```

## 🎨 功能模块

### 1. 用户与权限管理

- **用户管理**: 创建、编辑、删除用户，分配角色和区域
- **角色管理**: 超级管理员、区域管理员、编辑三种角色
- **权限控制**: 基于角色的页面访问控制和操作权限
- **区域管理**: 支持按地区划分管理权限

### 2. 新闻内容管理

- **新闻创建**: 富文本编辑器，支持格式化文本和图片上传
- **分类管理**: 灵活的新闻分类系统
- **草稿保存**: 自动保存草稿，防止内容丢失
- **新闻预览**: 发布前预览新闻效果
- **批量操作**: 支持批量删除、批量发布等操作

### 3. 审核流程

- **提交审核**: 编辑完成后提交审核
- **审核管理**: 管理员审核新闻内容
- **审核记录**: 完整的审核历史记录
- **状态管理**: 草稿 → 待审核 → 通过/驳回 → 发布

### 4. 发布管理

- **待发布**: 已审核通过但未发布的新闻
- **已发布**: 正在展示的新闻，支持编辑和下线
- **已下线**: 已撤下的新闻，支持重新发布

### 5. 数据统计

- **访问量统计**: 近两周每日浏览量趋势图
- **热门新闻**: 最常浏览和点赞最多的新闻排行
- **分类统计**: 新闻分类分布饼图
- **个人数据**: 用户个人新闻发布数据分析

### 6. 前台展示

- **新闻列表**: 按分类展示已发布的新闻
- **新闻详情**: 完整的新闻内容展示
- **互动功能**: 点赞、浏览量统计
- **响应式布局**: 适配各种设备

## 💡 技术亮点

### 1. 性能优化

- **代码分割**: 按需加载，减少初始加载时间
- **懒加载**: 路由组件懒加载
- **缓存策略**: 使用 Redux Persist 持久化状态
- **资源优化**: Vite 自动优化资源加载

### 2. 开发体验

- **热更新**: Vite 提供毫秒级的 HMR
- **路径别名**: 配置 `@` 别名简化导入路径
- **代理配置**: 开发环境 API 代理避免跨域问题
- **ESLint**: 统一代码风格

### 3. 架构设计

- **模块化**: 功能模块清晰分离
- **组件复用**: 抽取通用组件提高复用性
- **状态管理**: Redux 统一管理全局状态
- **路由守卫**: 保护需要权限的路由

### 4. 用户体验

- **加载动画**: 使用 NProgress 显示页面加载进度
- **消息提示**: Ant Design 的 Message 和 Notification 组件
- **表单验证**: 完善的表单验证机制
- **错误处理**: 友好的错误提示和处理

## 🔧 配置说明

### Vite 配置

```javascript
// vite.config.js
export default defineConfig({
  // React 插件配置
  plugins: [react()],

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // 开发服务器配置
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },

  // 构建优化
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          redux: ['redux', 'react-redux']
        }
      }
    }
  }
})
```

## 📸 项目截图

> 💡 提示：运行项目后可以截取实际页面截图替换此部分

### 登录页面
<!-- ![登录页面](./docs/screenshots/login.png) -->

### 管理后台首页
<!-- ![管理后台首页](./docs/screenshots/home.png) -->

### 新闻编辑
<!-- ![新闻编辑](./docs/screenshots/news-edit.png) -->

### 数据统计
<!-- ![数据统计](./docs/screenshots/statistics.png) -->

### 前台新闻展示
<!-- ![前台新闻展示](./docs/screenshots/news-list.png) -->

## 🚀 未来规划

- [x] 增加单元测试和 E2E 测试
- [ ] 实现真实的后端 API（替换 json-server）
- [ ] 添加评论功能
- [ ] 支持多语言（i18n）
- [ ] 增加新闻搜索功能
- [ ] 优化移动端体验
- [ ] 添加暗黑模式
- [ ] 实现消息通知系统
- [ ] 支持新闻标签系统
- [ ] 增加敏感词过滤

## 📝 开发日志

### v2.0.0 (2026-01)
- ✅ 项目结构模块化重组
- ✅ 菜单数据结构改为嵌套结构
- ✅ 优化菜单结构（合并用户与权限管理）
- ✅ 添加开发文档系统（Markdown 渲染）
- ✅ 测试覆盖率提升至 103 个测试用例
- ✅ 锁定 axios 版本为 1.7.7（修复兼容性问题）

### v1.0.0 (2023)
- ✅ 完成基础架构搭建
- ✅ 实现用户权限系统
- ✅ 完成新闻 CRUD 功能
- ✅ 集成富文本编辑器
- ✅ 实现审核流程
- ✅ 添加数据可视化
- ✅ 优化性能和用户体验

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👤 作者

- GitHub: [@Jye10032](https://github.com/Jye10032)

## 🙏 致谢

### 学习资源

- **原教程视频**: [【React项目实战】React全家桶+Antd新闻管理系统项目](https://www.bilibili.com/video/BV1fw411d7R5) - 感谢 UP主 提供的优质教程，本项目在此基础上进行了现代化改造和功能扩展

### 技术框架

- [React](https://reactjs.org/) - 用于构建用户界面的 JavaScript 库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言和 React 组件库
- [ECharts](https://echarts.apache.org/) - 强大的数据可视化库

---

⭐ 如果这个项目对你有帮助，欢迎 Star 支持！
