import { legacy_createStore as createStore, applyMiddleware, combineReducers } from 'redux'
import { persistStore, persistReducer, PersistConfig } from 'redux-persist'
import { thunk } from 'redux-thunk'
import storage from 'redux-persist/lib/storage'
import collapsible from './reducers/CollapsedReducer'
import isLoading from './reducers/LoadingReducer'
import user from './reducers/UserReducer'
import type { RootState, AppAction } from '@/types'

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  blacklist: ['isLoading']
}

const AllReducers = combineReducers({
  collapsible,
  isLoading,
  user
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedReducer = persistReducer(persistConfig as any, AllReducers as any)

const store = createStore(persistedReducer, applyMiddleware(thunk))

const persistor = persistStore(store)

export { store, persistor }
export type { RootState, AppAction }
