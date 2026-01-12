# 响应式布局与移动端适配

## 背景

为新闻管理系统添加移动端支持，实现抽屉式导航布局。

## CSS 文件重组

将样式文件从组件目录移动到统一的 styles 目录：

```
src/styles/
└── NewsSandBox.css    # 从 src/sandbox/ 移动过来
```

## 移动端适配方案

### 媒体查询

```css
@media screen and (max-width: 768px) {
    /* 移动端样式 */
}
```

判断逻辑：`window.innerWidth <= 768`

### 为什么用 position: fixed 而不是 Flex？

**电脑端**：Flex 并排布局（Ant Design 默认）
- Sider 200px + Content 自适应

**移动端问题**：
- 屏幕宽度窄（如 400px）
- Sider 200px + Content 200px = 内容区太挤
- 用户体验差

**解决方案**：抽屉式导航
- `position: fixed` 让侧边栏脱离文档流
- 内容区可全宽显示
- 侧边栏作为浮层覆盖在内容上方
- 点击菜单按钮滑入/滑出

### 为什么用 !important？

Ant Design Sider 组件使用内联样式：
```html
<aside style="flex: 0 0 200px; max-width: 200px; ...">
```

CSS 优先级：
- 内联样式：1000
- ID 选择器：100
- 类选择器：10
- 元素选择器：1

普通 CSS 选择器无法覆盖内联样式，必须使用 `!important`。

## 组件间通信

使用自定义事件实现 TopHead 和 SideMenu 的通信：

**TopHead.tsx** - 触发事件
```typescript
const toggleMobileMenu = () => {
    window.dispatchEvent(new CustomEvent('toggleMobileMenu'))
}
```

**SideMenu.tsx** - 监听事件
```typescript
useEffect(() => {
    const handler = () => setMobileVisible(prev => !prev)
    window.addEventListener('toggleMobileMenu', handler)
    return () => window.removeEventListener('toggleMobileMenu', handler)
}, [])
```

## axios Polyfill 说明

在 `index.html` 中添加了 axios 兼容性 polyfill：

```html
<script>
  // 确保 Request 和 Response 在全局作用域可用
  if (typeof globalThis !== 'undefined') {
    globalThis.Request = globalThis.Request || window.Request;
    globalThis.Response = globalThis.Response || window.Response;
  }
</script>
```

**问题背景**：
- axios 1.8+ 在 fetch.js 中使用解构语法
- 如果 `utils.global` 中没有 Request/Response 会报错

**局限性**：
- 由于 modulepreload 机制，polyfill 可能在 axios 执行后才运行
- 建议锁定 axios 版本为 1.7.7

**相关 Issue**：https://github.com/axios/axios/issues/7259

---

日期: 2026-01-12
