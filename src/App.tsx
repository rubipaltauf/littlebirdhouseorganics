import { Navigate, Route, Routes } from "react-router-dom";
import { RouteGate } from "./components/auth/RouteGate";
import { AppShell } from "./components/layout/AppShell";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CustomerDetail from "./pages/CustomerDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route
          path="account"
          element={
            <RouteGate>
              <Account />
            </RouteGate>
          }
        />
        <Route path="admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route
          path="admin/dashboard"
          element={
            <RouteGate requireAdmin>
              <AdminDashboard />
            </RouteGate>
          }
        />
        <Route
          path="admin/customers/:customerId"
          element={
            <RouteGate requireAdmin>
              <CustomerDetail />
            </RouteGate>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

