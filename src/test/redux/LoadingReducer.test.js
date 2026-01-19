/**
 * LoadingReducer 测试
 * 测试加载状态管理（计数器方式）
 */

import { describe, it, expect } from 'vitest';
import LoadingReducer from '../../redux/reducers/LoadingReducer';

describe('LoadingReducer', () => {
  // 测试初始状态
  it('应该返回初始状态为 0', () => {
    const initialState = LoadingReducer(undefined, { type: '@@INIT' });
    expect(initialState).toBe(0);
  });

  // 测试开始加载
  it('应该在 loading_start 时增加计数', () => {
    const newState = LoadingReducer(0, { type: 'loading_start' });
    expect(newState).toBe(1);
  });

  it('应该支持多个并发加载', () => {
    let state = LoadingReducer(0, { type: 'loading_start' });
    state = LoadingReducer(state, { type: 'loading_start' });
    expect(state).toBe(2);
  });

  // 测试结束加载
  it('应该在 loading_end 时减少计数', () => {
    const newState = LoadingReducer(2, { type: 'loading_end' });
    expect(newState).toBe(1);
  });

  it('应该不会让计数小于 0', () => {
    const newState = LoadingReducer(0, { type: 'loading_end' });
    expect(newState).toBe(0);
  });

  // 测试未知 action
  it('应该返回当前状态当 action type 未知时', () => {
    const currentState = 3;
    const newState = LoadingReducer(currentState, { type: 'UNKNOWN_ACTION' });
    expect(newState).toBe(currentState);
  });

  // 测试加载状态循环
  it('应该正确处理加载状态循环', () => {
    let state = 0;

    // 开始两个加载
    state = LoadingReducer(state, { type: 'loading_start' });
    expect(state).toBe(1);
    state = LoadingReducer(state, { type: 'loading_start' });
    expect(state).toBe(2);

    // 结束一个加载
    state = LoadingReducer(state, { type: 'loading_end' });
    expect(state).toBe(1);

    // 结束另一个加载
    state = LoadingReducer(state, { type: 'loading_end' });
    expect(state).toBe(0);
  });
});
