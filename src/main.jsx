import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'
import './utils/Request'

// 根据环境自动设置 basename
// 开发环境: 无 basename (本地 localhost:5173/)
// 生产环境: /NewsSystemPro (GitHub Pages)
const basename = import.meta.env.MODE === 'production' ? '/NewsSystemPro' : '/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
