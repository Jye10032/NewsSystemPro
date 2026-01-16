/**
 * 菜单/权限项类型
 * 数据来源：GET /rights API（db/db.json 的 rights 表）
 */
export interface Right {
  id: number
  key: string              // 路由路径，如 '/home', '/user-manage/list'
  title: string            // 菜单显示名称
  pagepermisson?: number   // 页面权限：1=显示在侧边栏菜单，0=隐藏
  routepermisson?: number  // 路由权限：1=可访问但不显示菜单（如详情页、编辑页）
  grade?: number           // 菜单层级：1=一级菜单，2=二级菜单
  children?: Right[]       // 子菜单项
}
