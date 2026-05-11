import { useMemo, useState } from 'react'
import { ConfigProvider } from 'antd'
import MainLayout from '../layout/MainLayout'
import DashboardPage from '../pages/DashboardPage'
import DriversPage from '../pages/DriversPage'
import GatesPage from '../pages/GatesPage'
import OrdersPage from '../pages/OrdersPage'
import UsersPage from '../pages/UsersPage'
import VehiclesPage from '../pages/VehiclesPage'

function AppView({ t, language }) {
  const [activePage, setActivePage] = useState('dashboard')

  const renderPageContent = () => {
    switch (activePage) {
      // case 'orders':
      //   return (
      //     <OrdersPage
      //       t={t}
      //     />
      //   )
      // case 'vehicles':
      //   return (
      //     <VehiclesPage
      //       t={t}
      //     />
      //   )
      case 'drivers':
        return (
          <DriversPage
            t={t}
          />
        )
      case 'gates':
        return (
          <GatesPage
            t={t}
          />
        )
      default:
        return (
          <DashboardPage
            t={t}
            metrics={metrics}
            trackingVehicles={trackingVehicles}
            menuItems={menuItems}
            pageMeta={pageMeta}
            formatCurrency={formatCurrency}
            onNavigate={(key) => setActivePage(key)}
          />
        )
    }
  }

  const pageMeta = useMemo(() => ({
    dashboard: {
      title: t('page.dashboard.title', 'Dashboard'),
      description: t('page.dashboard.description', ''),
    },
    orders: {
      title: t('page.orders.title', 'Orders'),
      description: t('page.orders.description', ''),
    },
    vehicles: {
      title: t('page.vehicles.title', 'Vehicles'),
      description: t('page.vehicles.description', ''),
    },
    drivers: {
      title: t('page.drivers.title', 'Drivers'),
      description: t('page.drivers.description', ''),
    },
    trips: {
      title: t('page.trips.title', 'Trips'),
      description: t('page.trips.description', ''),
    },
    tracking: {
      title: t('page.tracking.title', 'Tracking'),
      description: t('page.tracking.description', ''),
    },
    gates: {
      title: t('page.gates.title', 'Gates'),
      description: t('page.gates.description', ''),
    },
    warehouse: {
      title: t('page.warehouse.title', 'Warehouse'),
      description: t('page.warehouse.description', ''),
    },
    costs: {
      title: t('page.costs.title', 'Costs'),
      description: t('page.costs.description', ''),
    },
    billing: {
      title: t('page.billing.title', 'Billing'),
      description: t('page.billing.description', ''),
    },
    reports: {
      title: t('page.reports.title', 'Reports'),
      description: t('page.reports.description', ''),
    },
    users: {
      title: t('page.users.title', 'Users'),
      description: t('page.users.description', ''),
    },
  }), [t])

  const menuItems = useMemo(
    () => [
      { key: 'dashboard', label: t('menu.dashboard', 'Dashboard') },
      { key: 'orders', label: t('menu.orders', 'Orders') },
      { key: 'vehicles', label: t('menu.vehicles', 'Vehicles') },
      { key: 'drivers', label: t('menu.drivers', 'Drivers') },
      { key: 'trips', label: t('menu.trips', 'Trips') },
      { key: 'tracking', label: t('menu.tracking', 'Tracking') },
      { key: 'gates', label: t('menu.gates', 'Gates') },
      { key: 'warehouse', label: t('menu.warehouse', 'Warehouse') },
      { key: 'costs', label: t('menu.costs', 'Costs') },
      { key: 'billing', label: t('menu.billing', 'Billing') },
      { key: 'reports', label: t('menu.reports', 'Reports') },
      { key: 'users', label: t('menu.users', 'Users') },
    ],
    [t]
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
        t={t}
        language={language}
        activePage={activePage}
        setActivePage={setActivePage}
        pageMeta={pageMeta}
        menuItems={menuItems}
      >
        {renderPageContent()}
      </MainLayout>
    </ConfigProvider>
  )
}

export default AppView
