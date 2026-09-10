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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAsync } from "../../../app/api/useAsync";
import type { MaintenanceRecord, Vehicle } from "../../../app/domain/types";
import { listMaintenanceRecords, recordMaintenance, type RecordMaintenanceInput } from "../api";
import { listVehicles } from "../../vehicle/api";

export default function MaintenancePage() {
  const records = useAsync(listMaintenanceRecords);
  const vehicles = useAsync(listVehicles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const vehicleMap = useMemo(() => {
    const map = new Map<number, Vehicle>();
    vehicles.data?.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles.data]);

  const stats = useMemo(() => {
    if (!records.data) return { totalCost: 0, count: 0, overdue: 0 };
    const totalCost = records.data.reduce((sum, r) => sum + (r.cost || 0), 0);
    const count = records.data.length;
    const now = new Date();
    const overdue = records.data.filter((r) => r.nextDueDate && new Date(r.nextDueDate) < now).length;
    return { totalCost, count, overdue };
  }, [records.data]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            Maintenance & Service History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preventative servicing, repair records, workshop providers, and scheduled intervals.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setDialogError(null);
            setDialogOpen(true);
          }}
        >
          Record maintenance
        </Button>
      </Stack>

      {/* KPI Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Total Maintenance Spend
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Service Records Logged
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {stats.count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Overdue Services
              </Typography>
              <Typography variant="h5" fontWeight={700} color={stats.overdue > 0 ? "error.main" : "text.primary"} sx={{ mt: 0.5 }}>
                {stats.overdue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {records.error && <Alert severity="error" sx={{ mb: 2 }}>{records.error}</Alert>}
      {records.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {!records.loading && records.data && (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Service Code</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Service Date</TableCell>
              <TableCell>Description & Provider</TableCell>
              <TableCell>Mileage</TableCell>
              <TableCell>Cost (ETB)</TableCell>
              <TableCell>Next Due</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.data.map((r: MaintenanceRecord) => {
              const vehicle = vehicleMap.get(r.vehicleId);
              const isOverdue = r.nextDueDate ? new Date(r.nextDueDate) < new Date() : false;
              return (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} variant="body2" sx={{ fontFamily: "monospace" }}>
                      {r.maintenanceCode ?? `MNT-2026-${String(r.id).padStart(4, "0")}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} variant="body2">
                      {vehicle ? vehicle.registrationNumber : `Vehicle #${r.vehicleId}`}
                    </Typography>
                    {vehicle && (
                      <Typography variant="caption" color="text.secondary">
                        {vehicle.make} {vehicle.model}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{r.serviceDate}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.description || "General maintenance"}</Typography>
                    {r.provider && (
                      <Typography variant="caption" color="text.secondary">
                        Provider: {r.provider}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{r.mileage ? `${r.mileage.toLocaleString()} km` : "-"}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} variant="body2">
                      {r.cost !== undefined ? `${r.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB` : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {r.nextDueDate ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">{r.nextDueDate}</Typography>
                        {isOverdue && <Chip size="small" color="error" label="Overdue" />}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Not specified
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {records.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No maintenance records found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <RecordMaintenanceDialog
        open={dialogOpen}
        error={dialogError}
        vehicles={vehicles.data ?? []}
        onClose={() => setDialogOpen(false)}
        onSaved={(err) => {
          if (err) setDialogError(err);
          else {
            setDialogOpen(false);
            records.refetch();
          }
        }}
      />
    </Box>
  );
}

export function RecordMaintenanceDialog({
  open,
  error,
  vehicles,
  onClose,
  onSaved,
}: {
  open: boolean;
  error: string | null;
  vehicles: Vehicle[];
  onClose(): void;
  onSaved(err: string | null): void;
}) {
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [mileage, setMileage] = useState<number | undefined>();
  const [cost, setCost] = useState<number | undefined>();
  const [provider, setProvider] = useState("");
  const [description, setDescription] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!vehicleId || !serviceDate) {
      onSaved("Vehicle and service date are required.");
      return;
    }
    setBusy(true);
    try {
      const input: RecordMaintenanceInput = {
        vehicleId: Number(vehicleId),
        serviceDate,
        mileage: mileage ? Number(mileage) : undefined,
        cost: cost ? Number(cost) : undefined,
        provider: provider.trim() || undefined,
        description: description.trim() || undefined,
        nextDueDate: nextDueDate || undefined,
      };
      await recordMaintenance(input);
      onSaved(null);
      setVehicleId("");
      setMileage(undefined);
      setCost(undefined);
      setProvider("");
      setDescription("");
      setNextDueDate("");
    } catch (err) {
      onSaved(err instanceof Error ? err.message : "Could not record maintenance.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Record Vehicle Maintenance</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(Number(e.target.value))}
            fullWidth
            required
          >
            {vehicles.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.registrationNumber} ({v.make ?? ""} {v.model ?? ""})
              </MenuItem>
            ))}
            {vehicles.length === 0 && (
              <MenuItem disabled value="">
                No vehicles available
              </MenuItem>
            )}
          </TextField>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Service date"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label="Next due date"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>

          <TextField
            label="Service description"
            placeholder="e.g. 50,000 km scheduled engine overhaul and brake pads replacement"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Odometer / Mileage (km)"
              type="number"
              placeholder="e.g. 52000"
              value={mileage ?? ""}
              onChange={(e) => setMileage(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Cost (ETB)"
              type="number"
              placeholder="e.g. 18500.00"
              value={cost ?? ""}
              onChange={(e) => setCost(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
            />
          </Stack>

          <TextField
            label="Service Provider / Workshop"
            placeholder="e.g. Addis Engineering Garage"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {busy ? "Saving…" : "Record Maintenance"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}