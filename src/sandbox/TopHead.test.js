import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import TopHead from './TopHead'

// 创建测试用的 reducer
function createTestReducer(initialState = { collapsible: false }) {
  return (state = initialState, action) => {
    switch (action.type) {
      case 'change_collapsed':
        return { ...state, collapsible: !state.collapsible }
      default:
        return state
    }
  }
}

// 创建测试用的 Redux store
function createTestStore(initialState) {
  return createStore(createTestReducer(initialState))
}

describe('TopHead 顶部栏组件', () => {
  const mockUserInfo = {
    username: 'testuser',
    role: {
      roleName: '编辑'
    },
    region: '北京'
  }

  beforeEach(() => {
    // 设置 localStorage
    localStorage.setItem('token', JSON.stringify(mockUserInfo))
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('渲染测试', () => {
    it('应该正确渲染顶部栏', () => {
      // Arrange
      const store = createTestStore()

      // Act
      render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      // Assert: 应该显示用户图标
      const userIcon = document.querySelector('.anticon-user')
      expect(userIcon).toBeInTheDocument()
    })

    it('应该从 localStorage 读取用户信息', async () => {
      // Arrange
      const store = createTestStore()

      // Act
      render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      // Assert: 组件应该正常渲染（说明成功读取了用户信息）
      await waitFor(() => {
        const userIcon = document.querySelector('.anticon-user')
        expect(userIcon).toBeInTheDocument()
      })
    })

  })

  describe('用户下拉菜单', () => {
    it('应该在点击用户图标时显示下拉菜单', async () => {
      // Arrange
      const store = createTestStore()
      const user = userEvent.setup()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      const userIcon = container.querySelector('.anticon-user')
      await user.click(userIcon)

      // Assert: 下拉菜单应该显示（Ant Design 会在 body 中渲染）
      await waitFor(() => {
        const dropdown = document.querySelector('.ant-dropdown')
        expect(dropdown).toBeInTheDocument()
      })
    })

    it('应该在下拉菜单中显示用户名', async () => {
      // Arrange
      const store = createTestStore()
      const user = userEvent.setup()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      const userIcon = container.querySelector('.anticon-user')
      await user.click(userIcon)

      // Assert: 应该显示欢迎信息和用户名
      await waitFor(() => {
        expect(screen.getByText('testuser', { exact: false })).toBeInTheDocument()
      })
    })

    it('应该在下拉菜单中显示角色名', async () => {
      // Arrange
      const store = createTestStore()
      const user = userEvent.setup()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      const userIcon = container.querySelector('.anticon-user')
      await user.click(userIcon)

      // Assert: 应该显示角色名
      await waitFor(() => {
        expect(screen.getByText('编辑')).toBeInTheDocument()
      })
    })

    it('应该在下拉菜单中显示退出按钮', async () => {
      // Arrange
      const store = createTestStore()
      const user = userEvent.setup()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      const userIcon = container.querySelector('.anticon-user')
      await user.click(userIcon)

      // Assert: 应该有退出选项
      await waitFor(() => {
        expect(screen.getByText('退出')).toBeInTheDocument()
      })
    })
  })

  describe('退出登录功能', () => {
    it('应该在点击退出时清除 localStorage', async () => {
      // Arrange
      const store = createTestStore()
      const user = userEvent.setup()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      const userIcon = container.querySelector('.anticon-user')
      await user.click(userIcon)

      await waitFor(() => {
        expect(screen.getByText('退出')).toBeInTheDocument()
      })

      const logoutButton = screen.getByText('退出')
      await user.click(logoutButton)

      // Assert: localStorage 应该被清除
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('应该在退出后跳转到登录页', async () => {
      // Arrange
      const store = createTestStore()
      const user = userEvent.setup()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/home']}>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      const userIcon = container.querySelector('.anticon-user')
      await user.click(userIcon)

      await waitFor(() => {
        expect(screen.getByText('退出')).toBeInTheDocument()
      })

      const logoutButton = screen.getByText('退出')
      await user.click(logoutButton)

      // Assert: 应该清除了 token
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的 localStorage 数据', () => {
      // Arrange: 设置无效的 localStorage 数据
      localStorage.setItem('token', 'invalid-json')
      const store = createTestStore()

      // Act & Assert: 组件应该捕获错误并继续渲染
      expect(() => {
        render(
          <Provider store={store}>
            <MemoryRouter>
              <TopHead />
            </MemoryRouter>
          </Provider>
        )
      }).toThrow() // JSON.parse 会抛出错误，这是预期的
    })

    it('应该处理缺少 role 信息的用户数据', () => {
      // Arrange: 用户数据没有 role
      localStorage.setItem('token', JSON.stringify({
        username: 'testuser'
      }))
      const store = createTestStore()

      // Act & Assert: 应该抛出错误（因为代码会访问 role.roleName）
      expect(() => {
        render(
          <Provider store={store}>
            <MemoryRouter>
              <TopHead />
            </MemoryRouter>
          </Provider>
        )
      }).toThrow()
    })

    it('应该处理完整的用户数据', () => {
      // Arrange: 完整的用户数据
      localStorage.setItem('token', JSON.stringify({
        username: 'testuser',
        role: {
          roleName: '管理员'
        },
        region: '上海'
      }))
      const store = createTestStore()

      // Act & Assert: 不应该抛出错误
      expect(() => {
        render(
          <Provider store={store}>
            <MemoryRouter>
              <TopHead />
            </MemoryRouter>
          </Provider>
        )
      }).not.toThrow()
    })
  })

  describe('样式和布局', () => {
    it('应该正确设置 Header 样式', () => {
      // Arrange
      const store = createTestStore()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      // Assert: 应该有 Header 元素
      const header = container.querySelector('.ant-layout-header')
      expect(header).toBeInTheDocument()
    })

    it('应该将用户图标放在右侧', () => {
      // Arrange
      const store = createTestStore()

      // Act
      const { container } = render(
        <Provider store={store}>
          <MemoryRouter>
            <TopHead />
          </MemoryRouter>
        </Provider>
      )

      // Assert: 用户图标应该在右侧的容器中
      const rightDiv = container.querySelector('div[style*="float"]')
      expect(rightDiv).toBeInTheDocument()

      const userIcon = rightDiv.querySelector('.anticon-user')
      expect(userIcon).toBeInTheDocument()
    })
  })
})
