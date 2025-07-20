import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardContent from './components/DashboardContent';
import LoginScreen from './components/LoginScreen';
import { ThemeProvider } from './components/ui/GlobalUI';
import { useAuth } from './hooks/useAuth';

// Import all ERP pages
import Users from './pages/Users';
import Machines from './pages/Machines';
import Molds from './pages/Molds';
import Products from './pages/Products'; // Now points to the refactored version
import RawMaterials from './pages/RawMaterials'; // Now points to the refactored version
import ProductionOrders from './pages/ProductionOrders';
import FinishedGoods from './pages/FinishedGoods'; // Now points to the refactored version
import Customers from './pages/Customers';
import SalesOrders from './pages/SalesOrders';
import QualityControl from './pages/QualityControl';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MaintenanceSchedule from './pages/MaintenanceSchedule';
import PurchaseOrders from './pages/PurchaseOrders';
import Suppliers from './pages/Suppliers';
import MachineDowntime from './pages/MachineDowntime'; // New import
import MaterialBatches from './pages/MaterialBatches'; // New import
import DailyProductionSchedule from './pages/DailyProductionSchedule'; // New import
import ProductionCosts from './pages/ProductionCosts'; // New import
import CustomerComplaints from './pages/CustomerComplaints'; // New import
import WorkOrders from './pages/WorkOrders'; // New import
import Containers from './pages/Containers'; // New import


function App() {
  const { isLoggedIn, logout, user, userRoles } = useAuth();

  // Wrapper component for pages that need layout
  const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
    <Layout handleLogout={logout} user={user} userRoles={userRoles}>
      {children}
    </Layout>
  );

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <LoginScreen />}
          />
          <Route
            path="/dashboard"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <DashboardContent />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />

          {/* ERP Module Routes - All wrapped with Layout */}
          <Route
            path="/users"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Users />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/machines"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Machines />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/machine-downtime"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <MachineDowntime />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/molds"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Molds />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/products"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Products />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/raw-materials"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <RawMaterials />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/material-batches"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <MaterialBatches />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/production-orders"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <ProductionOrders />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/daily-production-schedule"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <DailyProductionSchedule />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/production-costs"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <ProductionCosts />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/finished-goods"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <FinishedGoods />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/customers"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Customers />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/customer-complaints"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <CustomerComplaints />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/sales-orders"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <SalesOrders />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/quality-control"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <QualityControl />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/maintenance"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <MaintenanceSchedule />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/purchase-orders"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <PurchaseOrders />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/suppliers"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Suppliers />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/work-orders"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <WorkOrders />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/containers"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Containers />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/reports"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Reports />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/settings"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <Settings />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />

          {/* Legacy routes for backward compatibility */}
          <Route
            path="/production"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <ProductionOrders />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/quality"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <QualityControl />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/inventory"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <FinishedGoods />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
          <Route
            path="/sales"
            element={isLoggedIn ? (
              <LayoutWrapper>
                <SalesOrders />
              </LayoutWrapper>
            ) : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;