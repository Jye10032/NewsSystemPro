import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // GitHub Pages 部署时需要设置 base
  // 本地开发时为 '/', 部署到 GitHub Pages 时为 '/仓库名/'
  base: process.env.NODE_ENV === 'production' ? '/NewsSystemPro/' : '/',

  plugins: [
    react({
      include: ['**/*.jsx', '**/*.tsx', '**/*.js'],
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  define: {
    global: 'globalThis',
  },

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    proxy: {
      // API 代理到后端服务
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // 静态资源代理
      '/festatic': {
        target: 'https://obj.pipi.cn',
        changeOrigin: true,
      },
    },
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          redux: ['redux', 'react-redux', 'redux-thunk', 'redux-persist'],
        },
      },
    },
  },

  // CSS 配置
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";',
      },
    },
  },

  // 测试配置
  test: {
    // 使用 jsdom 模拟浏览器环境
    environment: 'jsdom',
    // 测试文件匹配规则
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    // 全局配置
    globals: true,
    // 设置文件
    setupFiles: './src/test/setup.js',

    // CI 环境性能优化
    pool: 'forks',  // 使用 forks 而不是 threads，在 CI 中更稳定
    poolOptions: {
      forks: {
        singleFork: true,  // 单进程运行，避免并发问题
      },
    },

    // 超时配置
    testTimeout: 10000,  // 单个测试超时 10 秒
    hookTimeout: 10000,  // Hook 超时 10 秒

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.{js,jsx}',
        '**/*.test.{js,jsx}',
        '**/dist/**',
      ],
    },
  },
})
