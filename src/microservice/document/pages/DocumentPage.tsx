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
import DownloadIcon from "@mui/icons-material/Download";
import { useAsync } from "../../../app/api/useAsync";
import type { Driver, FleetDocument, Vehicle } from "../../../app/domain/types";
import { listDocuments, uploadDocument, type UploadDocumentInput } from "../api";
import { listVehicles } from "../../vehicle/api";
import { listDrivers } from "../../driver/api";

const DOC_TYPES = [
  "COMMERCIAL_REGISTRATION",
  "ANNUAL_INSPECTION",
  "INSURANCE",
  "DRIVER_LICENSE",
];

export default function DocumentPage() {
  const docs = useAsync(listDocuments);
  const vehicles = useAsync(listVehicles);
  const drivers = useAsync(listDrivers);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const vehicleMap = useMemo(() => {
    const map = new Map<number, string>();
    vehicles.data?.forEach((v) => map.set(v.id, `${v.registrationNumber} (${v.make ?? ""})`));
    return map;
  }, [vehicles.data]);

  const driverMap = useMemo(() => {
    const map = new Map<number, string>();
    drivers.data?.forEach((d) => map.set(d.id, `${d.fullName} (${d.employeeId})`));
    return map;
  }, [drivers.data]);

  const filteredDocs = useMemo(() => {
    if (!docs.data) return [];
    if (selectedType === "ALL") return docs.data;
    return docs.data.filter((d) => d.documentType === selectedType);
  }, [docs.data, selectedType]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <div>
          <Typography variant="h5" fontWeight={600}>
            Compliance & Regulatory Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage permits, commercial insurance policies, inspection certificates, and driver credentials.
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
          Upload document
        </Button>
      </Stack>

      <Tabs
        value={selectedType}
        onChange={(_, v) => setSelectedType(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label={`All (${docs.data?.length ?? 0})`} value="ALL" />
        <Tab label="Commercial Registration" value="COMMERCIAL_REGISTRATION" />
        <Tab label="Annual Inspection" value="ANNUAL_INSPECTION" />
        <Tab label="Insurance" value="INSURANCE" />
        <Tab label="Driver License" value="DRIVER_LICENSE" />
      </Tabs>

      {docs.error && <Alert severity="error" sx={{ mb: 2 }}>{docs.error}</Alert>}
      {docs.loading && <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />}

      {!docs.loading && docs.data && (
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Document Type</TableCell>
              <TableCell>Attached Entity</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Upload Timestamp</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocs.map((d: FleetDocument) => {
              const now = new Date();
              const expiry = d.expiryDate ? new Date(d.expiryDate) : null;
              const isExpired = expiry ? expiry < now : false;
              const isExpiringSoon = expiry && !isExpired ? (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24) < 30 : false;

              let ownerLabel = "-";
              if (d.ownerType === "VEHICLE" && d.ownerId) {
                ownerLabel = vehicleMap.get(d.ownerId) ?? `Vehicle #${d.ownerId}`;
              } else if (d.ownerType === "DRIVER" && d.ownerId) {
                ownerLabel = driverMap.get(d.ownerId) ?? `Driver #${d.ownerId}`;
              }

              return (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      label={d.documentType.replace(/_/g, " ")}
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {ownerLabel}
                    </Typography>
                    {d.ownerType && (
                      <Typography variant="caption" color="text.secondary">
                        {d.ownerType}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      {d.fileName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {d.expiryDate ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2">{d.expiryDate}</Typography>
                        {isExpired && <Chip size="small" color="error" label="Expired" />}
                        {isExpiringSoon && <Chip size="small" color="warning" label="Expiring Soon" />}
                        {!isExpired && !isExpiringSoon && <Chip size="small" color="success" variant="outlined" label="Valid" />}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No expiration set
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      component="a"
                      href={d.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={d.fileName}
                      disabled={!d.url}
                    >
                      {d.url ? "Download" : "Pending"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDocs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No compliance documents found in this category.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <UploadDocumentDialog
        open={dialogOpen}
        error={dialogError}
        vehicles={vehicles.data ?? []}
        drivers={drivers.data ?? []}
        onClose={() => setDialogOpen(false)}
        onSaved={(err) => {
          if (err) setDialogError(err);
          else {
            setDialogOpen(false);
            docs.refetch();
          }
        }}
      />
    </Box>
  );
}

export function UploadDocumentDialog({
  open,
  error,
  vehicles,
  drivers,
  onClose,
  onSaved,
}: {
  open: boolean;
  error: string | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  onClose(): void;
  onSaved(err: string | null): void;
}) {
  const [ownerType, setOwnerType] = useState<"VEHICLE" | "DRIVER">("VEHICLE");
  const [ownerId, setOwnerId] = useState<number | "">("");
  const [documentType, setDocumentType] = useState<string>(DOC_TYPES[0] ?? "COMMERCIAL_REGISTRATION");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!ownerId) {
      onSaved("Please select the owning vehicle or driver.");
      return;
    }
    if (!file) {
      onSaved("Please choose a file to upload.");
      return;
    }
    setBusy(true);
    try {
      const input: UploadDocumentInput = {
        ownerType,
        ownerId: Number(ownerId),
        documentType,
        expiryDate: expiryDate || undefined,
        file,
      };
      await uploadDocument(input);
      onSaved(null);
      setOwnerId("");
      setExpiryDate("");
      setFile(null);
    } catch (err) {
      onSaved(err instanceof Error ? err.message : "Could not upload the document.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Compliance Document</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Owner type"
              value={ownerType}
              onChange={(e) => {
                setOwnerType(e.target.value as "VEHICLE" | "DRIVER");
                setOwnerId("");
              }}
              sx={{ width: 160 }}
            >
              <MenuItem value="VEHICLE">Vehicle</MenuItem>
              <MenuItem value="DRIVER">Driver</MenuItem>
            </TextField>

            <TextField
              select
              label={ownerType === "VEHICLE" ? "Select Vehicle" : "Select Driver"}
              value={ownerId}
              onChange={(e) => setOwnerId(Number(e.target.value))}
              fullWidth
              required
            >
              {ownerType === "VEHICLE"
                ? vehicles.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.make ?? ""} {v.model ?? ""})
                    </MenuItem>
                  ))
                : drivers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.fullName} ({d.employeeId})
                    </MenuItem>
                  ))}
            </TextField>
          </Stack>

          <TextField
            select
            label="Document type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            fullWidth
          >
            {DOC_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Expiration Date (if applicable)"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />

          <TextField
            label="Document File"
            type="file"
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              setFile(target.files?.[0] ?? null);
            }}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {busy ? "Uploading…" : "Upload Document"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}