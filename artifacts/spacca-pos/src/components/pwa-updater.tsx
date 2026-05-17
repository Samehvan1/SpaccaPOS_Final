import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function PWAUpdater() {
  const { toast } = useToast();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every hour
        setInterval(() => {
          r.update().catch((err) => console.error("SW update error", err));
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: "Update Available",
        description: "A new version of Spacca POS is available. Please update to get the latest features and fixes.",
        duration: 1000000, // Keep open until clicked
        action: (
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => updateServiceWorker(true)}
          >
            Update Now
          </Button>
        ),
      });
    }
  }, [needRefresh, updateServiceWorker, toast]);

  return null;
}
