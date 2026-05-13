import { useMemo, useState } from 'react'
import { ConfigProvider, Modal } from 'antd'
import MainLayout from '../layout/MainLayout'
import DashboardPage from '../pages/DashboardPage'
import DriversPage from '../pages/DriversPage'
import GatesPage from '../pages/GatesPage'
import OrdersPage from '../pages/OrdersPage'
import UsersPage from '../pages/UsersPage'
import VehiclesPage from '../pages/VehiclesPage'
import PartnersPage from '../pages/PartnersPage'

function AppView() {
  const [activePage, setActivePage] = useState('dashboard')
  const [hasPartnersUnsavedChanges, setHasPartnersUnsavedChanges] = useState(false)

  const requestPageChange = (nextPage) => {
    if (nextPage === activePage) {
      return
    }

    if (activePage === 'partners' && hasPartnersUnsavedChanges) {
      Modal.confirm({
        title: 'Bạn có thay đổi chưa lưu',
        content: 'Rời trang sẽ mất các thay đổi chưa lưu. Bạn có muốn tiếp tục?',
        okText: 'Rời trang',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        style: {
          top: 250,
        },
        onOk: () => {
          setHasPartnersUnsavedChanges(false)
          setActivePage(nextPage)
        },
      })
      return
    }

    setActivePage(nextPage)
  }

  const renderPageContent = () => {
    switch (activePage) {
      case 'orders':
        return (
          <OrdersPage
          />
        )
      case 'vehicles':
        return (
          <VehiclesPage
          />
        )
      case 'drivers':
        return (
          <DriversPage
          />
        )
      case 'gates':
        return (
          <GatesPage
          />
        )
      case 'partners':
        return (
          <PartnersPage
            onDirtyChange={setHasPartnersUnsavedChanges}
          />
        )
      default:
        return (
          <DashboardPage
            metrics={metrics}
            trackingVehicles={trackingVehicles}
            menuItems={menuItems}
            pageMeta={pageMeta}
            formatCurrency={formatCurrency}
            onNavigate={(key) => requestPageChange(key)}
          />
        )
    }
  }

  const pageMeta = useMemo(() => ({
    dashboard: {
      title: 'Bảng điều khiển',
      description: '',
    },
    orders: {
      title: 'Đơn hàng',
      description: '',
    },
    vehicles: {
      title: 'Phương tiện',
      description: '',
    },
    drivers: {
      title: 'Tài xế',
      description: '',
    },
    partners: {
      title: 'Đối tác',
      description: '',
    },
    gates: {
      title: 'Cửa khẩu',
      description: '',
    },

    costs: {
      title: 'Chi phí',
      description: '',
    },
    billing: {
      title: 'Thanh toán',
      description: '',
    },
    reports: {
      title: 'Báo cáo',
      description: '',
    },
    users: {
      title: 'Người dùng',
      description: '',
    },
  }), [])

  const menuItems = useMemo(
    () => [
      { key: 'dashboard', label: 'Bảng điều khiển' },
      { key: 'orders', label: 'Đơn hàng' },
      { key: 'vehicles', label: 'Phương tiện' },
      { key: 'drivers', label: 'Tài xế' },
      { key: 'partners', label: 'Đối tác' },
      { key: 'gates', label: 'Cửa khẩu' },
      { key: 'costs', label: 'Chi phí' },
      { key: 'billing', label: 'Thanh toán' },
      { key: 'reports', label: 'Báo cáo' },
      { key: 'users', label: 'Người dùng' },
    ],
    []
  )

  const metrics = useMemo(() => ({
    totalOrdersToday: 0,
    activeVehicles: 0,
    deliveringOrders: 0,
    revenueToday: 0,
  }), [])

  const trackingVehicles = useMemo(() => [], [])

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
    } catch (e) {
      return `${value || 0}`
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0e6b63',
          colorBgBase: '#f6f8f4',
          colorBgContainer: '#ffffff',
          colorText: '#173230',
          colorTextHeading: '#0d2524',
          colorTextSecondary: '#ffffff',
          colorBorderSecondary: '#d7e2df',
          borderRadius: 14,
          fontFamily: '"Manrope", "Be Vietnam Pro", sans-serif',
        },
      }}
    >
      <MainLayout
        activePage={activePage}
        setActivePage={requestPageChange}
        pageMeta={pageMeta}
        menuItems={menuItems}
      >
        {renderPageContent()}
      </MainLayout>
    </ConfigProvider>
  )
}

export default AppView
