import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSession,
  getSession,
  saveSession,
  setUnauthorizedHandler,
  type Session,
} from "../api/request";

/** Auth store / session provider. DRY resolve it: no Redux, light state only. */
interface SessionContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  signIn(session: Session): void;
  signOut(): void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession());
  const navigate = useNavigate();

  // Route any global 401 straight back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      navigate("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [navigate]);

  const signIn = (next: Session) => {
    saveSession(next);
    setSession(next);
  };

  const signOut = () => {
    clearSession();
    setSession(null);
    navigate("/login");
  };

  const value: SessionContextValue = {
    session,
    isAuthenticated: session !== null,
    signIn,
    signOut,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}