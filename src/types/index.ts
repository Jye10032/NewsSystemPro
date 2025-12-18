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
  role: Role
  allowedCategoryIds?: number[]
}

// Redux State
export interface RootState {
  collapsible: boolean
  isLoding: boolean
  user: User | null
}

// Action Types
export type UserAction =
  | { type: 'set_user'; payload: User }
  | { type: 'clear_user' }

export type CollapsedAction = { type: 'change_collapsed' }

export type LoadingAction = { type: 'change_loading' }

export type AppAction = UserAction | CollapsedAction | LoadingAction
