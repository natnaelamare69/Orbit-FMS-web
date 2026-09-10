import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import type { FuelTransaction, Vehicle } from "../../../app/domain/types";
import { listFuelTransactions, recordFuelTransaction } from "../api";
import { listVehicles } from "../../vehicle/api";

export default function FuelPage() {
  const txns = useAsync(listFuelTransactions);
  const vehicles = useAsync(listVehicles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const vehicleMap = useMemo(() => {
    const map = new Map<number, Vehicle>();
    vehicles.data?.forEach((v) => map.set(v.id, v));
    return map;
  }, [vehicles.data]);

  const stats = useMemo(() => {
    if (!txns.data || txns.data.length === 0) {
      return { totalLiters: 0, totalCost: 0, count: 0, avgPrice: 0 };
    }
    const totalLiters = txns.data.reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
    const totalCost = txns.data.reduce((sum, t) => sum + (t.totalCost || 0), 0);
    const count = txns.data.length;
    const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;
    return { totalLiters, totalCost, count, avgPrice };
  }, [txns.data]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            Fuel Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track fuel purchases, odometer readings, station logs, and consumption efficiency.
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
          Record transaction
        </Button>
      </Stack>

      {/* KPI Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Total Fuel Consumed
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {stats.totalLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })} L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Total Expenditure
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Transactions Logged
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {stats.count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Typography color="text.secondary" variant="caption" fontWeight={600} textTransform="uppercase">
                Avg. Cost per Liter
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                {stats.avgPrice.toFixed(2)} ETB/L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {txns.error && <Alert severity="error" sx={{ mb: 2 }}>{txns.error}</Alert>}
      {txns.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {!txns.loading && txns.data && (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Station / Supplier</TableCell>
              <TableCell>Quantity (L)</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Odometer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {txns.data.map((t: FuelTransaction) => {
              const vehicle = vehicleMap.get(t.vehicleId);
              return (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} variant="body2">
                      {vehicle ? vehicle.registrationNumber : `Vehicle #${t.vehicleId}`}
                    </Typography>
                    {vehicle && (
                      <Typography variant="caption" color="text.secondary">
                        {vehicle.make} {vehicle.model}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.station || "Standard Station"}</TableCell>
                  <TableCell>
                    <Typography fontWeight={500} variant="body2">
                      {t.quantityLiters.toLocaleString()} L
                    </Typography>
                  </TableCell>
                  <TableCell>{t.unitPrice.toFixed(2)} ETB</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} variant="body2">
                      {t.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {t.odometerReading ? `${t.odometerReading.toLocaleString()} km` : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
            {txns.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No fuel transactions recorded yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <RecordFuelDialog
        open={dialogOpen}
        error={dialogError}
        vehicles={vehicles.data ?? []}
        onClose={() => setDialogOpen(false)}
        onSaved={(err) => {
          if (err) setDialogError(err);
          else {
            setDialogOpen(false);
            txns.refetch();
          }
        }}
      />
    </Box>
  );
}

export function RecordFuelDialog({
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
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [quantityLiters, setLiters] = useState<number | undefined>();
  const [unitPrice, setPrice] = useState<number | undefined>();
  const [odometerReading, setOdometer] = useState<number | undefined>();
  const [station, setStation] = useState("");
  const [busy, setBusy] = useState(false);

  const calculatedTotal = quantityLiters && unitPrice ? (quantityLiters * unitPrice).toFixed(2) : "0.00";

  const submit = async () => {
    if (!vehicleId || !date || !quantityLiters || !unitPrice) {
      onSaved("Vehicle, date, quantity, and unit price are required.");
      return;
    }
    setBusy(true);
    try {
      await recordFuelTransaction({
        vehicleId: Number(vehicleId),
        date,
        quantityLiters: Number(quantityLiters),
        unitPrice: Number(unitPrice),
        odometerReading: odometerReading ? Number(odometerReading) : undefined,
        station: station.trim() || undefined,
      });
      onSaved(null);
      setVehicleId("");
      setLiters(undefined);
      setPrice(undefined);
      setOdometer(undefined);
      setStation("");
    } catch (err) {
      onSaved(err instanceof Error ? err.message : "Could not record the fuel transaction.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Record Fuel Transaction</DialogTitle>
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

          <TextField
            label="Purchase Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            required
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Quantity (liters)"
              type="number"
              placeholder="e.g. 150"
              value={quantityLiters ?? ""}
              onChange={(e) => setLiters(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
              required
            />
            <TextField
              label="Unit Price (ETB)"
              type="number"
              placeholder="e.g. 105.50"
              value={unitPrice ?? ""}
              onChange={(e) => setPrice(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
              required
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Estimated Total: <strong>{calculatedTotal} ETB</strong>
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Odometer reading (km)"
              type="number"
              placeholder="e.g. 45200"
              value={odometerReading ?? ""}
              onChange={(e) => setOdometer(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Station / Supplier"
              placeholder="e.g. TotalEnergies Bole"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              fullWidth
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {busy ? "Saving…" : "Record Transaction"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}