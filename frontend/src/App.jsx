import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Branches from './pages/Branches';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Users from './pages/Users';
import ProtectedRoute from './components/common/ProtectedRoute';
import PermissionRoute from './components/common/PermissionRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <PermissionRoute permission="dashboard.view">
                  <Dashboard />
                </PermissionRoute>
              }
            />
            <Route
              path="/branches"
              element={
                <PermissionRoute permission="branches.view" requireAdmin={true}>
                  <Branches />
                </PermissionRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PermissionRoute permission="products.view">
                  <Products />
                </PermissionRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PermissionRoute permission="inventory.view">
                  <Inventory />
                </PermissionRoute>
              }
            />
            <Route
              path="/pos"
              element={
                <PermissionRoute permission="pos.use">
                  <POS />
                </PermissionRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <PermissionRoute permission="sales.view">
                  <Sales />
                </PermissionRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PermissionRoute permission="customers.view">
                  <Customers />
                </PermissionRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PermissionRoute permission="reports.view">
                  <Reports />
                </PermissionRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PermissionRoute permission="users.view" requireAdmin={true}>
                  <Users />
                </PermissionRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

