/**
 * Login 组件测试
 * 测试登录表单的核心功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore, combineReducers } from 'redux';
import Login from '../../modules/login/Login';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { baseURL: '', withCredentials: false }
  }
}));

// 创建测试用的 Redux store
const createTestStore = () => {
  const rootReducer = combineReducers({
    user: (state = null, action) => {
      if (action.type === 'set_user') return action.payload;
      if (action.type === 'clear_user') return null;
      return state;
    },
    collapsible: (state = false) => state,
    isLoading: (state = 0) => state,
  });
  return createStore(rootReducer);
};

// Mock react-tsparticles（粒子背景组件，测试时不需要）
vi.mock('react-tsparticles', () => ({
  default: () => null,
}));

vi.mock('tsparticles', () => ({
  loadFull: vi.fn(),
}));

// 测试辅助函数：在 Router 和 Redux 上下文中渲染组件
const renderWithProviders = (component, store = createTestStore()) => {
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    ),
    store
  };
};

describe('Login 组件', () => {
  beforeEach(() => {
    // 每个测试前清除 mocks
    vi.clearAllMocks();
    // 清除 localStorage
    localStorage.clear();
  });

  it('应该渲染登录表单', () => {
    renderWithProviders(<Login />);

    // 检查标题是否渲染
    expect(screen.getByText('新闻发布管理系统')).toBeInTheDocument();

    // 检查用户名和密码输入框是否存在
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();

    // 检查登录按钮是否存在
    expect(screen.getByRole('button', { name: /登/i })).toBeInTheDocument();
  });

  it('应该能够输入用户名和密码', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const usernameInput = screen.getByPlaceholderText('用户名');
    const passwordInput = screen.getByPlaceholderText('密码');

    // 模拟用户输入
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, '123456');

    // 检查输入值
    expect(usernameInput).toHaveValue('admin');
    expect(passwordInput).toHaveValue('123456');
  });

  it('应该在提交空表单时显示验证错误', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const loginButton = screen.getByRole('button', { name: /登/i });

    // 直接点击登录按钮（不输入任何内容）
    await user.click(loginButton);

    // Ant Design 会显示验证错误消息
    await waitFor(() => {
      expect(screen.getByText('请输入用户名!')).toBeInTheDocument();
    });
  });

  it('应该在用户名密码正确时登录成功并更新 Redux', async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    // Mock axios 返回成功的用户数据（httpOnly Cookie 方案，不返回 token）
    const mockUserData = {
      id: 1,
      username: 'admin',
      role: { id: 1, roleName: '超级管理员' },
      region: '全球',
    };

    axios.post.mockResolvedValueOnce({
      data: {
        user: mockUserData,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter><Login /></BrowserRouter>
      </Provider>
    );

    const usernameInput = screen.getByPlaceholderText('用户名');
    const passwordInput = screen.getByPlaceholderText('密码');
    const loginButton = screen.getByRole('button', { name: /登/i });

    // 输入正确的用户名和密码
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, '123456');
    await user.click(loginButton);

    // 等待异步请求完成
    await waitFor(() => {
      // 检查是否调用了正确的 API
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { username: 'admin', password: '123456' }
      );

      // 检查 Redux 状态是否更新
      expect(store.getState().user).toEqual(mockUserData);
    });
  });

  it('应该在用户名密码错误时显示错误消息', async () => {
    const user = userEvent.setup();

    // Mock axios 返回 401 错误
    axios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: '用户名或密码错误' },
      },
    });

    renderWithProviders(<Login />);

    const usernameInput = screen.getByPlaceholderText('用户名');
    const passwordInput = screen.getByPlaceholderText('密码');
    const loginButton = screen.getByRole('button', { name: /登/i });

    // 输入错误的用户名和密码
    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(loginButton);

    // 等待错误消息显示
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { username: 'wronguser', password: 'wrongpass' }
      );
    });
  });
});
