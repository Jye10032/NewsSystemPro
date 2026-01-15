# 首屏性能优化

## 背景

通过 Lighthouse 测试发现首屏加载性能有优化空间，主要问题是 JS 包体积过大。

## 优化措施

### 1. 分包策略

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        antd: ['antd'],
        redux: ['redux', 'react-redux', 'redux-thunk', 'redux-persist'],
      }
    }
  }
}
```

将第三方库拆分成独立文件，利用浏览器缓存。

### 2. 路由懒加载

```typescript
// NewsRouter.tsx
import { lazy, Suspense } from 'react'

// 懒加载组件
const Home = lazy(() => import('../sandbox/home/Home'))
const UserList = lazy(() => import('../sandbox/user-manage/UserList'))
// ...

// 使用 Suspense 包裹
<Suspense fallback={<Spin />}>
  <Routes>...</Routes>
</Suspense>
```

首屏只加载当前页面代码，其他页面按需加载。

## 优化效果

### JS 体积对比

| 版本 | 首屏 JS | 说明 |
|------|---------|------|
| 未优化 | 3.19 MB | 单文件，全部代码 |
| 分包 | 3.18 MB | 拆分但全部加载 |
| 懒加载 | 433 KB | 只加载框架代码 |

### Lighthouse 指标对比

| 指标 | 未优化 | 懒加载 | 提升 |
|------|--------|--------|------|
| FCP | 1.1s | 0.9s | 18% |
| LCP | 1.1s | 1.0s | 9% |
| TBT | 110ms | 0ms | 100% |
| Speed Index | 1.2s | 1.0s | 17% |

### 指标说明

- **FCP (First Contentful Paint)**: 首次内容绘制时间
- **LCP (Largest Contentful Paint)**: 最大内容绘制时间
- **TBT (Total Blocking Time)**: 主线程阻塞时间
- **Speed Index**: 页面可见内容填充速度

## 懒加载原理

**未优化**：
```
打开页面 → 下载 3MB JS → 解析执行 → 显示
```

**懒加载**：
```
打开页面 → 下载 433KB → 显示
         → 用户访问其他页面 → 按需下载
```

## 验证方法

1. 运行 `npm run build` 查看构建输出
2. 运行 `npm run preview` 启动预览
3. 打开 DevTools → Lighthouse → 测试 Performance
4. 打开 DevTools → Network → 查看首屏加载的文件

---

日期: 2026-01-12
