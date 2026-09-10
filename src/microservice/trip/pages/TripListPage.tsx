import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
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
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { useAsync } from "../../../app/api/useAsync";
import { TripStatus, type Trip } from "../../../app/domain/types";
import { listTrips, scheduleTrip, type ScheduleTripInput } from "../api";

export function getTripStatusColor(status: TripStatus): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
  switch (status) {
    case TripStatus.UNASSIGNED:
      return "warning";
    case TripStatus.ASSIGNED:
      return "info";
    case TripStatus.LOADING:
      return "secondary";
    case TripStatus.IN_TRANSIT:
      return "primary";
    case TripStatus.INCIDENT:
      return "error";
    case TripStatus.UNLOADING:
      return "info";
    case TripStatus.COMPLETED:
      return "success";
    case TripStatus.CANCELLED:
      return "default";
    default:
      return "default";
  }
}

export default function TripListPage() {
  const trips = useAsync(listTrips);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrips = useMemo(() => {
    if (!trips.data) return [];
    return trips.data.filter((t) => {
      const matchesStatus = selectedStatus === "ALL" || t.status === selectedStatus;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        t.tripNumber.toLowerCase().includes(query) ||
        t.origin.toLowerCase().includes(query) ||
        t.destination.toLowerCase().includes(query) ||
        (t.waybillNumber && t.waybillNumber.toLowerCase().includes(query)) ||
        (t.cargoDescription && t.cargoDescription.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [trips.data, selectedStatus, searchQuery]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            Cargo Trips
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage dispatch assignments, route status, and electronic waybills.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormError(null);
            setScheduleOpen(true);
          }}
        >
          Schedule trip
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Tabs
          value={selectedStatus}
          onChange={(_, v) => setSelectedStatus(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${trips.data?.length ?? 0})`} value="ALL" />
          <Tab label="Unassigned" value={TripStatus.UNASSIGNED} />
          <Tab label="Assigned" value={TripStatus.ASSIGNED} />
          <Tab label="In Transit" value={TripStatus.IN_TRANSIT} />
          <Tab label="Completed" value={TripStatus.COMPLETED} />
          <Tab label="Cancelled" value={TripStatus.CANCELLED} />
        </Tabs>

        <TextField
          size="small"
          placeholder="Search by trip, route, waybill…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 280 }}
        />
      </Stack>

      {trips.error && <Alert severity="error" sx={{ mb: 2 }}>{trips.error}</Alert>}
      {trips.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {!trips.loading && trips.data && (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Trip no.</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Cargo & Payload</TableCell>
              <TableCell>Distance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Waybill</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrips.map((t: Trip) => (
              <TableRow key={t.id} hover>
                <TableCell>
                  <Typography fontWeight={600} variant="body2">
                    {t.tripNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    <strong>{t.origin}</strong> → <strong>{t.destination}</strong>
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {t.cargoDescription || "General Freight"}
                  </Typography>
                  {t.payloadKg !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      {t.payloadKg.toLocaleString()} kg
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {t.routeDistanceKm ? `${t.routeDistanceKm} km` : "-"}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={t.status.replace("_", " ")}
                    color={getTripStatusColor(t.status)}
                    variant={t.status === TripStatus.UNASSIGNED ? "outlined" : "filled"}
                  />
                </TableCell>
                <TableCell>
                  {t.waybillNumber ? (
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                      {t.waybillNumber}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Pending
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button component={Link} to={`/trips/${t.id}`} size="small" variant="outlined">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredTrips.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No trips found matching the selected criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <ScheduleTripDialog
        open={scheduleOpen}
        error={formError}
        onClose={() => setScheduleOpen(false)}
        onSaved={(err) => {
          if (err) {
            setFormError(err);
          } else {
            setScheduleOpen(false);
            trips.refetch();
          }
        }}
      />
    </Box>
  );
}

export function ScheduleTripDialog({
  open,
  error,
  onClose,
  onSaved,
}: {
  open: boolean;
  error: string | null;
  onClose(): void;
  onSaved(err: string | null): void;
}) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cargoDescription, setCargo] = useState("");
  const [payloadKg, setPayload] = useState<number | undefined>();
  const [routeDistanceKm, setDistance] = useState<number | undefined>();
  const [scheduledStart, setStart] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!origin.trim() || !destination.trim()) {
      onSaved("Origin and destination are required.");
      return;
    }
    setBusy(true);
    try {
      const input: ScheduleTripInput = {
        origin: origin.trim(),
        destination: destination.trim(),
        cargoDescription: cargoDescription.trim() || undefined,
        payloadKg,
        routeDistanceKm,
        scheduledStart: scheduledStart || undefined,
      };
      await scheduleTrip(input);
      onSaved(null);
      setOrigin("");
      setDestination("");
      setCargo("");
      setPayload(undefined);
      setDistance(undefined);
      setStart("");
    } catch (err) {
      onSaved(err instanceof Error ? err.message : "Could not schedule the trip.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Cargo Trip</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Origin location"
            placeholder="e.g. Addis Ababa Logistics Hub"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Destination location"
            placeholder="e.g. Dire Dawa Dry Port"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Cargo description"
            placeholder="e.g. Export Coffee Bags"
            value={cargoDescription}
            onChange={(e) => setCargo(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Payload (kg)"
              type="number"
              placeholder="e.g. 15000"
              value={payloadKg ?? ""}
              onChange={(e) => setPayload(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Estimated distance (km)"
              type="number"
              placeholder="e.g. 450"
              value={routeDistanceKm ?? ""}
              onChange={(e) => setDistance(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
            />
          </Stack>
          <TextField
            label="Scheduled departure"
            type="datetime-local"
            value={scheduledStart}
            onChange={(e) => setStart(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {busy ? "Scheduling…" : "Schedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}