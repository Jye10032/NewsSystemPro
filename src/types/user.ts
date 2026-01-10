// 用户角色
export interface Role {
  id: number
  roleName: string
  roleType: number
  rights: string[]
}

// 用户信息
export interface User {
  id: number
  username: string
  password: string
  roleState: boolean
  default: boolean
  region: string
  roleId: number
  role?: Role
  allowedCategoryIds?: number[]
}

// Redux Action Types
export type UserAction =
  | { type: 'set_user'; payload: User }
  | { type: 'clear_user' }
