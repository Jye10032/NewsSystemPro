// 统一导出
export * from './user'
export * from './category'
export * from './right'
export * from './news'

import type { User } from './user'

// Redux State
export interface RootState {
  collapsible: boolean
  isLoading: number  // 计数器：> 0 表示正在加载
  user: User | null
}

// Redux Action Types
export type CollapsedAction = { type: 'change_collapsed' }
export type LoadingAction = { type: 'loading_start' } | { type: 'loading_end' }

import type { UserAction } from './user'
export type AppAction = UserAction | CollapsedAction | LoadingAction
