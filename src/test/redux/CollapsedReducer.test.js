/**
 * CollapsedReducer 测试
 * 测试侧边栏折叠状态管理
 */

import { describe, it, expect } from 'vitest';
import CollapsedReducer from '../../redux/reducers/CollapsedReducer';

describe('CollapsedReducer', () => {
  // 测试初始状态
  it('应该返回初始状态', () => {
    const initialState = CollapsedReducer(undefined, { type: '@@INIT' });
    expect(initialState).toBe(false);
  });

  // 测试切换折叠状态
  it('应该切换折叠状态从 false 到 true', () => {
    const newState = CollapsedReducer(false, { type: 'change_collapsed' });
    expect(newState).toBe(true);
  });

  it('应该切换折叠状态从 true 到 false', () => {
    const newState = CollapsedReducer(true, { type: 'change_collapsed' });
    expect(newState).toBe(false);
  });

  // 测试未知 action
  it('应该返回当前状态当 action type 未知时', () => {
    const currentState = true;
    const newState = CollapsedReducer(currentState, { type: 'UNKNOWN_ACTION' });
    expect(newState).toBe(currentState);
  });

  // 测试多次切换
  it('应该正确处理多次切换', () => {
    let state = false;

    state = CollapsedReducer(state, { type: 'change_collapsed' });
    expect(state).toBe(true);

    state = CollapsedReducer(state, { type: 'change_collapsed' });
    expect(state).toBe(false);

    state = CollapsedReducer(state, { type: 'change_collapsed' });
    expect(state).toBe(true);
  });
});
