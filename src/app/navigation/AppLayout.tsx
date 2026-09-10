import { Fragment, type ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PersonIcon from "@mui/icons-material/Person";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BuildIcon from "@mui/icons-material/Build";
import DescriptionIcon from "@mui/icons-material/Description";
import { useSession } from "../session/SessionContext";
import { useTheme } from "../theme/ThemeContext";
import { isDemoMode } from "../api/mockData";

interface NavItem {
  label: string;
  path: string;
  roles?: string[];
  icon: ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Fleet",
    items: [
      {
        label: "Vehicles",
        path: "/vehicles",
        icon: <DirectionsCarIcon fontSize="small" />,
      },
      {
        label: "Drivers",
        path: "/drivers",
        icon: <PersonIcon fontSize="small" />,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Trips",
        path: "/trips",
        icon: <AltRouteIcon fontSize="small" />,
        roles: ["SYSTEM_ADMIN", "FLEET_MANAGER", "DISPATCHER", "VIEWER"],
      },
    ],
  },
  {
    label: "Compliance",
    items: [
      {
        label: "Maintenance",
        path: "/maintenance",
        icon: <BuildIcon fontSize="small" />,
        roles: ["SYSTEM_ADMIN", "FLEET_MANAGER", "MAINTENANCE_OFFICER", "VIEWER"],
      },
      {
        label: "Documents",
        path: "/documents",
        icon: <DescriptionIcon fontSize="small" />,
        roles: ["SYSTEM_ADMIN", "FLEET_MANAGER", "DISPATCHER", "VIEWER"],
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "Fuel",
        path: "/fuel",
        icon: <LocalGasStationIcon fontSize="small" />,
        roles: ["SYSTEM_ADMIN", "FLEET_MANAGER", "FUEL_OFFICER", "VIEWER"],
      },
      {
        label: "Fraud Alerts",
        path: "/fraud",
        icon: <WarningAmberIcon fontSize="small" />,
        roles: ["SYSTEM_ADMIN", "FLEET_MANAGER", "FUEL_OFFICER"],
      },
    ],
  },
];

/** Content padding applied around the routed page. */
export const CONTENT_PADDING = 3;

/** App shell: top bar + collapsible grouped left navigation. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const { session, signOut } = useSession();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(true);
  const { pathname } = useLocation();

  const selected = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const userRole = session?.user.role?.toUpperCase();

  const isItemVisible = (item: NavItem) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!userRole) return true;
    if (userRole === "SYSTEM_ADMIN" || userRole === "ADMIN") return true;
    return item.roles.includes(userRole);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <DirectionsCarIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: "-0.5px" }}>
            Orbit-FMS
          </Typography>

          <Tooltip title={dark ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton onClick={toggle} color="inherit" sx={{ mr: 2 }}>
              {dark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {isDemoMode() && (
            <Chip
              label="DEMO MODE (OFFLINE)"
              size="small"
              color="warning"
              variant="filled"
              sx={{ mr: 2, fontWeight: 700, fontSize: "0.7rem" }}
            />
          )}

          {userRole && (
            <Chip
              label={userRole.replace("_", " ")}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mr: 2, fontWeight: 600 }}
            />
          )}

          <Typography variant="body2" sx={{ mr: 2, fontWeight: 500 }}>
            {session?.user.fullName ?? session?.user.username}
          </Typography>

          <Button color="inherit" variant="outlined" size="small" onClick={signOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? 240 : 64,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? 240 : 64,
            boxSizing: "border-box",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: "hidden",
          },
        }}
      >
        <Box sx={{ mt: 8 }}>
          <List>
            <ListItemButton component={NavLink} to="/" selected={selected("/")}>
              <ListItemIcon sx={{ minWidth: open ? 40 : "auto", mr: open ? 0 : "auto", justifyContent: "center" }}>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              {open && <ListItemText primary="Dashboard" />}
            </ListItemButton>

            {NAV_GROUPS.map((group) => {
              const visibleItems = group.items.filter(isItemVisible);
              if (visibleItems.length === 0) return null;

              return (
                <Fragment key={group.label}>
                  {open && (
                    <ListSubheader sx={{ bgcolor: "transparent", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase" }}>
                      {group.label}
                    </ListSubheader>
                  )}
                  {visibleItems.map((item) => (
                    <ListItemButton
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      selected={selected(item.path)}
                    >
                      <ListItemIcon sx={{ minWidth: open ? 40 : "auto", mr: open ? 0 : "auto", justifyContent: "center" }}>
                        {item.icon}
                      </ListItemIcon>
                      {open && <ListItemText primary={item.label} />}
                    </ListItemButton>
                  ))}
                </Fragment>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: CONTENT_PADDING, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}