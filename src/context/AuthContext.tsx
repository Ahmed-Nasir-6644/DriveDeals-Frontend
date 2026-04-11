import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type AuthContextValue = {
  email: string | null;
  setEmail: (email: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmailState] = useState<string | null>(
    () => localStorage.getItem("userEmail")
  );

  useEffect(() => {
    if (email) {
      localStorage.setItem("userEmail", email);
    } else {
      localStorage.removeItem("userEmail");
    }
  }, [email]);

  const setEmail = (nextEmail: string | null) => {
    setEmailState(nextEmail);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setEmailState(null);
  };

  const value = useMemo(
    () => ({ email, setEmail, logout }),
    [email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
