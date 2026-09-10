import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeContextProvider } from "./app/theme/ThemeContext";
import { SessionProvider } from "./app/session/SessionContext";
import RequireAuth from "./app/routing/RequireAuth";
import LoginPage from "./app/auth/LoginPage";
import DashboardPage from "./app/dashboard/DashboardPage";
import VehicleListPage from "./microservice/vehicle/pages/VehicleListPage";
import DriverListPage from "./microservice/driver/pages/DriverListPage";
import TripListPage from "./microservice/trip/pages/TripListPage";
import TripDetailPage from "./microservice/trip/pages/TripDetailPage";
import FuelPage from "./microservice/fuel/pages/FuelPage";
import FraudPage from "./microservice/fraud/pages/FraudPage";
import MaintenancePage from "./microservice/maintenance/pages/MaintenancePage";
import DocumentPage from "./microservice/document/pages/DocumentPage";

export function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <SessionProvider>
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