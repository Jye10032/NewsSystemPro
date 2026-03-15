# 新闻生命周期与审核权限闭环改造

## 背景

现有流程存在几个断点：
- 待发布未严格限制为“审核通过”的新闻。
- 审核驳回没有原因输入与查看入口。
- 审核人员对他人新闻进行审核时被后端拒绝。
- 发布/下线/重审的状态流转不完整。

## 本次改动

### 1) 审核权限放行
- 允许具备 `/audit-manage/audit` 权限的角色对新闻执行审核类 PATCH（包含 `auditState` 时）。
- 作者本人仍保留编辑权限。

### 2) 驳回原因记录与展示
- 新增 `auditLogs` 集合记录驳回原因与操作信息。
- 新闻详情页展示最近一次驳回原因（仅当 `auditState=3`）。

### 3) 生命周期闭环
- 草稿 → 待审核 → 审核通过（待发布） → 已发布 → 已下线 → 编辑 → 再次提交审核
- 审核不通过的新闻进入“已审核”，支持编辑或删除。

### 4) 前端页面文案与入口
- 审核管理菜单与面包屑：`审核新闻/审核列表` → `待审核/已审核`
- “已审核”列表隐藏 `auditState=1`（审核中）。
- 已下线页面提供“编辑 + 删除”。
- 发布操作写入 `publishTime`。

## 数据结构

新增：
```json
"auditLogs": []
```

记录格式示例：
```json
{
  "newsId": 123,
  "result": 3,
  "reason": "标题不合规",
  "operator": "admin",
  "time": 1769694692211
}
```

## 关键代码位置

- 后端权限：
  - `server/index.cjs`（审核角色可执行审核 PATCH）
  - `api/index.cjs`（Vercel 同步）
- 审核流程：
  - `src/sandbox/audit-manage/Audit.tsx`（驳回原因输入、写入 auditLogs）
  - `src/sandbox/audit-manage/AuditList.tsx`（已审核列表过滤、编辑/删除）
- 生命周期与发布：
  - `src/modules/publish/hooks/usePublish.tsx`（待发布仅 auditState=2，发布写 publishTime）
  - `src/modules/publish/pages/Sunset.tsx`（已下线编辑/删除）
  - `src/modules/news/pages/NewsUpdate.tsx`（编辑后重置 publishState）
- 详情展示：
  - `src/modules/news/pages/NewsPreivew.tsx`（显示驳回原因）
- 菜单与文案：
  - `db/db.json`（审核菜单标题）
  - `src/sandbox/TopHead.tsx`（面包屑标题）

## 流程示意

```
草稿(audit=0) → 待审核(audit=1)
  ├─ 通过 → 待发布(audit=2, publish=1) → 发布 → 已发布(publish=2)
  │                                      └→ 下线 → 已下线(publish=3) → 编辑 → 待审核
  └─ 驳回 → 已审核(audit=3, publish=0) → 编辑/删除
```

## 测试

执行：
```
npm run test:run
```

结果：通过（存在已有 warnings，不影响测试通过）。

## 后续建议

- 若需要“驳回原因历史记录”，可在详情页展示 auditLogs 列表而非仅最新一条。
- 如果要区分“审核中/已审核”权限，建议新增更细粒度的审核权限 key。
