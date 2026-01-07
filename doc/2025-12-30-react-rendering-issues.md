# React 渲染问题：异步数据与组件状态

## 问题背景

在 SideMenu 组件中遇到两个与异步数据加载相关的渲染问题。

---

## 问题一：defaultOpenKeys 不生效

### 现象
刷新页面后，侧边栏菜单不会自动展开到当前路径对应的菜单项。

### 原因
```javascript
// 使用 defaultOpenKeys（非受控模式）
<Menu defaultOpenKeys={['/news-manage']} />
```

`defaultOpenKeys` 只在组件**首次挂载**时生效。但菜单数据是异步加载的：

```
时间线：
1. Menu 首次渲染，defaultOpenKeys=['/news-manage']
2. 但此时 meun=[]，没有菜单项可以展开
3. 数据加载完成，meun=[{...}]
4. Menu 更新子元素，但 defaultOpenKeys 不会重新应用
5. 结果：菜单不展开
```

### 解决方案
改用**受控模式**（useState + openKeys）：

```javascript
// 受控模式
const [openKeys, setOpenKeys] = useState(['/news-manage'])

<Menu
  openKeys={openKeys}           // 当前值，随时可变
  onOpenChange={setOpenKeys}    // 用户操作时更新
/>
```

受控模式下，`openKeys` 的值由 React state 管理，任何时候改变都会生效。

---

## 问题二：selectedKeys 样式不生效

### 现象
刷新页面后，选中的菜单项不会显示蓝色高亮，只有鼠标移上去一次后才会变蓝。

### 原因
```javascript
<Menu selectedKeys={['/news-manage/add']}>
  {renderMenu(meun)}  // meun 是异步加载的
</Menu>
```

渲染流程：
```
1. 第一次渲染：meun=[], selectedKeys=['/news-manage/add']
   → Menu 初始化，但没有菜单项
   → selectedKeys 设置了，但没有匹配的 DOM 元素

2. 数据加载完成：meun=[{...}]
   → Menu 更新 children（添加菜单项）
   → 但 Menu 组件本身没有重新创建
   → Ant Design 内部没有重新计算选中样式

3. 鼠标移入
   → 触发 hover/focus 事件
   → Ant Design 重新计算样式
   → 选中项变蓝
```

### 解决方案
给 Menu 添加 `key`，强制在数据变化时重新创建组件：

```javascript
<Menu
  key={meun.length}  // key 变化时，组件重新创建
  selectedKeys={selectKeys}
>
  {renderMenu(meun)}
</Menu>
```

原理：
```
key={0} → key={6}  (数据加载后 key 变化)
    ↓
React 认为这是一个"新组件"
    ↓
销毁旧 Menu，创建新 Menu
    ↓
新 Menu 初始化时就有正确的 selectedKeys 和菜单项
    ↓
选中样式立即生效
```

---

## 核心概念

### 受控 vs 非受控

| 模式 | 属性 | 特点 |
|------|------|------|
| 非受控 | `defaultXxx` | 只在首次渲染生效，之后组件内部管理 |
| 受控 | `xxx` + `onChange` | 由父组件通过 state 完全控制 |

### key 的作用

- React 用 `key` 来识别组件身份
- `key` 变化 = 销毁旧组件 + 创建新组件
- 用于强制重新初始化组件状态

---

## 最终代码

```javascript
// SideMenu.js
const [openKeys, setOpenKeys] = useState([parentKey])

<Menu
  key={meun.length}                        // 数据加载后重新创建
  selectedKeys={selectKeys}                // 受控：选中项
  openKeys={showCollapsed ? [] : openKeys} // 受控：展开项
  onOpenChange={handleOpenChange}
>
  {renderMenu(meun)}
</Menu>
```

---

_记录时间: 2025-12-30_
