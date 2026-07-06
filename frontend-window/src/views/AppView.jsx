import { useEffect, useMemo, useRef, useState } from 'react'
import { ConfigProvider, Modal } from 'antd'
import { useAuth } from '../context/AuthContext'
import LoginPage from '../pages/Auth/LoginPage'
import MainLayout from '../layout/MainLayout'
import { CreateOrderModalProvider } from '../context/CreateOrderModalContext'
import DashboardPage from '../pages/DashboardPage'
import DriversPage from '../pages/DriversPage'
import GatesPage from '../pages/GatesPage'
import FeesPage from '../pages/FeesPage'
import OrdersPage from '../pages/OrdersPage'
import UsersPage from '../pages/UsersPage'
import VehiclesPage from '../pages/VehiclesPage'
import PartnersPage from '../pages/PartnersPage'
import AuditLogsPage from '../pages/AuditLogsPage'
import dashboardApi from '../services/Api/dashboardApi'

function AppView() {
  const { user, loading } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  const [hasPartnersUnsavedChanges, setHasPartnersUnsavedChanges] = useState(false)
  const [hasFeesUnsavedChanges, setHasFeesUnsavedChanges] = useState(false)
  const [dashboardSummary, setDashboardSummary] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [dashboardView, setDashboardView] = useState('year')
  const [dashboardYear, setDashboardYear] = useState(currentYear)
  const [dashboardMonth, setDashboardMonth] = useState(currentMonthKey)
  const previousActivePageRef = useRef(activePage)
  const canViewUsers = user?.role === 'admin'
  const availableYears = useMemo(() => Array.from({ length: 6 }, (_, index) => currentYear - index), [currentYear])

  const getMonthForYear = (targetYear, currentMonthKeyValue) => `${targetYear}-${String(currentMonthKeyValue).split('-')[1] || '01'}`

  const loadDashboardSummary = async ({ view = dashboardView, year = dashboardYear, month = dashboardMonth } = {}) => {
    try {
      setDashboardLoading(true)
      const summary = await dashboardApi.getSummary({
        view,
        year,
        month,
      })
      setDashboardSummary(summary)
    } catch (error) {
      console.error('Error loading dashboard summary:', error)
      setDashboardSummary(null)
    } finally {
      setDashboardLoading(false)
    }
  }

  const requestPageChange = (nextPage) => {
    if (nextPage === activePage) {
      return
    }

    if (nextPage === 'users' && !canViewUsers) {
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

    if (activePage === 'costs' && hasFeesUnsavedChanges) {
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
          setHasFeesUnsavedChanges(false)
          setActivePage(nextPage)
        },
      })
      return
    }

    setActivePage(nextPage)
  }

  useEffect(() => {
    if (activePage === 'users' && !canViewUsers) {
      setActivePage('dashboard')
    }
  }, [activePage, canViewUsers])

  useEffect(() => {
    if (user && activePage === 'dashboard' && previousActivePageRef.current !== 'dashboard') {
      void loadDashboardSummary()
    }

    previousActivePageRef.current = activePage
  }, [activePage, user])

  useEffect(() => {
    if (user) {
      void loadDashboardSummary()
    }
  }, [user])

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
      case 'costs':
        return <FeesPage onDirtyChange={setHasFeesUnsavedChanges} />
      case 'partners':
        return (
          <PartnersPage
            onDirtyChange={setHasPartnersUnsavedChanges}
          />
        )
      case 'users':
        return canViewUsers ? <UsersPage /> : (
          <DashboardPage
            summary={dashboardSummary}
            loading={dashboardLoading}
            view={dashboardView}
            year={dashboardYear}
            month={dashboardMonth}
            availableYears={availableYears}
            menuItems={menuItems}
            pageMeta={pageMeta}
            formatCurrency={formatCurrency}
            onNavigate={(key) => requestPageChange(key)}
            onChangeView={(nextView) => {
              setDashboardView(nextView)
              void loadDashboardSummary({ view: nextView, year: dashboardYear, month: dashboardMonth })
            }}
            onChangeYear={(nextYear) => {
              setDashboardYear(nextYear)
              const nextMonth = getMonthForYear(nextYear, dashboardMonth)
              setDashboardMonth(nextMonth)
              void loadDashboardSummary({ view: dashboardView, year: nextYear, month: nextMonth })
            }}
            onChangeMonth={(nextMonth) => {
              setDashboardMonth(nextMonth)
              void loadDashboardSummary({ view: dashboardView, year: dashboardYear, month: nextMonth })
            }}
          />
        )
      case 'audit':
        return canViewUsers ? <AuditLogsPage /> : (
          <DashboardPage
            summary={dashboardSummary}
            loading={dashboardLoading}
            view={dashboardView}
            year={dashboardYear}
            month={dashboardMonth}
            availableYears={availableYears}
            menuItems={menuItems}
            pageMeta={pageMeta}
            formatCurrency={formatCurrency}
            onNavigate={(key) => requestPageChange(key)}
            onChangeView={(nextView) => {
              setDashboardView(nextView)
              void loadDashboardSummary({ view: nextView, year: dashboardYear, month: dashboardMonth })
            }}
            onChangeYear={(nextYear) => {
              setDashboardYear(nextYear)
              const nextMonth = getMonthForYear(nextYear, dashboardMonth)
              setDashboardMonth(nextMonth)
              void loadDashboardSummary({ view: dashboardView, year: nextYear, month: nextMonth })
            }}
            onChangeMonth={(nextMonth) => {
              setDashboardMonth(nextMonth)
              void loadDashboardSummary({ view: dashboardView, year: dashboardYear, month: nextMonth })
            }}
          />
        )
      default:
        return (
          <DashboardPage
            summary={dashboardSummary}
            loading={dashboardLoading}
            view={dashboardView}
            year={dashboardYear}
            month={dashboardMonth}
            availableYears={availableYears}
            menuItems={menuItems}
            pageMeta={pageMeta}
            formatCurrency={formatCurrency}
            onNavigate={(key) => requestPageChange(key)}
            onChangeView={(nextView) => {
              setDashboardView(nextView)
              void loadDashboardSummary({ view: nextView, year: dashboardYear, month: dashboardMonth })
            }}
            onChangeYear={(nextYear) => {
              setDashboardYear(nextYear)
              const nextMonth = getMonthForYear(nextYear, dashboardMonth)
              setDashboardMonth(nextMonth)
              void loadDashboardSummary({ view: dashboardView, year: nextYear, month: nextMonth })
            }}
            onChangeMonth={(nextMonth) => {
              setDashboardMonth(nextMonth)
              void loadDashboardSummary({ view: dashboardView, year: dashboardYear, month: nextMonth })
            }}
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
      title: 'Khách hàng',
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
    users: {
      title: 'Người dùng',
      description: '',
    },
    audit: {
      title: 'Lịch sử thao tác',
      description: '',
    },
  }), [])

  const menuItems = useMemo(
    () => [
      { key: 'dashboard', label: 'Bảng điều khiển' },
      { key: 'orders', label: 'Đơn hàng' },
      { key: 'vehicles', label: 'Phương tiện' },
      { key: 'drivers', label: 'Tài xế' },
      { key: 'partners', label: 'Khách hàng' },
      { key: 'gates', label: 'Cửa khẩu' },
      { key: 'costs', label: 'Chi phí' },
      ...(canViewUsers ? [{ key: 'users', label: 'Người dùng' }, { key: 'audit', label: 'Lịch sử thao tác' }] : []),
    ],
    [canViewUsers]
  )

  const formatCurrency = (value) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)
    } catch (e) {
      return `${value || 0}`
    }
  }

  if (loading) return null

  if (!user) return <LoginPage />

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
      <CreateOrderModalProvider onCreatedRedirect={() => setActivePage('orders')}>
        <MainLayout
          activePage={activePage}
          setActivePage={requestPageChange}
          pageMeta={pageMeta}
          menuItems={menuItems}
        >
          {renderPageContent()}
        </MainLayout>
      </CreateOrderModalProvider>
    </ConfigProvider>
  )
}

export default AppView
