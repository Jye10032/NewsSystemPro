import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AuthRoute from './AuthRoute'

describe('AuthRoute 路由守卫', () => {
  beforeEach(() => {
    // 每个测试前清空 localStorage
    localStorage.clear()
  })

  it('应该在未登录时重定向到登录页', () => {
    // Arrange: 不设置 token，模拟未登录状态
    const TestComponent = () => <div>受保护的内容</div>
    const LoginPage = () => <div>登录页面</div>

    // Act: 渲染带路由守卫的组件
    render(
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
    )

    // Assert: 应该显示登录页面，而不是受保护的内容
    expect(screen.getByText('登录页面')).toBeInTheDocument()
    expect(screen.queryByText('受保护的内容')).not.toBeInTheDocument()
  })

  it('应该在已登录时允许访问受保护的内容', () => {
    // Arrange: 设置 token，模拟已登录状态
    const mockToken = JSON.stringify({
      username: 'testuser',
      role: 'editor',
      token: 'fake-jwt-token'
    })
    localStorage.setItem('token', mockToken)

    const TestComponent = () => <div>受保护的内容</div>
    const LoginPage = () => <div>登录页面</div>

    // Act: 渲染带路由守卫的组件
    render(
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
    )

    // Assert: 应该显示受保护的内容，而不是登录页面
    expect(screen.getByText('受保护的内容')).toBeInTheDocument()
    expect(screen.queryByText('登录页面')).not.toBeInTheDocument()
  })

  it('应该正确传递子组件的 props', () => {
    // Arrange
    localStorage.setItem('token', 'fake-token')
    const TestComponent = ({ message }) => <div>{message}</div>

    // Act
    render(
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
    )

    // Assert
    expect(screen.getByText('Hello from protected route')).toBeInTheDocument()
  })

  it('应该处理空字符串 token 为未登录状态', () => {
    // Arrange: 设置空字符串 token
    localStorage.setItem('token', '')

    const TestComponent = () => <div>受保护的内容</div>
    const LoginPage = () => <div>登录页面</div>

    // Act
    render(
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
    )

    // Assert: 空字符串视为未登录，应该重定向到登录页
    expect(screen.getByText('登录页面')).toBeInTheDocument()
    expect(screen.queryByText('受保护的内容')).not.toBeInTheDocument()
  })

  it('应该处理 null token 为未登录状态', () => {
    // Arrange: localStorage 中没有 token
    const TestComponent = () => <div>受保护的内容</div>
    const LoginPage = () => <div>登录页面</div>

    // Act
    render(
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
    )

    // Assert
    expect(screen.getByText('登录页面')).toBeInTheDocument()
    expect(screen.queryByText('受保护的内容')).not.toBeInTheDocument()
  })
})
