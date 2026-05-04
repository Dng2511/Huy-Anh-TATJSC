import { Button, Layout, Menu, Segmented, Space, Typography } from 'antd'
import { useI18n } from '../i18n/I18nContext'

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
  const { language, setLanguage, languages } = useI18n()
  const flagByLanguage = {
    vi: {
      src: 'https://flagcdn.com/w40/vn.png',
      alt: 'Vietnam',
    },
    en: {
      src: 'https://flagcdn.com/w40/us.png',
      alt: 'United States',
    },
    ja: {
      src: 'https://flagcdn.com/w40/jp.png',
      alt: 'Japan',
    },
    zh: {
      src: 'https://flagcdn.com/w40/cn.png',
      alt: 'China',
    },
  }

  return (
    <Layout className="transport-layout">
      <Sider
        className="transport-sider"
        width={250}
        breakpoint="lg"
        collapsedWidth={0}
      >
        <div className="sider-brand">{t('brand.name', 'Van Tai Huy Anh')}</div>
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
            <Text className="heading-subtitle">{pageMeta[activePage].description}</Text>
          </div>
          <Space wrap>
            <Space className="language-control" size={8}>
              <Segmented
                className="language-flag-switcher"
                value={language}
                onChange={setLanguage}
                options={languages.map((code) => ({
                  value: code,
                  label: (
                    <span
                      className="flag-option"
                      title={`${t(`language.${code}`, code)} (${code.toUpperCase()})`}
                    >
                      {flagByLanguage[code] ? (
                        <img
                          className="flag-image"
                          src={flagByLanguage[code].src}
                          alt={flagByLanguage[code].alt}
                          loading="lazy"
                        />
                      ) : (
                        '🌐'
                      )}
                    </span>
                  ),
                }))}
                aria-label="Language selector"
              />
            </Space>
            {activePage !== 'dashboard' ? (
              <Button className="header-action-btn" onClick={() => setActivePage('dashboard')}>
                {t('action.backDashboard', 'Ve Dashboard')}
              </Button>
            ) : null}
            <Button className="header-action-btn" type="default">
              {t('action.exportReport', 'Xuat bao cao')}
            </Button>
            <Button className="header-action-btn" type="primary">
              {t('action.createOrder', 'Tao don van chuyen')}
            </Button>
          </Space>
        </Header>

        <Content className="transport-content">{children}</Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
