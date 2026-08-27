import { Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import AppLayout from "./AppLayout";
import LoginPage from "../pages/LoginPage/LoginPage";
import MailingPage from "../pages/MailingPage/MailingPage";
import SettingsPage from "../pages/SettingPage/SettingsPage";
import NotificationsPage from "../pages/NotificationsPage/NotificationsPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppProvider>
              <AppLayout />
            </AppProvider>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="mailing" element={<MailingPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} /> {/* ✅ */}
        <Route index element={<Navigate to="mailing" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}