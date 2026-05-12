import { Button, Layout, Menu, Space, Typography } from 'antd'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

function MainLayout({
  t,
  activePage,
  setActivePage,
  pageMeta,
  menuItems,
  children,
}) {
  // Language switching removed — app is Vietnamese-only

  return (
    <Layout className="transport-layout">
      <Sider
        className="transport-sider"
        width={250}
        breakpoint="lg"
        collapsedWidth={0}
      >
        <div className="sider-brand">Vận Tải Huy Anh</div>
        <Menu
          className="transport-menu"
          mode="inline"
          selectedKeys={[activePage]}
          items={menuItems}
          onClick={({ key }) => setActivePage(key)}
        />
      </Sider>

      <Layout>
        <Header className="transport-header">
          <div>
            <Title level={2} className="heading-title">
              {pageMeta[activePage].title}
            </Title>
            
          </div>
          <Space wrap>
            {activePage !== 'dashboard' ? (
              <Button className="header-action-btn" onClick={() => setActivePage('dashboard')}>
                Về Bảng điều khiển
              </Button>
            ) : null}
            <Button className="header-action-btn" type="default">
              Xuất báo cáo
            </Button>
            <Button className="header-action-btn" type="primary">
              Tạo đơn vận chuyển
            </Button>
          </Space>
        </Header>

        <Content className="transport-content">{children}</Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
