# NewsSystemPro 开发日志汇总

## 2025-12-30 React 渲染问题
- **defaultOpenKeys 不生效**：非受控模式只在首次渲染生效，改用 useState 受控模式
- **selectedKeys 样式不生效**：异步数据导致样式计算问题，用 `key={meun.length}` 强制重新创建组件
- **侧边栏悬停展开**：添加 hovered 状态，鼠标移入时暂时展开收缩的侧边栏

## 2025-12-23 json-server 中间件方案
- **后端重构**：将 json-server 作为 Express 中间件，替代手动实现查询语法
- **数据分离**：启动时合并 db.json + news.json，写入时自动分离保存
- **路由优先级**：Express 自定义路由（JWT）优先，json-server 处理 CRUD

## 2025-12-19 Express + JWT 认证
- **bcrypt 加密**：用户密码使用 bcryptjs 加密存储
- **JWT 登录**：实现 /api/auth/login 返回 token
- **密码迁移**：创建脚本将明文密码迁移为 hash

## 2025-12-18 Redux + TypeScript
- **UserReducer**：管理用户登录状态
- **TypeScript 迁移**：Login.js → Login.tsx, TopHead.js → TopHead.tsx
- **类型定义**：src/types/index.ts 定义 User、RootState 等类型

## 2025-12-18 面包屑导航优化
- **路由路径修复**：统一路由格式
- **面包屑组件**：根据当前路径动态生成导航

## 2026-01-06 Vercel Serverless 适配

- **Express + JWT 内存模式**：改造 api/index.cjs 适配 Vercel Serverless
- **移除文件写入**：数据存储改为内存模式，刷新后重置
- **功能保留**：JWT 登录、注册（内存）、json-server CRUD 均可用
- **部署限制**：Serverless 只读，无法持久化数据修改

---

## 本次对话重点 (2025-12-30)

### Dashboard 首页优化
- 用户卡片移到顶部，改为横版布局
- 分类 Tag 使用 colorMap 多彩样式
- 热度前三条序号改为红橙渐变色

### 新闻撰写界面重构
- 三步流程合并为单页面编辑模式
- 顶部工具栏：分类选择 + 保存/提交按钮
- 标题输入：大字体无边框，类似 Medium 风格

### 侧边栏功能增强
- 收缩状态下鼠标悬停暂时展开
- 修复刷新后选中状态不显示的问题
- 修复收缩时子菜单悬浮的问题

### 数据库文档更新
- 更新后端架构说明（Express + json-server 中间件）
- 更新安全机制（JWT + bcrypt）
- 修正密码字段描述（明文 → 加密）

---

_最后更新: 2026-01-06_
