# 📋 测试体系搭建指南

## ✅ 已完成

### 1. 测试环境配置 ✓
- ✅ 安装 Vitest + Testing Library
- ✅ 配置 `vite.config.js` 测试选项
- ✅ 创建 `src/test/setup.js` 测试环境设置
- ✅ 配置 package.json 测试脚本

### 2. 测试脚本 ✓
```bash
npm test              # 监听模式运行测试
npm run test:ui       # 打开 Vitest UI 界面
npm run test:run      # 单次运行所有测试
npm run test:coverage # 生成覆盖率报告
```

### 3. 已编写的测试 ✓

#### Redux Reducers (100% 覆盖率)
- `src/redux/reducers/CollapsedReducer.test.js` - 5个测试
- `src/redux/reducers/LoadingReducer.test.js` - 5个测试

#### 登录组件 (86.66% 覆盖率)
- `src/login/Login.test.js` - 5个测试
  - ✅ 渲染测试
  - ✅ 用户输入测试
  - ✅ 表单验证测试
  - ✅ 登录成功场景
  - ✅ 登录失败场景

### 4. 当前覆盖率
- **总体覆盖率**: 92% (Statements)
- **Redux Reducers**: 100%
- **Login 组件**: 86.66%

---

## 📝 下一步：继续完善测试

### 优先级1：核心业务逻辑测试 ⭐⭐⭐⭐⭐

#### 1. 路由守卫测试
**文件**: `src/router/AuthRoute.test.js`
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthRoute from './AuthRoute';

describe('AuthRoute 路由守卫', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('应该在未登录时重定向到登录页', () => {
    // 测试逻辑...
  });

  it('应该在已登录时允许访问', () => {
    // 测试逻辑...
  });
});
```

#### 2. Axios 请求拦截器测试
**文件**: `src/utils/Request.test.js`
```javascript
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

describe('Axios 拦截器', () => {
  it('应该在请求时显示loading', () => {
    // 测试请求拦截器...
  });

  it('应该在响应后隐藏loading', () => {
    // 测试响应拦截器...
  });
});
```

#### 3. 新闻列表组件测试
**文件**: `src/sandbox/publish-mange/Published.test.js`
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Published from './Published';

describe('已发布新闻列表', () => {
  it('应该显示新闻列表', async () => {
    // Mock API 返回新闻数据
    // 渲染组件
    // 检查新闻是否显示
  });

  it('应该能够下线新闻', async () => {
    // 测试下线功能...
  });
});
```

---

### 优先级2：工具函数测试 ⭐⭐⭐⭐

如果有工具函数（日期格式化、权限判断等），应该100%覆盖：

```javascript
// 示例：src/utils/formatDate.test.js
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate 工具函数', () => {
  it('应该正确格式化日期', () => {
    const result = formatDate('2024-01-01');
    expect(result).toBe('2024年01月01日');
  });

  it('应该处理无效日期', () => {
    const result = formatDate(null);
    expect(result).toBe('');
  });
});
```

---

### 优先级3：自定义 Hooks 测试 ⭐⭐⭐

**文件**: `src/publish-manage/usePublish.test.js`
```javascript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import usePublish from './usePublish';

describe('usePublish Hook', () => {
  it('应该返回正确的发布方法', () => {
    const { result } = renderHook(() => usePublish());
    expect(result.current).toHaveProperty('handlePublish');
  });
});
```

---

### 优先级4：集成测试 ⭐⭐⭐

测试完整的用户流程：

```javascript
// src/integration/news-workflow.test.js
describe('新闻发布完整流程', () => {
  it('应该能完成：登录 → 创建草稿 → 提交审核 → 发布', async () => {
    // 1. 登录
    // 2. 创建新闻草稿
    // 3. 提交审核
    // 4. 审核通过
    // 5. 发布新闻
  });
});
```

---

## 🎯 测试覆盖率目标

| 模块 | 当前覆盖率 | 目标覆盖率 |
|------|-----------|-----------|
| Redux Reducers | 100% | 100% ✅ |
| 登录组件 | 86.66% | 90% |
| 工具函数 | 0% | 90% |
| 路由守卫 | 0% | 80% |
| 核心组件 | 0% | 70% |
| **总体** | **92%** | **60%+** |

---

## 💡 测试最佳实践

### 1. 测试命名规范
```javascript
// ✅ 好的命名
it('应该在用户名为空时显示错误消息', () => {});

// ❌ 不好的命名
it('test1', () => {});
```

### 2. AAA 模式
```javascript
it('测试描述', () => {
  // Arrange（准备）
  const mockData = { ... };

  // Act（执行）
  const result = someFunction(mockData);

  // Assert（断言）
  expect(result).toBe(expected);
});
```

### 3. Mock 外部依赖
```javascript
// Mock axios
vi.mock('axios');

// Mock localStorage
localStorage.setItem('token', JSON.stringify(mockUser));

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
```

### 4. 测试用户交互
```javascript
import userEvent from '@testing-library/user-event';

it('应该能够点击按钮', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  const button = screen.getByRole('button');
  await user.click(button);

  expect(button).toHaveTextContent('已点击');
});
```

---

## 🚀 快速开始下一个测试

### 步骤1：选择要测试的组件/函数

查看覆盖率报告，选择未覆盖的文件：
```bash
npm run test:coverage
```

### 步骤2：创建测试文件

在同一目录下创建 `.test.js` 文件：
```
src/components/MyComponent.js
src/components/MyComponent.test.js  ← 创建这个
```

### 步骤3：编写测试

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('应该正确渲染', () => {
    render(<MyComponent />);
    expect(screen.getByText('标题')).toBeInTheDocument();
  });
});
```

### 步骤4：运行测试

```bash
npm test  # 监听模式，自动重新运行
```

---

## 📊 查看测试结果

### 命令行输出
```bash
npm run test:run  # 简洁输出

✓ src/redux/reducers/CollapsedReducer.test.js (5 tests)
✓ src/redux/reducers/LoadingReducer.test.js (5 tests)
✓ src/login/Login.test.js (5 tests)

Test Files  3 passed (3)
Tests  15 passed (15)
```

### UI 界面
```bash
npm run test:ui  # 打开浏览器可视化界面
```

### 覆盖率报告
```bash
npm run test:coverage  # 生成 HTML 报告

# 打开报告
open coverage/index.html  # macOS
start coverage/index.html  # Windows
```

---

## 🐛 常见问题

### 1. 测试超时
```javascript
it('异步测试', async () => {
  // 增加超时时间
}, { timeout: 10000 });
```

### 2. Ant Design 组件找不到
```javascript
// 使用 role 查询
screen.getByRole('button', { name: /登录/i });

// 使用 placeholder
screen.getByPlaceholderText('用户名');

// 使用 text
screen.getByText('提交');
```

### 3. 测试文件不运行
检查文件命名是否符合规则：
- `*.test.js`
- `*.spec.js`
- `*.test.jsx`

---

## 🎓 学习资源

### 官方文档
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)

### 查询元素优先级
1. `getByRole` - 最推荐（可访问性）
2. `getByLabelText` - 表单元素
3. `getByPlaceholderText` - 输入框
4. `getByText` - 文本内容
5. `getByTestId` - 最后的选择（需要修改代码）

---

## ✅ 下一步行动

1. **继续编写测试**（推荐顺序）：
   - [ ] 路由守卫测试（AuthRoute）
   - [ ] 工具函数测试（如果有）
   - [ ] 新闻列表组件测试
   - [ ] 新闻编辑组件测试
   - [ ] 用户管理组件测试

2. **优化现有测试**：
   - [ ] 提高登录组件覆盖率到 90%+
   - [ ] 添加更多边界情况测试
   - [ ] 添加错误处理测试

3. **集成到 CI/CD**：
   - [ ] GitHub Actions 自动运行测试
   - [ ] 上传覆盖率报告到 Codecov

---

## 🎯 面试时如何展示

### 话术示例
> "我在项目中建立了完整的前端测试体系：
> - 使用 Vitest + Testing Library 作为测试框架
> - 测试覆盖率达到 XX%
> - 包括单元测试（Redux reducers）、组件测试（Login）
> - 配置了自动化的测试覆盖率报告
> - 所有测试都能在 CI/CD 中自动运行"

### 展示内容
1. 运行 `npm run test:ui` 展示测试界面
2. 运行 `npm run test:coverage` 展示覆盖率
3. 展示测试代码的质量（AAA模式、清晰的描述）
4. 解释为什么选择这些测试场景

---

## 📈 持续改进

每周目标：
- Week 1: 完成核心 reducers 和登录测试 ✅
- Week 2: 完成路由守卫和工具函数测试
- Week 3: 完成主要组件测试（新闻、用户）
- Week 4: 完成集成测试，覆盖率达到 60%+

---

**测试不是负担，而是保证代码质量的最佳实践！** 🚀
