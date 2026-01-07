# Express 后端迁移 + bcrypt 密码加密 + JWT 认证

## 背景

原项目使用 json-server 作为后端，存在以下安全问题：

- 密码明文存储在 db.json
- 无标准认证机制
- 无法实现自定义业务逻辑

## 修改内容

### 1. 新增文件结构

```
server/
├── index.cjs              # Express 入口
├── routes/
│   ├── auth.cjs           # 登录/注册
│   ├── users.cjs          # 用户 CRUD
│   └── data.cjs           # 兼容原有路由
├── middleware/
│   └── auth.cjs           # JWT 验证中间件
├── utils/
│   ├── jwt.cjs            # JWT 工具函数
│   └── db.cjs             # 数据库读写
└── scripts/
    └── hash-passwords.cjs # 密码迁移脚本
```

### 2. 密码加密流程

使用 bcrypt 算法，cost factor = 12：

```javascript
// 注册/创建用户时
const hashedPassword = bcrypt.hashSync(password, 12)

// 登录验证时
const isValid = bcrypt.compareSync(inputPassword, user.password)
```

哈希后的密码格式：
```
$2b$12$8XgNhFvLZ3J58Q25ScO.juaBHsC/7imynYDVjtNT2J1qUdtbHULAu
```

### 3. JWT 认证流程

```
POST /api/auth/login
    ↓
验证用户名密码（bcrypt.compareSync）
    ↓
生成 JWT（包含 userId, username, roleId）
    ↓
返回 { token, user }
    ↓
前端存储 token，后续请求携带 Authorization: Bearer xxx
    ↓
中间件验证 JWT 有效性
```

JWT 配置：
- 算法：HS256
- 过期时间：7 天
- Secret：环境变量或默认值

### 4. 新增 npm scripts

```json
{
  "start:express": "concurrently \"npm run dev\" \"npm run server:express\"",
  "server:express": "node server/index.cjs",
  "hash-passwords": "node server/scripts/hash-passwords.cjs"
}
```

## 数据流

```
登录请求
    ↓
server/routes/auth.cjs
    ↓
读取 db.json 查找用户
    ↓
bcrypt.compareSync 验证密码
    ↓
jwt.sign 生成 token
    ↓
返回 { token, user（不含密码）}
```

## API 对比

| 功能 | 原 json-server | 新 Express |
|------|----------------|------------|
| 登录 | GET /users?username=x&password=y | POST /api/auth/login |
| 用户列表 | GET /users | GET /api/users（需 JWT） |
| 密码存储 | 明文 | bcrypt 哈希 |
| 认证方式 | 无 | JWT Bearer Token |

## 测试结果

```bash
# 登录测试
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 返回
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": { "roleName": "超级管理员", ... }
  }
}
```

## json-server 兼容性

Express 实现了以下 json-server 特有功能：

| 功能 | json-server 语法 | Express 实现 |
|------|------------------|--------------|
| 嵌入子数据 | `?_embed=children` | 手动 filter 关联 |
| 展开关联 | `?_expand=category` | 手动 find 关联 |
| 排序 | `?_sort=view&_order=desc` | Array.sort() |
| 限制数量 | `?_limit=7` | Array.slice() |
| 多个展开 | `?_expand=category&_expand=role` | 数组处理多参数 |

支持的完整路由：

```
GET    /rights?_embed=children     # 权限列表（含子权限）
GET    /news?_expand=category      # 新闻列表（含分类）
GET    /news?_sort=view&_order=desc&_limit=7  # 排序+限制
GET    /news/:id?_expand=category&_expand=role  # 单条新闻
POST   /news                       # 创建新闻
PATCH  /news/:id                   # 更新新闻
DELETE /news/:id                   # 删除新闻
GET    /users?_expand=role         # 用户列表（含角色）
PATCH  /roles/:id                  # 更新角色
DELETE /roles/:id                  # 删除角色
PATCH  /rights/:id                 # 更新权限
DELETE /rights/:id                 # 删除权限
PATCH  /children/:id               # 更新子权限
DELETE /children/:id               # 删除子权限
GET    /categories                 # 分类列表
POST   /categories                 # 创建分类
PATCH  /categories/:id             # 更新分类
DELETE /categories/:id             # 删除分类
GET    /regions                    # 区域列表
```

### 5. news.json 数据格式兼容

news.json 文件是纯数组格式 `[...]`，而非 `{ "news": [...] }` 格式。
Express 路由已适配两种格式：

```javascript
// 兼容数组和对象两种格式
let result = Array.isArray(news) ? news : (news.news || [])
```

## 前端适配

已完成：

- [x] Login.tsx 改用 POST /api/auth/login
- [x] 存储 JWT 到 localStorage.jwt
- [x] 兼容接口支持 bcrypt 密码验证
- [x] Nopermission 页面添加返回首页按钮

## 后续任务

- [ ] 添加 token 刷新机制
- [ ] 配置生产环境 JWT_SECRET
- [ ] Vercel 部署适配（需云数据库）

## 依赖变更

```
+ express@4.22.1
+ bcryptjs@3.0.3
+ jsonwebtoken@9.0.3
+ cors@2.8.5
```

---

日期: 2025-12-19
