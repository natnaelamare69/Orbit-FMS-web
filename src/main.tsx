import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeContextProvider } from "./app/theme/ThemeContext";
import { SessionProvider } from "./app/session/SessionContext";
import { Box, CircularProgress } from "@mui/material";
import RequireAuth from "./app/routing/RequireAuth";

const LoginPage = React.lazy(() => import("./app/auth/LoginPage"));
const DashboardPage = React.lazy(() => import("./app/dashboard/DashboardPage"));
const VehicleListPage = React.lazy(() => import("./microservice/vehicle/pages/VehicleListPage"));
const DriverListPage = React.lazy(() => import("./microservice/driver/pages/DriverListPage"));
const TripListPage = React.lazy(() => import("./microservice/trip/pages/TripListPage"));
const TripDetailPage = React.lazy(() => import("./microservice/trip/pages/TripDetailPage"));
const FuelPage = React.lazy(() => import("./microservice/fuel/pages/FuelPage"));
const FraudPage = React.lazy(() => import("./microservice/fraud/pages/FraudPage"));
const MaintenancePage = React.lazy(() => import("./microservice/maintenance/pages/MaintenancePage"));
const DocumentPage = React.lazy(() => import("./microservice/document/pages/DocumentPage"));

export function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <SessionProvider>
          <React.Suspense
            fallback={
              <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
                <CircularProgress />
              </Box>
            }
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAuth />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/vehicles" element={<VehicleListPage />} />
                <Route path="/drivers" element={<DriverListPage />} />
                <Route path="/trips" element={<TripListPage />} />
                <Route path="/trips/:id" element={<TripDetailPage />} />
                <Route path="/fuel" element={<FuelPage />} />
                <Route path="/fraud" element={<FraudPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/documents" element={<DocumentPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </SessionProvider>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

export default App;