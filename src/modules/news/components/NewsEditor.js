import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Editor } from 'react-draft-wysiwyg'
import { ContentState, convertToRaw, EditorState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './NewsEditor.css'

export default function NewsEditor(props) {
  // 修复：正确初始化 EditorState
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty())

  // 优化：使用 useMemo 缓存工具栏配置
  const toolbarConfig = useMemo(() => ({
    options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'emoji', 'image', 'remove', 'history'],
    inline: {
      options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
    },
    blockType: {
      inDropdown: true,
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
    },
    fontSize: {
      options: [12, 14, 16, 18, 24, 30, 36],
    },
    list: {
      options: ['unordered', 'ordered'],
    },
    textAlign: {
      options: ['left', 'center', 'right', 'justify'],
    },
    link: {
      defaultTargetOption: '_blank',
      options: ['link', 'unlink'],
    },
    image: {
      // 如果需要上传图片到服务器，配置这里
      uploadEnabled: false, // 改为 true 启用上传
      uploadCallback: undefined, // 添加上传回调函数
      previewImage: true,
      inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
      alt: { present: true, mandatory: false },
      defaultSize: {
        height: 'auto',
        width: '100%',
      },
    },
  }), [])

  // 优化：当 props.content 变化时，更新编辑器内容
  useEffect(() => {
    if (!props.content) return

    try {
      const contentBlock = htmlToDraft(props.content)
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
        const newEditorState = EditorState.createWithContent(contentState)
        setEditorState(newEditorState)
      }
    } catch (error) {
      console.error('解析 HTML 内容失败:', error)
    }
  }, [props.content])

  // 优化：使用 useCallback 避免重复创建函数
  const handleEditorChange = useCallback((newEditorState) => {
    setEditorState(newEditorState)
  }, [])

  // 优化：onBlur 时才转换并传递内容，避免频繁转换
  const handleBlur = useCallback(() => {
    try {
      const contentState = editorState.getCurrentContent()
      const rawContent = convertToRaw(contentState)
      const htmlContent = draftToHtml(rawContent)
      props.getContent(htmlContent)
    } catch (error) {
      console.error('转换内容失败:', error)
      props.getContent('')
    }
  }, [editorState, props])

  // 新增：实时统计字数
  const getTextLength = useCallback(() => {
    const contentState = editorState.getCurrentContent()
    const plainText = contentState.getPlainText('')
    return plainText.length
  }, [editorState])

  return (
    <div className="news-editor-wrapper">
      <Editor
        editorState={editorState}
        toolbarClassName="news-editor-toolbar"
        wrapperClassName="news-editor-wrapper-inner"
        editorClassName="news-editor-content"
        onEditorStateChange={handleEditorChange}
        onBlur={handleBlur}
        toolbar={toolbarConfig}
        placeholder="请输入新闻内容..."
        localization={{
          locale: 'zh',
        }}
        // 编辑器高度
        editorStyle={{
          minHeight: '400px',
          padding: '0 15px',
          fontSize: '16px',
          lineHeight: '1.8',
        }}
      />

      {/* 字数统计 */}
      <div className="news-editor-footer">
        <span className="word-count">字数: {getTextLength()}</span>
      </div>
    </div>
  )
}
