// 统一导出
export * from './user'
export * from './category'
export * from './right'
export * from './news'

import type { User } from './user'

// Redux State
export interface RootState {
  collapsible: boolean
  isLoading: boolean
  user: User | null
}

// Redux Action Types
export type CollapsedAction = { type: 'change_collapsed' }
export type LoadingAction = { type: 'change_loading' }

import type { UserAction } from './user'
export type AppAction = UserAction | CollapsedAction | LoadingAction
