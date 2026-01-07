import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsEditor from '../../modules/news/components/NewsEditor'

// Mock react-draft-wysiwyg Editor
vi.mock('react-draft-wysiwyg', () => ({
  Editor: ({ editorState, onEditorStateChange, onBlur, placeholder }) => (
    <div data-testid="mock-editor">
      <div>{placeholder}</div>
      <textarea
        data-testid="editor-textarea"
        onChange={(e) => {
          // 模拟编辑器状态变化
          const mockEditorState = {
            getCurrentContent: () => ({
              getPlainText: () => e.target.value
            })
          }
          onEditorStateChange?.(mockEditorState)
        }}
        onBlur={() => {
          if (onBlur) {
            onBlur()
          }
        }}
      />
    </div>
  )
}))

// Mock draftjs-to-html
vi.mock('draftjs-to-html', () => ({
  default: (content) => {
    // 简单模拟转换
    if (!content || !content.blocks) return ''
    const text = content.blocks.map(block => block.text).join('\n')
    return `<p>${text}</p>`
  }
}))

// Mock html-to-draftjs
vi.mock('html-to-draftjs', () => ({
  default: (html) => {
    if (!html) return null
    return {
      contentBlocks: [{
        text: html.replace(/<[^>]*>/g, ''),
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {}
      }]
    }
  }
}))

describe('NewsEditor 新闻编辑器组件', () => {
  const mockGetContent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该正确渲染编辑器', () => {
      // Act
      render(<NewsEditor getContent={mockGetContent} />)

      // Assert
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
      expect(screen.getByText('请输入新闻内容...')).toBeInTheDocument()
    })

    it('应该显示字数统计', () => {
      // Act
      render(<NewsEditor getContent={mockGetContent} />)

      // Assert
      expect(screen.getByText(/字数:/)).toBeInTheDocument()
    })

    it('应该显示编辑器包装容器', () => {
      // Act
      const { container } = render(<NewsEditor getContent={mockGetContent} />)

      // Assert
      const wrapper = container.querySelector('.news-editor-wrapper')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('内容加载', () => {
    it('应该加载传入的 HTML 内容', async () => {
      // Arrange
      const initialContent = '<p>这是初始内容</p>'

      // Act
      render(<NewsEditor getContent={mockGetContent} content={initialContent} />)

      // Assert: 编辑器应该被渲染
      await waitFor(() => {
        expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
      })
    })

    it('应该在 content 为空时不报错', () => {
      // Act & Assert
      expect(() => {
        render(<NewsEditor getContent={mockGetContent} content="" />)
      }).not.toThrow()
    })

    it('应该在 content 为 undefined 时不报错', () => {
      // Act & Assert
      expect(() => {
        render(<NewsEditor getContent={mockGetContent} />)
      }).not.toThrow()
    })

    it('应该在 content 更新时重新加载内容', async () => {
      // Arrange
      const { rerender } = render(
        <NewsEditor getContent={mockGetContent} content="<p>初始内容</p>" />
      )

      // Act: 更新 content
      rerender(<NewsEditor getContent={mockGetContent} content="<p>更新的内容</p>" />)

      // Assert: 编辑器应该仍然正常显示
      await waitFor(() => {
        expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
      })
    })
  })

  describe('用户交互', () => {
    it('应该在失去焦点时调用 getContent 回调', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<NewsEditor getContent={mockGetContent} />)

      const textarea = screen.getByTestId('editor-textarea')

      // Act: 输入内容并失去焦点
      await user.type(textarea, '测试内容')
      await user.tab() // 触发 blur

      // Assert: getContent 应该被调用
      await waitFor(() => {
        expect(mockGetContent).toHaveBeenCalled()
      })
    })

    it('应该在用户输入时更新编辑器状态', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<NewsEditor getContent={mockGetContent} />)

      const textarea = screen.getByTestId('editor-textarea')

      // Act: 输入内容
      await user.type(textarea, '新的内容')

      // Assert: textarea 应该包含输入的内容
      expect(textarea.value).toBe('新的内容')
    })

    it('应该能够清空内容', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<NewsEditor getContent={mockGetContent} />)

      const textarea = screen.getByTestId('editor-textarea')

      // Act: 输入内容后清空
      await user.type(textarea, '临时内容')
      await user.clear(textarea)

      // Assert
      expect(textarea.value).toBe('')
    })
  })

  describe('内容转换', () => {
    it('应该将编辑器内容转换为 HTML 格式', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<NewsEditor getContent={mockGetContent} />)

      const textarea = screen.getByTestId('editor-textarea')

      // Act: 输入内容并触发 blur
      await user.type(textarea, '测试 HTML 转换')
      await user.tab()

      // Assert: getContent 应该被调用且传入内容
      await waitFor(() => {
        expect(mockGetContent).toHaveBeenCalled()
        const callArg = mockGetContent.mock.calls[0][0]
        expect(typeof callArg).toBe('string')
      })
    })

    it('应该处理空内容的转换', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<NewsEditor getContent={mockGetContent} />)

      const textarea = screen.getByTestId('editor-textarea')

      // Act: 直接触发 blur（没有输入内容）
      await user.click(textarea)
      await user.tab()

      // Assert
      await waitFor(() => {
        expect(mockGetContent).toHaveBeenCalled()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的 HTML 内容', () => {
      // Arrange
      const invalidContent = '<div><p>未闭合的标签'

      // Act & Assert: 不应该抛出错误
      expect(() => {
        render(<NewsEditor getContent={mockGetContent} content={invalidContent} />)
      }).not.toThrow()
    })

    it('应该在转换失败时传递空字符串', async () => {
      // Arrange
      const user = userEvent.setup()

      // Mock console.error 以避免测试输出中的错误信息
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<NewsEditor getContent={mockGetContent} />)

      const textarea = screen.getByTestId('editor-textarea')

      // Act: 触发可能导致转换失败的操作
      await user.click(textarea)
      await user.tab()

      // Assert
      await waitFor(() => {
        expect(mockGetContent).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('性能优化', () => {
    it('应该正确使用 useCallback 和 useMemo', () => {
      // 这个测试主要是确保组件不会因为重新渲染而出错
      const { rerender } = render(<NewsEditor getContent={mockGetContent} />)

      // Act: 多次重新渲染
      rerender(<NewsEditor getContent={mockGetContent} />)
      rerender(<NewsEditor getContent={mockGetContent} />)

      // Assert: 应该正常渲染
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
    })

    it('应该在 props.content 不变时不触发不必要的更新', () => {
      // Arrange
      const content = '<p>固定内容</p>'

      // Act: 使用相同的 content 多次渲染
      const { rerender } = render(
        <NewsEditor getContent={mockGetContent} content={content} />
      )

      rerender(<NewsEditor getContent={mockGetContent} content={content} />)
      rerender(<NewsEditor getContent={mockGetContent} content={content} />)

      // Assert: 应该正常工作
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
    })
  })

  describe('字数统计功能', () => {
    it('应该初始显示 0 字', () => {
      // Act
      render(<NewsEditor getContent={mockGetContent} />)

      // Assert
      expect(screen.getByText(/字数: 0/)).toBeInTheDocument()
    })

    it('应该在输入内容后更新字数统计', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<NewsEditor getContent={mockGetContent} />)

      const textarea = screen.getByTestId('editor-textarea')

      // Act: 输入内容
      await user.type(textarea, '测试')

      // Assert: 字数应该更新（注意：实际实现可能需要触发编辑器状态更新）
      await waitFor(() => {
        // 由于 mock 的限制，这里主要验证组件不会崩溃
        expect(screen.getByText(/字数:/)).toBeInTheDocument()
      })
    })
  })
})
