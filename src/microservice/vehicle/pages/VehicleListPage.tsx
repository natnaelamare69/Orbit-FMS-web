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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useAsync } from "../../../app/api/useAsync";
import { VehicleStatus, type Vehicle } from "../../../app/domain/types";
import {
  createVehicle,
  listVehicles,
  updateVehicleStatus,
  type CreateVehicleInput,
} from "../api";

const STATUS_OPTIONS: VehicleStatus[] = [
  VehicleStatus.AVAILABLE,
  VehicleStatus.ASSIGNED,
  VehicleStatus.IN_TRANSIT,
  VehicleStatus.MAINTENANCE,
  VehicleStatus.DECOMMISSIONED,
];

const VEHICLE_TYPES = [
  "HEAVY_TRUCK",
  "SEMI_TRAILER",
  "BOX_TRUCK",
  "TANKER",
  "FLATBED",
  "DUMP_TRUCK",
];

const FUEL_TYPES = ["DIESEL", "GASOLINE", "ELECTRIC", "HYBRID"];

export function getVehicleStatusColor(status: VehicleStatus): "success" | "info" | "primary" | "warning" | "default" {
  switch (status) {
    case VehicleStatus.AVAILABLE:
      return "success";
    case VehicleStatus.ASSIGNED:
      return "info";
    case VehicleStatus.IN_TRANSIT:
      return "primary";
    case VehicleStatus.MAINTENANCE:
      return "warning";
    case VehicleStatus.DECOMMISSIONED:
      return "default";
    default:
      return "default";
  }
}

export default function VehicleListPage() {
  const vehicles = useAsync(listVehicles);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatus = async (id: number, status: VehicleStatus) => {
    try {
      await updateVehicleStatus(id, status);
      vehicles.refetch();
    } catch (err) {
      // surface error if status change rejected
      console.error(err);
    }
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicles.data) return [];
    return vehicles.data.filter((v) => {
      const matchesStatus = selectedStatus === "ALL" || v.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        (v.make && v.make.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.vehicleType && v.vehicleType.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [vehicles.data, selectedStatus, searchQuery]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            Fleet Vehicles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Master registry of commercial trucks, payload limits, and operational statuses.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormError(null);
            setRegisterOpen(true);
          }}
        >
          Register vehicle
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Tabs
          value={selectedStatus}
          onChange={(_, v) => setSelectedStatus(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${vehicles.data?.length ?? 0})`} value="ALL" />
          <Tab label="Available" value={VehicleStatus.AVAILABLE} />
          <Tab label="Assigned" value={VehicleStatus.ASSIGNED} />
          <Tab label="In Transit" value={VehicleStatus.IN_TRANSIT} />
          <Tab label="Maintenance" value={VehicleStatus.MAINTENANCE} />
          <Tab label="Decommissioned" value={VehicleStatus.DECOMMISSIONED} />
        </Tabs>

        <TextField
          size="small"
          placeholder="Search by reg. no., VIN, make…"
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

      {vehicles.error && <Alert severity="error" sx={{ mb: 2 }}>{vehicles.error}</Alert>}
      {vehicles.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {!vehicles.loading && vehicles.data && (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Reg. no.</TableCell>
              <TableCell>VIN</TableCell>
              <TableCell>Make / Model</TableCell>
              <TableCell>Specs & Capacity</TableCell>
              <TableCell>Current Mileage</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.map((v: Vehicle) => (
              <TableRow key={v.id} hover>
                <TableCell>
                  <Typography fontWeight={600} variant="body2">
                    {v.registrationNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {v.vin}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {`${v.make ?? "-"} ${v.model ?? ""}`.trim()}
                  </Typography>
                  {(v.modelYear || v.year) && (
                    <Typography variant="caption" color="text.secondary">
                      Year: {v.modelYear ?? v.year}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {v.vehicleType ? v.vehicleType.replace("_", " ") : "Truck"}
                  </Typography>
                  {v.payloadCapacity ? (
                    <Typography variant="caption" color="text.secondary">
                      Payload: {v.payloadCapacity.toLocaleString()} kg · Tank: {v.fuelTankCapacity ?? "-"} L
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {v.currentMileage ? `${v.currentMileage.toLocaleString()} km` : "0 km"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={v.status.replace("_", " ")}
                      color={getVehicleStatusColor(v.status)}
                    />
                    <TextField
                      select
                      size="small"
                      value={v.status}
                      onChange={(e) => handleStatus(v.id, e.target.value as VehicleStatus)}
                      sx={{ minWidth: 130 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s.replace("_", " ")}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filteredVehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No vehicles found matching the selected filter.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <RegisterVehicleDialog
        open={registerOpen}
        error={formError}
        onClose={() => setRegisterOpen(false)}
        onSaved={(err) => {
          if (err) {
            setFormError(err);
          } else {
            setRegisterOpen(false);
            vehicles.refetch();
          }
        }}
      />
    </Box>
  );
}

export function RegisterVehicleDialog({
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
  const [registrationNumber, setReg] = useState("");
  const [vin, setVin] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | undefined>();
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [fuelType, setFuelType] = useState(FUEL_TYPES[0]);
  const [payloadCapacity, setPayloadCapacity] = useState<number | undefined>();
  const [fuelTankCapacity, setFuelTankCapacity] = useState<number | undefined>();
  const [currentMileage, setCurrentMileage] = useState<number | undefined>(0);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!registrationNumber.trim() || !vin.trim()) {
      onSaved("Registration number and VIN are required.");
      return;
    }
    setBusy(true);
    try {
      const input: CreateVehicleInput = {
        registrationNumber: registrationNumber.trim(),
        vin: vin.trim(),
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        modelYear: year,
        vehicleType,
        fuelType,
        payloadCapacity,
        fuelTankCapacity,
        currentMileage,
      };
      await createVehicle(input);
      onSaved(null);
      setReg("");
      setVin("");
      setMake("");
      setModel("");
      setYear(undefined);
      setPayloadCapacity(undefined);
      setFuelTankCapacity(undefined);
      setCurrentMileage(0);
    } catch (err) {
      onSaved(err instanceof Error ? err.message : "Could not register the vehicle.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Register Commercial Vehicle</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Registration number"
              placeholder="e.g. 3-AA-98765"
              value={registrationNumber}
              onChange={(e) => setReg(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="VIN (17 characters)"
              placeholder="e.g. 1HGCR2F83HA000000"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              fullWidth
              required
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField label="Make" placeholder="e.g. Volvo, Isuzu, Scania" value={make} onChange={(e) => setMake(e.target.value)} fullWidth />
            <TextField label="Model" placeholder="e.g. FH16, FSR" value={model} onChange={(e) => setModel(e.target.value)} fullWidth />
            <TextField
              label="Model Year"
              type="number"
              placeholder="2024"
              value={year ?? ""}
              onChange={(e) => setYear(e.target.value === "" ? undefined : Number(e.target.value))}
              sx={{ width: 140 }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Vehicle Type"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              fullWidth
            >
              {VEHICLE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t.replace("_", " ")}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Fuel Type"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              fullWidth
            >
              {FUEL_TYPES.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Payload Capacity (kg)"
              type="number"
              placeholder="e.g. 25000"
              value={payloadCapacity ?? ""}
              onChange={(e) => setPayloadCapacity(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Fuel Tank Capacity (L)"
              type="number"
              placeholder="e.g. 400"
              value={fuelTankCapacity ?? ""}
              onChange={(e) => setFuelTankCapacity(e.target.value === "" ? undefined : Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Current Mileage (km)"
              type="number"
              placeholder="e.g. 12500"
              value={currentMileage ?? ""}
              onChange={(e) => setCurrentMileage(e.target.value === "" ? undefined : Number(e.target.value))}
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
          {busy ? "Registering…" : "Register Vehicle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}