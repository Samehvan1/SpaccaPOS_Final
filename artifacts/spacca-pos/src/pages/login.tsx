import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useBaristaLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);

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
      },
      onError: (error: any) => {
        const message = error?.response?.data?.error || "Invalid username or password.";
        toast({
          variant: "destructive",
          title: "Login failed",
          description: message,
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate({ data: { username, password } });
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto flex items-center justify-center bg-muted/30 p-4 min-h-screen">
      <div className="w-full max-w-md p-8 bg-card border rounded-xl shadow-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter text-primary mb-2">SPACCA</h1>
          <p className="text-muted-foreground">Secure POS Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username text-muted-foreground">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
              autoComplete="username"
              required
              disabled={loginMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password text-muted-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
              autoComplete="current-password"
              required
              disabled={loginMutation.isPending}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-medium shadow-lg hover-elevate transition-all"
              disabled={loginMutation.isPending || !username || !password}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>© 2026 Spacca POS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
