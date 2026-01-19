import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { legacy_createStore as createStore, combineReducers } from 'redux'
import AuthRoute from '../../router/AuthRoute'

// 创建测试用的 store
function createTestStore(user = null) {
  const userReducer = (state = user) => state
  const collapsibleReducer = (state = false) => state
  const isLoadingReducer = (state = 0) => state

  return createStore(combineReducers({
    user: userReducer,
    collapsible: collapsibleReducer,
    isLoading: isLoadingReducer
  }))
}

describe('AuthRoute 路由守卫', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该在未登录时重定向到登录页', () => {
    // Arrange: user 为 null，模拟未登录状态
    const store = createTestStore(null)
    const TestComponent = () => <div>受保护的内容</div>
    const LoginPage = () => <div>登录页面</div>

    // Act: 渲染带路由守卫的组件
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <AuthRoute>
                  <TestComponent />
                </AuthRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // Assert: 应该显示登录页面，而不是受保护的内容
    expect(screen.getByText('登录页面')).toBeInTheDocument()
    expect(screen.queryByText('受保护的内容')).not.toBeInTheDocument()
  })

  it('应该在已登录时允许访问受保护的内容', () => {
    // Arrange: 设置 user，模拟已登录状态
    const mockUser = {
      id: 1,
      username: 'testuser',
      roleId: 3,
      role: { id: 3, roleName: '编辑', rights: [] }
    }
    const store = createTestStore(mockUser)

    const TestComponent = () => <div>受保护的内容</div>
    const LoginPage = () => <div>登录页面</div>

    // Act: 渲染带路由守卫的组件
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <AuthRoute>
                  <TestComponent />
                </AuthRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // Assert: 应该显示受保护的内容，而不是登录页面
    expect(screen.getByText('受保护的内容')).toBeInTheDocument()
    expect(screen.queryByText('登录页面')).not.toBeInTheDocument()
  })

  it('应该正确传递子组件的 props', () => {
    // Arrange
    const mockUser = { id: 1, username: 'testuser' }
    const store = createTestStore(mockUser)
    const TestComponent = ({ message }) => <div>{message}</div>

    // Act
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <AuthRoute>
                  <TestComponent message="Hello from protected route" />
                </AuthRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // Assert
    expect(screen.getByText('Hello from protected route')).toBeInTheDocument()
  })

  it('应该处理 null user 为未登录状态', () => {
    // Arrange: Redux 中 user 为 null
    const store = createTestStore(null)

    const TestComponent = () => <div>受保护的内容</div>
    const LoginPage = () => <div>登录页面</div>

    // Act
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/protected"
              element={
                <AuthRoute>
                  <TestComponent />
                </AuthRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    // Assert
    expect(screen.getByText('登录页面')).toBeInTheDocument()
    expect(screen.queryByText('受保护的内容')).not.toBeInTheDocument()
  })
})
