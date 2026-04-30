import { createContext, useContext, type ReactNode } from "react";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsContextValue {
  autoPrintCustomer: boolean;
  autoPrintAgent: boolean;
  allowNoStockSell: boolean;
  setAutoPrintCustomer: (val: boolean) => void;
  setAutoPrintAgent: (val: boolean) => void;
  setAllowNoStockSell: (val: boolean) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  // Fetch global settings
  const { data: settings, isLoading } = useGetSettings({ scope: "global" });
  const { mutate: update } = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        // Invalidate settings query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      }
    }
  });

  // Helper to find setting value by key, default to 'true' (enabled)
  const getSettingValue = (key: string, defaultValue: boolean = true): boolean => {
    const setting = settings?.find(s => s.key === key);
    return setting ? setting.value === "true" : defaultValue;
  };

  const setSettingValue = (key: string, val: boolean) => {
    update({
      data: {
        scope: "global",
        settings: [{ key, value: String(val) }]
      }
    });
  };

  const autoPrintCustomer = getSettingValue("autoPrintCustomer");
  const autoPrintAgent = getSettingValue("autoPrintAgent");
  const allowNoStockSell = getSettingValue("allowNoStockSell", false);

  return (
    <SettingsContext.Provider 
      value={{ 
        autoPrintCustomer, 
        autoPrintAgent, 
        allowNoStockSell,
        setAutoPrintCustomer: (val) => setSettingValue("autoPrintCustomer", val),
        setAutoPrintAgent: (val) => setSettingValue("autoPrintAgent", val),
        setAllowNoStockSell: (val) => setSettingValue("allowNoStockSell", val),
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
