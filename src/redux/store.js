import { legacy_createStore as createStore, applyMiddleware, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import { thunk } from 'redux-thunk';
import storage from 'redux-persist/lib/storage'
import collapsible from './reducers/CollapsedReducer'
import isLoading from './reducers/LoadingReducer'
import user from './reducers/UserReducer'
//import { configureStore } from '@reduxjs/toolkit';


const persistConfig = {
  key: 'root',           // localStorage 的 key 名称
  storage,               // 存储引擎（localStorage）
  blacklist: ['isLoading'] // 不持久化的状态
}

const AllReducers = combineReducers({
  collapsible,
  isLoading,
  user
})

const persistedReducer = persistReducer(persistConfig, AllReducers)

const store = createStore(persistedReducer, applyMiddleware(thunk));


// const store = configureStore({
//   reducer: persistedReducer,
//   middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(thunk),
// });
const persistor = persistStore(store)

export { store, persistor }
