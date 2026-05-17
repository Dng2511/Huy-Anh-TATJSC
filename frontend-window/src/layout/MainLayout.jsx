import { Button, Layout, Menu, Space, Typography } from 'antd'
import { useState } from 'react'
import { CreateOrderModalProvider, useCreateOrderModal } from '../context/CreateOrderModalContext'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

function MainLayout({
  activePage,
  setActivePage,
  pageMeta,
  menuItems,
  children,
}) {

  // We'll render modal via provider; get open function to call when header button clicked
  const [localDummy, setLocalDummy] = useState(false)

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
            <CreateOrderButton setActivePage={setActivePage} />
          </Space>
        </Header>

        <Content className="transport-content">{children}</Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout

function CreateOrderButton({ setActivePage }) {
  // lazy import hook to avoid circular issues when provider is mounted at top-level
  let openFn = null
  try {
    // require to avoid static import cycle
    // eslint-disable-next-line global-require
    const { useCreateOrderModal } = require('../context/CreateOrderModalContext')
    // We can't call hook here; instead we'll render an inner component that uses the hook
  } catch (e) {
    // ignore
  }

  return <CreateOrderButtonInner setActivePage={setActivePage} />
}

function CreateOrderButtonInner({ setActivePage }) {
  const { open } = useCreateOrderModal()
  return (
    <Button
      className="header-action-btn"
      type="primary"
      onClick={() => {
        open()
        setActivePage('orders')
      }}
    >
      Tạo đơn vận chuyển
    </Button>
  )
}
