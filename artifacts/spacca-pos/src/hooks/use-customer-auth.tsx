import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

export type Customer = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  points: number;
  total_spent: string;
  visit_count: number;
  notes?: string | null;
  created_at: string;
};

type CustomerAuthContext = {
  customer: Customer | null;
  isLoading: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
};

const CustomerAuthCtx = createContext<CustomerAuthContext>({
  customer: null,
  isLoading: true,
  refetch: () => {},
  logout: async () => {},
});

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/customers/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => setCustomer(data?.customer ?? null))
      .catch(() => setCustomer(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const logout = useCallback(async () => {
    await fetch(`${API_BASE}/customers/logout`, { method: "POST", credentials: "include" });
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthCtx.Provider value={{ customer, isLoading, refetch, logout }}>
      {children}
    </CustomerAuthCtx.Provider>
  );
}

export function useCustomerAuth() {
  return useContext(CustomerAuthCtx);
}
