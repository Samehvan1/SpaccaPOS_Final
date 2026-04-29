import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PermissionsAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (user?.role !== "admin") {
    return <Redirect to="/pos" />;
  }

  // Fetch all available permissions
  const { data: allPermissions = [], isLoading: isLoadingPerms } = useQuery({
    queryKey: ["/api/admin/permissions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/permissions");
      if (!res.ok) throw new Error("Failed to load permissions");
      return res.json();
    },
  });

  // Fetch current role permissions
  const { data: rolePermissions = [], isLoading: isLoadingRolePerms } = useQuery({
    queryKey: ["/api/admin/role-permissions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/role-permissions");
      if (!res.ok) throw new Error("Failed to load role permissions");
      return res.json();
    },
  });

  const roles = ["barista", "frontdesk", "cashier", "pickup"];

  // Local state for modified permissions
  const [localState, setLocalState] = useState<Record<string, Record<string, boolean>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state based on DB state when it loads
  if (!isLoadingPerms && !isLoadingRolePerms && Object.keys(localState).length === 0 && allPermissions.length > 0) {
    const initialState: Record<string, Record<string, boolean>> = {};
    roles.forEach(role => {
      initialState[role] = {};
      allPermissions.forEach((p: any) => {
        const hasPerm = rolePermissions.some((rp: any) => rp.role === role && rp.permissionKey === p.key);
        initialState[role][p.key] = hasPerm;
      });
    });
    setLocalState(initialState);
  }

  const handleToggle = (role: string, permissionKey: string, checked: boolean) => {
    setLocalState(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: checked
      }
    }));
    setHasChanges(true);
  };

  const updateRoleMutation = useMutation({
    mutationFn: async ({ role, permissions }: { role: string, permissions: string[] }) => {
      const res = await fetch("/api/admin/role-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, permissions })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-permissions"] });
    }
  });

  const handleSave = async () => {
    try {
      const promises = roles.map(role => {
        const activePermsForRole = Object.keys(localState[role] || {}).filter(
          key => localState[role][key]
        );
        return updateRoleMutation.mutateAsync({ role, permissions: activePermsForRole });
      });

      await Promise.all(promises);
      toast({ title: "Success", description: "Role permissions updated successfully" });
      setHasChanges(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const [newPermKey, setNewPermKey] = useState("");
  const [newPermDesc, setNewPermDesc] = useState("");
  const [showAddPerm, setShowAddPerm] = useState(false);

  const addPermissionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newPermKey, description: newPermDesc })
      });
      if (!res.ok) throw new Error("Failed to add permission");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/permissions"] });
      setNewPermKey("");
      setNewPermDesc("");
      setShowAddPerm(false);
      toast({ title: "Permission added" });
    }
  });

  const deletePermissionMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await fetch(`/api/admin/permissions/${key}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete permission");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/permissions"] });
      toast({ title: "Permission removed" });
    }
  });

  if (isLoadingPerms || isLoadingRolePerms) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Configure access control for system roles. The "Admin" role automatically has full access.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showAddPerm} onOpenChange={setShowAddPerm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Manual Permission Key</DialogTitle>
                  <DialogDescription>
                    Manually add a key to the system (e.g., "finances:export").
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Permission Key (Format: module:action)</Label>
                    <Input 
                      placeholder="e.g. settings:edit" 
                      value={newPermKey} 
                      onChange={e => setNewPermKey(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Input 
                      placeholder="What this controls..." 
                      value={newPermDesc} 
                      onChange={e => setNewPermDesc(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => addPermissionMutation.mutate()} disabled={!newPermKey}>
                    Create Permission
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || updateRoleMutation.isPending}
              className="gap-2"
            >
              {updateRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              Check the boxes to grant a permission to a specific role.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Permission</TableHead>
                  {roles.map(role => (
                    <TableHead key={role} className="text-center capitalize">
                      {role}
                    </TableHead>
                  ))}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPermissions.map((perm: any) => (
                  <TableRow key={perm.key}>
                    <TableCell>
                      <div className="font-medium">{perm.key}</div>
                      <div className="text-xs text-muted-foreground">{perm.description}</div>
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={`${role}-${perm.key}`} className="text-center">
                        <Checkbox
                          checked={localState[role]?.[perm.key] || false}
                          onCheckedChange={(checked) => handleToggle(role, perm.key, checked as boolean)}
                          aria-label={`Toggle ${perm.key} for ${role}`}
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Delete permission key "${perm.key}"? This will remove it from all roles.`)) {
                            deletePermissionMutation.mutate(perm.key);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {allPermissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={roles.length + 2} className="text-center h-24 text-muted-foreground">
                      No permissions found in the database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
