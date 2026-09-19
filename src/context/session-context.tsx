import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { AppUser, UserRole } from "@/types/domain";

/**
 * Authentication is explicitly out of scope for this test. This context
 * simulates "being logged in as" one of the two roles so the UI can
 * demonstrate role-based behavior end to end. Swapping this for real
 * auth later only means replacing the provider's internals — the
 * `useSession()` contract (`user`, `role`) stays the same for consumers.
 */

const MOCK_USERS: Record<UserRole, AppUser> = {
  USER: { id: "user-1", name: "John Doe", role: "USER" },
  APPROVER: { id: "user-2", name: "Sarah Lin", role: "APPROVER" },
};

const STORAGE_KEY = "procureflow.session.role";

interface SessionContextValue {
  user: AppUser;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function getInitialRole(): UserRole {
  if (typeof window === "undefined") return "USER";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "APPROVER" ? "APPROVER" : "USER";
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(getInitialRole);

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ user: MOCK_USERS[role], role, setRole }),
    [role, setRole],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
