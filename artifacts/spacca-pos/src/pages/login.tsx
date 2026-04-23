import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useBaristaLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [pin, setPin] = useState("");
  const [, setLocation] = useLocation();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from") || "/pos";

  useEffect(() => {
    if (user) {
      if (params.has("from")) {
        setLocation(params.get("from")!);
      } else {
        // Role-based default redirection
        switch (user.role) {
          case "barista":
            setLocation("/kitchen");
            break;
          case "cashier":
            setLocation("/cashier");
            break;
          case "pickup":
            setLocation("/pickup");
            break;
          case "admin":
            setLocation("/admin");
            break;
          default:
            setLocation("/pos");
        }
      }
    }
  }, [user, setLocation]);

  const loginMutation = useBaristaLogin({
    mutation: {
      onSuccess: () => {
        refetchUser();
        // The useEffect will handle redirect once user is set to avoid bounce
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid PIN code.",
        });
        setPin("");
      },
    },
  });

  const handleDigitClick = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    setPin("");
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length > 0) {
      loginMutation.mutate({ data: { pin } });
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md p-8 bg-card border rounded-xl shadow-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-primary mb-2">SPACCA</h1>
          <p className="text-muted-foreground">Barista POS Login</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < pin.length ? "bg-primary" : "bg-muted border"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              size="lg"
              className="h-16 text-2xl font-medium shadow-sm hover-elevate"
              onClick={() => handleDigitClick(digit.toString())}
              disabled={loginMutation.isPending}
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="lg"
            className="h-16 text-lg text-muted-foreground"
            onClick={handleClear}
            disabled={loginMutation.isPending || pin.length === 0}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-medium shadow-sm hover-elevate"
            onClick={() => handleDigitClick("0")}
            disabled={loginMutation.isPending}
          >
            0
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-16 text-lg text-muted-foreground"
            onClick={handleDelete}
            disabled={loginMutation.isPending || pin.length === 0}
          >
            Del
          </Button>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-medium"
            onClick={handleSubmit}
            disabled={loginMutation.isPending || pin.length === 0}
          >
            {loginMutation.isPending ? "Authenticating..." : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
