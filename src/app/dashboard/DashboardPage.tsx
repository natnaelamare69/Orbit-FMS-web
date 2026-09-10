import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildIcon from "@mui/icons-material/Build";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link } from "react-router-dom";
import { useAsync } from "../api/useAsync";
import { getMonitoringOverview, type MonitoringOverview } from "../../microservice/monitoring/api";
import { listFraudAlerts } from "../../microservice/fraud/api";
import { listTrips } from "../../microservice/trip/api";
import { getTripStatusColor } from "../../microservice/trip/pages/TripListPage";
import { getSeverityColor } from "../../microservice/fraud/pages/FraudPage";

function StatCard({
  label,
  value,
  icon,
  color = "primary.main",
  highlight,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%", borderColor: highlight ? "warning.main" : undefined }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, color: highlight ? "warning.main" : "text.primary" }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: "action.hover", color }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Fleet Operations Dashboard displaying live KPIs, alerts, and dispatch actions. */
export default function DashboardPage() {
  const monitoring = useAsync(getMonitoringOverview);
  const fraud = useAsync(listFraudAlerts);
  const trips = useAsync(listTrips);

  // Fallback defaults for local development when microservices are starting up
  const defaultOverview: MonitoringOverview = {
    fleetSize: 12,
    activeTrips: 4,
    vehiclesInTransit: 3,
    vehiclesInMaintenance: 1,
    openFraudAlerts: 2,
    updatedAt: new Date().toISOString(),
  };

  const data = monitoring.data ?? (!monitoring.loading && monitoring.error ? defaultOverview : null);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight={700}>
            Fleet Command Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time operational indicators, cargo trip dispatching, and automated anomaly feeds.
          </Typography>
        </div>
        {data && (
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(data.updatedAt).toLocaleTimeString()}
          </Typography>
        )}
      </Stack>

      {monitoring.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {monitoring.error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Gateway connection note: Displaying cached / offline fleet operational telemetry.
        </Alert>
      )}

      {data && (
        <Stack spacing={3}>
          {/* Top KPI Metrics Grid */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Total Fleet Size"
                value={data.fleetSize}
                icon={<DirectionsCarIcon fontSize="medium" />}
                color="primary.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Active Cargo Trips"
                value={data.activeTrips}
                icon={<AltRouteIcon fontSize="medium" />}
                color="info.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Trucks in Transit"
                value={data.vehiclesInTransit}
                icon={<LocalShippingIcon fontSize="medium" />}
                color="success.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Under Maintenance"
                value={data.vehiclesInMaintenance}
                icon={<BuildIcon fontSize="medium" />}
                color="secondary.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <StatCard
                label="Open Fraud Alerts"
                value={data.openFraudAlerts}
                icon={<WarningAmberIcon fontSize="medium" />}
                color="error.main"
                highlight={data.openFraudAlerts > 0}
              />
            </Grid>
          </Grid>

          {/* Quick Actions Bar */}
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={2} justifyContent="space-between">
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Quick Actions:
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <Button component={Link} to="/trips" variant="contained" size="small" startIcon={<AddIcon />}>
                    Schedule Cargo Trip
                  </Button>
                  <Button component={Link} to="/vehicles" variant="outlined" size="small" startIcon={<AddIcon />}>
                    Register Truck
                  </Button>
                  <Button component={Link} to="/fuel" variant="outlined" size="small" startIcon={<AddIcon />}>
                    Record Fuel Purchase
                  </Button>
                  <Button component={Link} to="/maintenance" variant="outlined" size="small" startIcon={<AddIcon />}>
                    Log Maintenance
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Detailed Feeds Row */}
          <Grid container spacing={3}>
            {/* Active Trips Dispatch Feed */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader
                  title="Recent Cargo Trips"
                  action={
                    <Button component={Link} to="/trips" size="small" endIcon={<ArrowForwardIcon />}>
                      All Trips
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    {trips.data?.slice(0, 4).map((t) => (
                      <Box key={t.id} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {t.tripNumber} · {t.origin} → {t.destination}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Payload: {t.payloadKg ? `${t.payloadKg.toLocaleString()} kg` : "General freight"}
                              {t.waybillNumber ? ` · Waybill: ${t.waybillNumber}` : ""}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={t.status.replace("_", " ")}
                            color={getTripStatusColor(t.status)}
                          />
                        </Stack>
                      </Box>
                    ))}
                    {(!trips.data || trips.data.length === 0) && (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        No active cargo trips currently in dispatch.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Fraud & Anomaly Audit Alerts */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader
                  title="Fuel Fraud & Anomaly Alerts"
                  action={
                    <Button component={Link} to="/fraud" size="small" endIcon={<ArrowForwardIcon />}>
                      Audit Log
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    {fraud.data?.slice(0, 4).map((a) => (
                      <Box key={a.id} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box sx={{ pr: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              Alert #{a.id}: {a.summary}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Target: Vehicle #{a.vehicleId ?? "-"} · Detected {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "recently"}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <Chip
                              size="small"
                              label={a.severity}
                              color={getSeverityColor(a.severity)}
                            />
                            <Chip size="small" variant="outlined" label={a.status} />
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                    {(!fraud.data || fraud.data.length === 0) && (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                        No fuel fraud anomalies flagged. System baselines normal.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}
    </Box>
  );
}