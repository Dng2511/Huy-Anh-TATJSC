import { ConfigProvider } from 'antd'
import MainLayout from '../layout/MainLayout'
import BillingPage from '../pages/BillingPage'
import CostsPage from '../pages/CostsPage'
import DashboardPage from '../pages/DashboardPage'
import DriversPage from '../pages/DriversPage'
import OrdersPage from '../pages/OrdersPage'
import ReportsPage from '../pages/ReportsPage'
import TrackingPage from '../pages/TrackingPage'
import TripsPage from '../pages/TripsPage'
import UsersPage from '../pages/UsersPage'
import VehiclesPage from '../pages/VehiclesPage'
import WarehousePage from '../pages/WarehousePage'

function AppView({ t, language, vm }) {
  const renderPageContent = () => {
    switch (vm.activePage) {
      case 'orders':
        return (
          <OrdersPage
            t={t}
            statusFilter={vm.statusFilter}
            setStatusFilter={vm.setStatusFilter}
            filteredOrders={vm.filteredOrders}
            orderStatusColor={vm.model.orderStatusColor}
          />
        )
      case 'vehicles':
        return (
          <VehiclesPage
            t={t}
            vehicles={vm.model.vehicles}
            vehicleStatusColor={vm.model.vehicleStatusColor}
          />
        )
      case 'drivers':
        return (
          <DriversPage
            t={t}
            drivers={vm.model.drivers}
            driverStatusColor={vm.model.driverStatusColor}
          />
        )
      case 'trips':
        return <TripsPage t={t} trips={vm.model.trips} />
      case 'tracking':
        return (
          <TrackingPage
            t={t}
            mapMarkers={vm.model.mapMarkers}
            trackingVehicles={vm.model.trackingVehicles}
          />
        )
      case 'warehouse':
        return <WarehousePage t={t} inventory={vm.model.inventory} />
      case 'costs':
        return (
          <CostsPage t={t} costRows={vm.model.costRows} formatCurrency={vm.formatCurrency} />
        )
      case 'billing':
        return (
          <BillingPage t={t} invoices={vm.model.invoices} formatCurrency={vm.formatCurrency} />
        )
      case 'reports':
        return (
          <ReportsPage t={t} metrics={vm.model.metrics} formatCurrency={vm.formatCurrency} />
        )
      case 'users':
        return <UsersPage t={t} users={vm.model.users} />
      default:
        return (
          <DashboardPage
            t={t}
            metrics={vm.model.metrics}
            trackingVehicles={vm.model.trackingVehicles}
            menuItems={vm.translatedMenuItems}
            pageMeta={vm.translatedPageMeta}
            formatCurrency={vm.formatCurrency}
            onNavigate={vm.setActivePage}
          />
        )
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
        activePage={vm.activePage}
        setActivePage={vm.setActivePage}
        pageMeta={vm.translatedPageMeta}
        menuItems={vm.translatedMenuItems}
      >
        {renderPageContent()}
      </MainLayout>
    </ConfigProvider>
  )
}

export default AppView
