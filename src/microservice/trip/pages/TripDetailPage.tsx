import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CancelIcon from "@mui/icons-material/Cancel";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import { Link, useParams } from "react-router-dom";
import { useAsync } from "../../../app/api/useAsync";
import { DriverStatus, TRIP_TRANSITIONS, TripStatus, VehicleStatus, type Driver, type Vehicle } from "../../../app/domain/types";
import { assignTrip, cancelTrip, getTrip, transitionTrip } from "../api";
import { listVehicles } from "../../vehicle/api";
import { listDrivers } from "../../driver/api";
import { getTripStatusColor } from "./TripListPage";

const STEPS = [
  TripStatus.UNASSIGNED,
  TripStatus.ASSIGNED,
  TripStatus.LOADING,
  TripStatus.IN_TRANSIT,
  TripStatus.UNLOADING,
  TripStatus.COMPLETED,
];

const STEP_INDEX: Record<TripStatus, number> = {
  [TripStatus.UNASSIGNED]: 0,
  [TripStatus.ASSIGNED]: 1,
  [TripStatus.LOADING]: 2,
  [TripStatus.IN_TRANSIT]: 3,
  [TripStatus.INCIDENT]: -1,
  [TripStatus.UNLOADING]: 4,
  [TripStatus.COMPLETED]: 5,
  [TripStatus.CANCELLED]: -1,
};

/** Trip detail with lifecycle stepper, vehicle/driver assignment, and waybill document. */
export default function TripDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const trip = useAsync(() => getTrip(id), [id]);
  const vehicles = useAsync(listVehicles);
  const drivers = useAsync(listDrivers);

  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | "">("");
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");
  const [busy, setBusy] = useState(false);

  const current = trip.data;
  const stepIndex = current ? STEP_INDEX[current.status] ?? -1 : -1;
  const legalNextTransitions = (current ? TRIP_TRANSITIONS[current.status] : undefined) ?? [];
  const canCancel = legalNextTransitions.includes(TripStatus.CANCELLED);

  const assignedVehicle = vehicles.data?.find((v) => v.id === current?.vehicleId);
  const assignedDriver = drivers.data?.find((d) => d.id === current?.driverId);

  const advance = async (target: TripStatus) => {
    if (target === TripStatus.CANCELLED) {
      setCancelOpen(true);
      return;
    }
    if (target === TripStatus.ASSIGNED && (!current?.vehicleId || !current?.driverId)) {
      setAssignOpen(true);
      return;
    }
    setError(null);
    try {
      await transitionTrip(id, target);
      trip.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transition failed.");
    }
  };

  const handleAssign = async () => {
    if (!selectedVehicleId || !selectedDriverId) {
      setError("Both a vehicle and a driver must be selected.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await assignTrip(id, Number(selectedVehicleId), Number(selectedDriverId));
      setAssignOpen(false);
      trip.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await cancelTrip(id, cancelReason || undefined);
      setCancelOpen(false);
      trip.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Button component={Link} to="/trips" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Trips
      </Button>

      {trip.error && <Alert severity="error" sx={{ mb: 2 }}>{trip.error}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {trip.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {current && (
        <Stack spacing={3}>
          {/* Header Card */}
          <Card variant="outlined">
            <CardContent>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                    <Typography variant="h5" fontWeight={700}>
                      {current.tripNumber}
                    </Typography>
                    <Chip
                      label={current.status.replace("_", " ")}
                      color={getTripStatusColor(current.status)}
                      size="small"
                    />
                  </Stack>
                  <Typography color="text.secondary" variant="body1">
                    <strong>{current.origin}</strong> → <strong>{current.destination}</strong>
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  {current.status === TripStatus.UNASSIGNED && (
                    <Button
                      variant="contained"
                      startIcon={<AssignmentIndIcon />}
                      onClick={() => {
                        setError(null);
                        setAssignOpen(true);
                      }}
                    >
                      Assign Resource
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel Trip
                    </Button>
                  )}
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stepper activeStep={stepIndex} sx={{ my: 2 }}>
                {STEPS.map((step) => (
                  <Step key={step}>
                    <StepLabel>{step.replace("_", " ")}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {current.status === TripStatus.INCIDENT && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  An incident was reported on this trip. Resolve required diagnostics before proceeding to unloading or transit.
                </Alert>
              )}
              {current.status === TripStatus.CANCELLED && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This trip was cancelled. No further dispatch actions may be performed.
                </Alert>
              )}
              {current.status === TripStatus.COMPLETED && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Trip successfully completed and payload delivered.
                </Alert>
              )}

              {legalNextTransitions.length > 0 && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>
                    Next Dispatch Step:
                  </Typography>
                  {legalNextTransitions
                    .filter((target) => target !== TripStatus.CANCELLED)
                    .map((target) => (
                      <Button
                        key={target}
                        variant="contained"
                        size="small"
                        onClick={() => void advance(target)}
                      >
                        Advance to {target.replace("_", " ")}
                      </Button>
                    ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Details Grid */}
          <Grid container spacing={3}>
            {/* Cargo & Route Details */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader title="Cargo & Route Details" />
                <Divider />
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" variant="body2">Cargo Description:</Typography>
                      <Typography fontWeight={500} variant="body2">{current.cargoDescription || "General Cargo"}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" variant="body2">Net Payload:</Typography>
                      <Typography fontWeight={500} variant="body2">
                        {current.payloadKg ? `${current.payloadKg.toLocaleString()} kg` : "Not specified"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" variant="body2">Route Distance:</Typography>
                      <Typography fontWeight={500} variant="body2">
                        {current.routeDistanceKm ? `${current.routeDistanceKm} km` : "Standard corridor"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary" variant="body2">Scheduled Departure:</Typography>
                      <Typography fontWeight={500} variant="body2">
                        {current.scheduledStart ? new Date(current.scheduledStart).toLocaleString() : "As available"}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Assigned Resources & Waybill */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardHeader
                  title="Assigned Resources & Waybill"
                  action={
                    current.status === TripStatus.UNASSIGNED ? (
                      <Button size="small" onClick={() => setAssignOpen(true)}>
                        Assign Now
                      </Button>
                    ) : undefined
                  }
                />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LocalShippingIcon color="primary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary">Assigned Truck</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {assignedVehicle
                            ? `${assignedVehicle.registrationNumber} (${assignedVehicle.make ?? ""} ${assignedVehicle.model ?? ""})`
                            : current.vehicleId
                              ? `Vehicle #${current.vehicleId}`
                              : "No vehicle assigned"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PersonIcon color="primary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary">Assigned Driver</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {assignedDriver
                            ? `${assignedDriver.fullName} (${assignedDriver.employeeId})`
                            : current.driverId
                              ? `Driver #${current.driverId}`
                              : "No driver assigned"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <ReceiptLongIcon color="secondary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary">Electronic Waybill</Typography>
                        {current.waybillNumber ? (
                          <Typography variant="body1" fontWeight={700} sx={{ fontFamily: "monospace", color: "primary.main" }}>
                            {current.waybillNumber}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            Issued automatically upon dispatch assignment
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}

      {/* Assign Vehicle & Driver Dialog */}
      <Dialog open={assignOpen} onClose={() => !busy && setAssignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Vehicle & Driver</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign an available truck with sufficient payload capacity and an active certified driver to trip {current?.tripNumber}.
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              select
              label="Select Available Vehicle"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
              fullWidth
              required
            >
              {vehicles.data
                ?.filter((v: Vehicle) => v.status === VehicleStatus.AVAILABLE || v.id === current?.vehicleId)
                .map((v: Vehicle) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.make ?? ""} {v.model ?? ""}
                    {v.payloadCapacity ? ` (Max ${v.payloadCapacity.toLocaleString()} kg)` : ""}
                  </MenuItem>
                ))}
              {vehicles.data?.filter((v: Vehicle) => v.status === VehicleStatus.AVAILABLE).length === 0 && (
                <MenuItem disabled value="">
                  No vehicles currently AVAILABLE
                </MenuItem>
              )}
            </TextField>

            <TextField
              select
              label="Select Active Driver"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(Number(e.target.value))}
              fullWidth
              required
            >
              {drivers.data
                ?.filter((d: Driver) => d.status === DriverStatus.ACTIVE || d.id === current?.driverId)
                .map((d: Driver) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.fullName} ({d.employeeId}) — Lic: {d.licenseNumber}
                  </MenuItem>
                ))}
              {drivers.data?.filter((d: Driver) => d.status === DriverStatus.ACTIVE).length === 0 && (
                <MenuItem disabled value="">
                  No drivers currently ACTIVE
                </MenuItem>
              )}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={busy || !selectedVehicleId || !selectedDriverId}
          >
            {busy ? "Assigning…" : "Confirm Assignment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Trip Confirmation Dialog */}
      <Dialog open={cancelOpen} onClose={() => !busy && setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel Trip</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to cancel trip <strong>{current?.tripNumber}</strong>? This action cannot be undone.
          </Typography>
          <TextField
            label="Cancellation Reason (Optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={busy}>
            Keep Trip
          </Button>
          <Button variant="contained" color="error" onClick={handleCancel} disabled={busy}>
            {busy ? "Cancelling…" : "Confirm Cancellation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}