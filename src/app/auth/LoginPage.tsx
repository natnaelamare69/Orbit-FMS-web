import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDemoMode } from "../api/mockData";
import { ApiError } from "../api/request";
import { useSession } from "../session/SessionContext";
import { login, register } from "./authService";

const ROLES = [
  { value: "FLEET_MANAGER", label: "Fleet Manager" },
  { value: "SYSTEM_ADMIN", label: "System Admin" },
  { value: "DISPATCHER", label: "Dispatcher" },
  { value: "FUEL_OFFICER", label: "Fuel Officer" },
  { value: "MAINTENANCE_OFFICER", label: "Maintenance Officer" },
  { value: "VIEWER", label: "Viewer" },
];

export default function LoginPage() {
  const { signIn } = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Sign In state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("FLEET_MANAGER");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const session = await login({ username, password });
      signIn(session);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Please check your credentials or server connection.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const session = await register({
        username: regUsername,
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      });
      signIn(session);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed. Please check that username and email are unique.");
    } finally {
      setBusy(false);
    }
  };

  const handleDemoSignIn = () => {
    setDemoMode(true);
    signIn({
      token: "demo-jwt-token-orbit-fms",
      user: {
        id: "demo",
        username: "demo_fleet_manager",
        role: "FLEET_MANAGER",
        fullName: "Demo Fleet Manager",
      },
    });
    navigate("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 440, p: 1, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h5" fontWeight={700} color="primary">
              Orbit-FMS
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Fleet Management & Commercial Logistics Console
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, val) => {
              setTab(val);
              setError(null);
            }}
            variant="fullWidth"
            sx={{ mb: 2.5 }}
          >
            <Tab label="Sign In" value="login" />
            <Tab label="Create Account" value="register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <Stack spacing={2}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  fullWidth
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" disabled={busy} size="large" fullWidth>
                  {busy ? "Signing in…" : "Sign In"}
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <Stack spacing={2}>
                <TextField
                  label="Username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  fullWidth
                  required
                  helperText="At least 3 characters"
                />
                <TextField
                  label="Full Name"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Password"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  fullWidth
                  required
                  helperText="At least 6 characters"
                />
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">Account Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    value={regRole}
                    label="Account Role"
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label} ({r.value})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" disabled={busy} size="large" fullWidth>
                  {busy ? "Creating Account…" : "Register & Sign In"}
                </Button>
              </Stack>
            </form>
          )}

          <Divider sx={{ my: 2.5 }}>OR</Divider>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="large"
            onClick={handleDemoSignIn}
            sx={{ fontWeight: 600 }}
          >
            Explore Demo Mode (No Backend Needed)
          </Button>

          <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
              Backend services run natively via Maven/Java on port 8080 (Gateway). Docker is not required.
              Demo Mode loads realistic Ethiopian commercial trucking data locally.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}