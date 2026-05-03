import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useGetMe, useBaristaLogout, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  refetchUser: () => void;
  selectedBranchId: number | null; // null means "All Branches"
  setSelectedBranchId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem("selectedBranchId");
    return saved ? (saved === "all" ? null : parseInt(saved)) : null;
  });

  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      retry: false,
    },
  } as any);

  useEffect(() => {
    if (user && user.role !== "admin") {
      // Non-admins are locked to their session branch
      const bId = (user as any).branch?.id || (user as any).branchId;
      setSelectedBranchIdState(bId ?? null);
    }
  }, [user]);

  const setSelectedBranchId = (id: number | null) => {
    setSelectedBranchIdState(id);
    localStorage.setItem("selectedBranchId", id === null ? "all" : id.toString());
    // Clear queries to ensure data is refetched for the new branch context
    queryClient.invalidateQueries();
  };

  const logoutMutation = useBaristaLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(["me"], null);
        queryClient.removeQueries();
        localStorage.removeItem("selectedBranchId");
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
        selectedBranchId,
        setSelectedBranchId,
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
