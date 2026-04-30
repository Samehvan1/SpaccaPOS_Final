import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.BASE_URL.replace(/\/$/, "") + "/api");

export function useOrderEvents(enabled = true) {
  const queryClient = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let active = true;

    function connect() {
      if (!active) return;

      const es = new EventSource(`${API_BASE}/events`, { withCredentials: true });
      esRef.current = es;

      const invalidateOrders = () => {
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/active-orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      };

      es.addEventListener("order_created", invalidateOrders);
      es.addEventListener("order_updated", invalidateOrders);
      es.addEventListener("inventory_updated", () => {
        queryClient.invalidateQueries({ queryKey: ["/api/drinks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      });

      es.addEventListener("error", () => {
        es.close();
        esRef.current = null;
        if (active) {
          retryTimeout = setTimeout(connect, 3000);
        }
      });
    }

    connect();

    return () => {
      active = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [enabled, queryClient]);
}
