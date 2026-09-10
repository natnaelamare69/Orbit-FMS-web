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
import { DriverStatus, type Driver } from "../../../app/domain/types";
import { createDriver, listDrivers, updateDriverStatus, type CreateDriverInput } from "../api";

const DRIVER_STATUS_OPTIONS: DriverStatus[] = [
  DriverStatus.ACTIVE,
  DriverStatus.ON_TRIP,
  DriverStatus.ON_LEAVE,
  DriverStatus.SUSPENDED,
  DriverStatus.INACTIVE,
];

const LICENSE_CATEGORIES = [
  "GRADE_5_HEAVY_TRUCK",
  "GRADE_4_COMMERCIAL",
  "ARTICULATED_VEHICLE",
  "HAZMAT_CERTIFIED",
  "GENERAL_COMMERCIAL",
];

export function getDriverStatusColor(status: DriverStatus): "success" | "primary" | "info" | "error" | "default" {
  switch (status) {
    case DriverStatus.ACTIVE:
      return "success";
    case DriverStatus.ON_TRIP:
      return "primary";
    case DriverStatus.ON_LEAVE:
      return "info";
    case DriverStatus.SUSPENDED:
      return "error";
    case DriverStatus.INACTIVE:
      return "default";
    default:
      return "default";
  }
}

export default function DriverListPage() {
  const drivers = useAsync(listDrivers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = async (id: number, status: DriverStatus) => {
    try {
      await updateDriverStatus(id, status);
      drivers.refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDrivers = useMemo(() => {
    if (!drivers.data) return [];
    return drivers.data.filter((d) => {
      const matchesStatus = selectedStatus === "ALL" || d.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        d.fullName.toLowerCase().includes(q) ||
        d.employeeId.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q) ||
        (d.phoneNumber && d.phoneNumber.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [drivers.data, selectedStatus, searchQuery]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            Fleet Drivers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Driver roster, license compliance certifications, and operational availability.
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
          Register driver
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Tabs
          value={selectedStatus}
          onChange={(_, v) => setSelectedStatus(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${drivers.data?.length ?? 0})`} value="ALL" />
          <Tab label="Active" value={DriverStatus.ACTIVE} />
          <Tab label="On Trip" value={DriverStatus.ON_TRIP} />
          <Tab label="On Leave" value={DriverStatus.ON_LEAVE} />
          <Tab label="Suspended" value={DriverStatus.SUSPENDED} />
          <Tab label="Inactive" value={DriverStatus.INACTIVE} />
        </Tabs>

        <TextField
          size="small"
          placeholder="Search by name, ID, license…"
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

      {drivers.error && <Alert severity="error" sx={{ mb: 2 }}>{drivers.error}</Alert>}
      {drivers.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {!drivers.loading && drivers.data && (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Full Name & Contact</TableCell>
              <TableCell>License & Category</TableCell>
              <TableCell>License Expiry</TableCell>
              <TableCell>Availability Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.map((d: Driver) => {
              const isExpired = d.licenseExpiryDate ? new Date(d.licenseExpiryDate) < new Date() : false;
              return (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Typography fontWeight={600} variant="body2">
                      {d.employeeId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {d.fullName}
                    </Typography>
                    {d.phoneNumber && (
                      <Typography variant="caption" color="text.secondary">
                        {d.phoneNumber}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {d.licenseNumber}
                    </Typography>
                    {d.licenseCategory && (
                      <Typography variant="caption" color="text.secondary">
                        {d.licenseCategory.replace(/_/g, " ")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {d.licenseExpiryDate ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">{d.licenseExpiryDate}</Typography>
                        {isExpired && <Chip label="Expired" size="small" color="error" />}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Not recorded
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={d.status.replace("_", " ")}
                        color={getDriverStatusColor(d.status)}
                      />
                      <TextField
                        select
                        size="small"
                        value={d.status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value as DriverStatus)}
                        sx={{ minWidth: 130 }}
                      >
                        {DRIVER_STATUS_OPTIONS.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s.replace("_", " ")}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDrivers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No drivers found matching the selected criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <RegisterDriverDialog
        open={dialogOpen}
        error={dialogError}
        onClose={() => setDialogOpen(false)}
        onSaved={(err) => {
          if (err) {
            setDialogError(err);
          } else {
            setDialogOpen(false);
            drivers.refetch();
          }
        }}
      />
    </Box>
  );
}

export function RegisterDriverDialog({
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
  const [employeeId, setEmployeeId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setCategory] = useState(LICENSE_CATEGORIES[0]);
  const [licenseExpiryDate, setExpiry] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!employeeId.trim() || !fullName.trim() || !licenseNumber.trim()) {
      onSaved("Employee ID, Full Name, and License Number are required.");
      return;
    }
    setBusy(true);
    try {
      const input: CreateDriverInput = {
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        licenseNumber: licenseNumber.trim(),
        licenseCategory,
        licenseExpiryDate: licenseExpiryDate || undefined,
      };
      await createDriver(input);
      onSaved(null);
      setEmployeeId("");
      setFullName("");
      setPhoneNumber("");
      setLicenseNumber("");
      setExpiry("");
    } catch (err) {
      onSaved(err instanceof Error ? err.message : "Could not register the driver.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Register Fleet Driver</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Employee ID"
              placeholder="e.g. DRV-0104"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Phone number"
              placeholder="e.g. +251 911 000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Full name"
            placeholder="e.g. Abebe Bekele"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            required
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="License number"
              placeholder="e.g. ET-LIC-445566"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              fullWidth
              required
            />
            <TextField
              select
              label="License category"
              value={licenseCategory}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
            >
              {LICENSE_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="License expiry date"
            type="date"
            value={licenseExpiryDate}
            onChange={(e) => setExpiry(e.target.value)}
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
          {busy ? "Registering…" : "Register Driver"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}