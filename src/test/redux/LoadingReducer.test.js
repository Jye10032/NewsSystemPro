/**
 * LoadingReducer 测试
 * 测试加载状态管理
 */

import { describe, it, expect } from 'vitest';
import LoadingReducer from '../../redux/reducers/LoadingReducer';

describe('LoadingReducer', () => {
  // 测试初始状态
  it('应该返回初始状态为 false', () => {
    const initialState = LoadingReducer(undefined, { type: '@@INIT' });
    expect(initialState).toBe(false);
  });

  // 测试切换加载状态
  it('应该切换加载状态从 false 到 true', () => {
    const newState = LoadingReducer(false, { type: 'change_loading' });
    expect(newState).toBe(true);
  });

  it('应该切换加载状态从 true 到 false', () => {
    const newState = LoadingReducer(true, { type: 'change_loading' });
    expect(newState).toBe(false);
  });

  // 测试未知 action
  it('应该返回当前状态当 action type 未知时', () => {
    const currentState = true;
    const newState = LoadingReducer(currentState, { type: 'UNKNOWN_ACTION' });
    expect(newState).toBe(currentState);
  });

  // 测试加载状态循环
  it('应该正确处理加载状态循环', () => {
    let state = false;

    // 开始加载
    state = LoadingReducer(state, { type: 'change_loading' });
    expect(state).toBe(true);

    // 加载完成
    state = LoadingReducer(state, { type: 'change_loading' });
    expect(state).toBe(false);

    // 再次加载
    state = LoadingReducer(state, { type: 'change_loading' });
    expect(state).toBe(true);
  });
});
