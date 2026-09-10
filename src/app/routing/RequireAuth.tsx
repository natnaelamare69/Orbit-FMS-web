import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../session/SessionContext";
import AppLayout from "../navigation/AppLayout";

/**
 * Layout route guarding authenticated pages with the app shell.
 * Unauthenticated visitors are redirected to /login
 * (docs/adr/0003-jwt-localstorage-auth-via-gateway.md).
 */
export default function RequireAuth() {
  const { isAuthenticated } = useSession();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}