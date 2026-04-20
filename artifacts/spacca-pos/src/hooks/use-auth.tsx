import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useGetMe, useBaristaLogout, User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      retry: false,
    },
  } as any);

  const logoutMutation = useBaristaLogout({
    mutation: {
      onSuccess: () => {
        refetch();
        setLocation("/login");
      },
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        logout,
        refetchUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
