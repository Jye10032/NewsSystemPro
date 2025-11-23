/**
 * Ant Design 主题配置
 */
export const antdTheme = {
  token: {
    colorPrimary: '#1677ff', // 科技蓝
    borderRadius: 6,         // 圆角
    wireframe: false,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f7fa', // 极淡的灰蓝背景，让白色卡片浮起
  },
  components: {
    Layout: {
      // siderBg: '#ffffff', // 侧边栏改为白色 (在 SideMenu 组件中设置 theme='light' 会自动处理，这里可以留空或显式指定)
      // headerBg: '#ffffff', // 顶栏改为白色
      bodyBg: '#f5f7fa',  // 主体内容背景色
    },
    Menu: {
      // 优化菜单选中态，使其不那么突兀
      itemSelectedBg: '#e6f4ff',
      itemSelectedColor: '#1677ff',
    },
    Table: {
      headerBorderRadius: 6,
      headerBg: '#fafafa', // 表头背景微调
    },
    Card: {
      borderRadiusLG: 8, // 卡片圆角稍大
    }
  },
}
