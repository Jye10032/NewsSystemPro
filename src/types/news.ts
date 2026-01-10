export interface NewsItem {
  id: number
  title: string
  author: string
  categoryId: number
  roleId?: number
  auditState?: number
  publishState?: number
  view?: number
  star?: number
  content?: string
  createTime?: number
  publishTime?: number
  category?: { title: string }
}
