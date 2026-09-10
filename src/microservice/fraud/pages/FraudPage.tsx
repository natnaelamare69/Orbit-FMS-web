import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ShieldAlertIcon from "@mui/icons-material/SecurityUpdateWarning";
import { useAsync } from "../../../app/api/useAsync";
import type { FraudAlert } from "../../../app/domain/types";
import { listFraudAlerts, reviewFraudAlert, type FraudTriage } from "../api";
import { listVehicles } from "../../vehicle/api";

export function getSeverityColor(severity: string): "error" | "warning" | "info" | "default" {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
    case "HIGH":
      return "error";
    case "MEDIUM":
      return "warning";
    case "LOW":
      return "info";
    default:
      return "default";
  }
}

export function getTriageStatusColor(status: string): "warning" | "info" | "secondary" | "success" | "default" {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return "warning";
    case "INVESTIGATING":
      return "info";
    case "ESCALATED":
      return "secondary";
    case "DISMISSED":
      return "default";
    default:
      return "default";
  }
}

export default function FraudPage() {
  const alerts = useAsync(listFraudAlerts);
  const vehicles = useAsync(listVehicles);
  const [selected, setSelected] = useState<FraudAlert | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [triageNotes, setTriageNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const vehicleMap = useMemo(() => {
    const map = new Map<number, string>();
    vehicles.data?.forEach((v) => map.set(v.id, `${v.registrationNumber} (${v.make ?? ""} ${v.model ?? ""})`));
    return map;
  }, [vehicles.data]);

  const stats = useMemo(() => {
    if (!alerts.data) return { open: 0, critical: 0, investigating: 0, escalated: 0 };
    return {
      open: alerts.data.filter((a) => a.status === "OPEN").length,
      critical: alerts.data.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH").length,
      investigating: alerts.data.filter((a) => a.status === "INVESTIGATING").length,
      escalated: alerts.data.filter((a) => a.status === "ESCALATED").length,
    };
  }, [alerts.data]);

  const filteredAlerts = useMemo(() => {
    if (!alerts.data) return [];
    return alerts.data.filter((a) => {
      const matchStatus = selectedStatus === "ALL" || a.status === selectedStatus;
      const matchSeverity = selectedSeverity === "ALL" || a.severity === selectedSeverity;
      return matchStatus && matchSeverity;
    });
  }, [alerts.data, selectedStatus, selectedSeverity]);

  const act = async (id: number, triage: FraudTriage) => {
    setError(null);
    setBusy(true);
    try {
      await reviewFraudAlert(id, triage, triageNotes || undefined);
      setSelected(null);
      setTriageNotes("");
      alerts.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2 }}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            Fuel Fraud & Anomaly Triage
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-assisted statistical anomaly detection and management audit review.
          </Typography>
        </div>
      </Stack>

      {/* Decision-Support Alert Banner (ADR-0003) */}
      <Alert severity="info" icon={<ShieldAlertIcon />} sx={{ mb: 3 }}>
        <strong>Decision-Support Notice:</strong> Flagged anomalies are automated statistical variances (e.g. &gt;20% over baseline consumption or odometer route divergence). They represent alerts for human review and administrative investigation, not proof of wrongdoing.
      </Alert>

      {/* Overview KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Open Alerts
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main" sx={{ mt: 0.5 }}>
                {stats.open}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                High / Critical Severity
              </Typography>
              <Typography variant="h5" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                {stats.critical}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Under Investigation
              </Typography>
              <Typography variant="h5" fontWeight={700} color="info.main" sx={{ mt: 0.5 }}>
                {stats.investigating}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Escalated
              </Typography>
              <Typography variant="h5" fontWeight={700} color="secondary.main" sx={{ mt: 0.5 }}>
                {stats.escalated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Tabs
          value={selectedStatus}
          onChange={(_, v) => setSelectedStatus(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${alerts.data?.length ?? 0})`} value="ALL" />
          <Tab label="Open" value="OPEN" />
          <Tab label="Investigating" value="INVESTIGATING" />
          <Tab label="Escalated" value="ESCALATED" />
          <Tab label="Dismissed" value="DISMISSED" />
        </Tabs>

        <TextField
          select
          size="small"
          label="Filter by Severity"
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="ALL">All Severities</MenuItem>
          <MenuItem value="CRITICAL">Critical</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="LOW">Low</MenuItem>
        </TextField>
      </Stack>

      {alerts.error && <Alert severity="error" sx={{ mb: 2 }}>{alerts.error}</Alert>}
      {alerts.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {!alerts.loading && alerts.data && (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Alert ID</TableCell>
              <TableCell>Summary & Description</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Detected On</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.map((a: FraudAlert) => (
              <TableRow
                key={a.id}
                hover
                onClick={() => {
                  setSelected(a);
                  setTriageNotes("");
                }}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Typography fontWeight={600} variant="body2">
                    #{a.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {a.summary}
                  </Typography>
                </TableCell>
                <TableCell>
                  {a.vehicleId ? vehicleMap.get(a.vehicleId) ?? `Vehicle #${a.vehicleId}` : "-"}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={getSeverityColor(a.severity)}
                    label={a.severity}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={getTriageStatusColor(a.status)}
                    label={a.status}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined">
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredAlerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No fraud alerts found matching the selected filter.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Review Dialog */}
      <Dialog open={selected !== null} onClose={() => !busy && setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>Triage Fraud Alert #{selected.id}</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selected.summary}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Target: {selected.vehicleId ? vehicleMap.get(selected.vehicleId) ?? `Vehicle #${selected.vehicleId}` : "Fleet wide"}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip size="small" color={getSeverityColor(selected.severity)} label={`Severity: ${selected.severity}`} />
                  <Chip size="small" variant="outlined" label={`Current Status: ${selected.status}`} />
                </Stack>

                <TextField
                  label="Investigator / Auditor Notes (Optional)"
                  multiline
                  rows={3}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Record findings, route verification notes, or reason for dismissal…"
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
              <Button onClick={() => setSelected(null)} disabled={busy} color="inherit">
                Close
              </Button>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => void act(selected.id, "DISMISSED")}
                  color="inherit"
                  disabled={busy}
                >
                  Dismiss
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => void act(selected.id, "ESCALATED")}
                  color="warning"
                  disabled={busy}
                >
                  Escalate
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void act(selected.id, "INVESTIGATING")}
                  color="primary"
                  disabled={busy}
                >
                  Investigate
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}