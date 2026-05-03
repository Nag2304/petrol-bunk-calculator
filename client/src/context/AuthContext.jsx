import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);
const STORAGE_KEY = "petrol-bunk-auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  const value = useMemo(
    () => ({
      auth,
      async login(values) {
        const data = await api.login(values);
        setAuth(data);
        return data;
      },
      async register(values) {
        const data = await api.register(values);
        setAuth(data);
        return data;
      },
      logout() {
        setAuth(null);
      }
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
