import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const API_URL = "/api";
const TOKEN_STORAGE_KEY = "alumni_token";

export interface Alumnus {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  batch: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface AlumniAuthContextValue {
  token: string | null;
  alumnus: Alumnus | null;
  isLoading: boolean;
  login: (accessCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchAsAlumni: (path: string, options?: RequestInit) => Promise<Response>;
}

const AlumniAuthContext = createContext<AlumniAuthContextValue | undefined>(undefined);

export function AlumniAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [alumnus, setAlumnus] = useState<Alumnus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAsAlumni = (path: string, options: RequestInit = {}) => {
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_URL}/alumni/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Invalid session");
      })
      .then((data: Alumnus) => setAlumnus(data))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setAlumnus(null);
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (accessCode: string) => {
    try {
      const response = await fetch(`${API_URL}/alumni/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: accessCode }),
      });

      if (!response.ok) {
        return { success: false, error: "Kode akses tidak valid" };
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setAlumnus(data.alumni);
      return { success: true };
    } catch {
      return { success: false, error: "Gagal menghubungi server" };
    }
  };

  const logout = () => {
    if (token) {
      fetch(`${API_URL}/alumni/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setAlumnus(null);
  };

  return (
    <AlumniAuthContext.Provider value={{ token, alumnus, isLoading, login, logout, fetchAsAlumni }}>
      {children}
    </AlumniAuthContext.Provider>
  );
}

export function useAlumniAuth() {
  const ctx = useContext(AlumniAuthContext);
  if (!ctx) {
    throw new Error("useAlumniAuth must be used within an AlumniAuthProvider");
  }
  return ctx;
}
