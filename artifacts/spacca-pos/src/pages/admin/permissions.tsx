import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Lock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Shield
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PermissionsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Navigation tabs: 'roles' or 'permissions'
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  // Role Dialog states
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleKey, setRoleKey] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Permission Dialog states
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [permKey, setPermKey] = useState("");
  const [permDescription, setPermDescription] = useState("");
  const [isSavingPerm, setIsSavingPerm] = useState(false);

  // Fetch Roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to load roles");
      return res.json();
    }
  });

  // Fetch Permissions List
  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["permissions-list"],
    queryFn: async () => {
      const res = await fetch("/api/roles/permissions/list");
      if (!res.ok) throw new Error("Failed to load permissions list");
      return res.json();
    }
  });

  const handleOpenRoleDialog = async (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleKey(role.key);
      setRoleName(role.name);
      setRoleDescription(role.description || "");
      
      // Fetch role permissions
      try {
        const res = await fetch(`/api/roles/${role.key}/permissions`);
        if (res.ok) {
          const data = await res.json();
          setSelectedPermissions(data.map((p: any) => p.permissionKey));
        }
      } catch (err) {
        console.error("Failed to fetch role permissions", err);
      }
    } else {
      setEditingRole(null);
      setRoleKey("");
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
    }
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (!roleKey || !roleName) {
        toast({ variant: "destructive", title: "Error", description: "Key and Name are required" });
        return;
      }

      const url = editingRole ? `/api/roles/${editingRole.key}` : "/api/roles";
      const method = editingRole ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: roleKey,
          name: roleName,
          description: roleDescription,
          permissions: selectedPermissions
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save role");
      }

      toast({ title: "Success", description: editingRole ? "Role updated" : "Role created" });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsRoleDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteRole = async (roleKey: string) => {
    if (!confirm("Are you sure you want to delete this role? All assigned permissions will be lost.")) return;
    try {
      const res = await fetch(`/api/roles/${roleKey}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete role");
      }
      toast({ title: "Success", description: "Role deleted" });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const togglePermission = (pKey: string) => {
    setSelectedPermissions(prev => 
      prev.includes(pKey) 
        ? prev.filter(k => k !== pKey) 
        : [...prev, pKey]
    );
  };

  // Dynamic Permission Handlers
  const handleOpenPermDialog = () => {
    setPermKey("");
    setPermDescription("");
    setIsPermDialogOpen(true);
  };

  const handleSavePermission = async () => {
    if (!permKey.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Permission key is required" });
      return;
    }
    
    setIsSavingPerm(true);
    try {
      const res = await fetch("/api/roles/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: permKey.trim(),
          description: permDescription.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create permission");
      }

      toast({ title: "Success", description: "Permission registered successfully" });
      queryClient.invalidateQueries({ queryKey: ["permissions-list"] });
      setIsPermDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSavingPerm(false);
    }
  };

  const handleDeletePermission = async (pKey: string) => {
    if (!confirm(`Are you sure you want to delete the permission "${pKey}"? This will revoke it from all roles and users override lists.`)) return;
    try {
      const res = await fetch(`/api/roles/permissions/${encodeURIComponent(pKey)}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete permission");
      }
      toast({ title: "Success", description: "Permission deleted" });
      queryClient.invalidateQueries({ queryKey: ["permissions-list"] });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-muted/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">Manage system roles, assign permissions, and dynamically define custom scopes.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "roles" ? (
            <Button onClick={() => handleOpenRoleDialog()} className="gap-2 font-bold h-11">
              <Plus className="h-4 w-4" /> Create New Role
            </Button>
          ) : (
            <Button onClick={handleOpenPermDialog} className="gap-2 font-bold h-11 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4" /> Register Permission
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Selection Container */}
      <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-lg border w-fit mb-6">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "roles"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="h-4 w-4" />
          Roles & Role Mappings
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all ${
            activeTab === "permissions"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          Permissions Registry
        </button>
      </div>

      {activeTab === "roles" ? (
        // Tab 1: Roles and Role Mappings
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRoles ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 animate-pulse">Loading roles...</TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">No roles configured.</TableCell>
                </TableRow>
              ) : roles.map((role: any) => (
                <TableRow key={role.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      {role.key === "admin" ? <ShieldCheck className="h-4 w-4 text-red-500" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{role.key}</code></TableCell>
                  <TableCell className="text-muted-foreground">{role.description || "No description"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenRoleDialog(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {role.key !== "admin" && (
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteRole(role.key)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        // Tab 2: Permissions Registry
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission Key</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPermissions ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 animate-pulse">Loading permission definitions...</TableCell>
                </TableRow>
              ) : permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">No permissions registered.</TableCell>
                </TableRow>
              ) : permissions.map((perm: any) => (
                <TableRow key={perm.id || perm.key} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-indigo-500" />
                      {perm.key}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{perm.description || <span className="italic text-xs text-muted-foreground/60">No description provided</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive" 
                        onClick={() => handleDeletePermission(perm.key)}
                        title="Delete permission definition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Role Creation/Editing Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              Define the role key, name, and choose the assigned permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role-key">Role Key (ID)</Label>
                <Input 
                  id="role-key" 
                  value={roleKey} 
                  onChange={(e) => setRoleKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))} 
                  disabled={!!editingRole}
                  placeholder="e.g. supervisor"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role-name">Display Name</Label>
                <Input id="role-name" value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="e.g. Shift Supervisor" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input id="role-desc" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} placeholder="What can this role do?" />
            </div>

            <div className="space-y-3 mt-4 flex-1 min-h-0 flex flex-col">
              <Label>Permissions Mapped to Role</Label>
              <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/5">
                <div className="space-y-4">
                  {permissions.map((perm: any) => (
                    <div key={perm.key} className="flex items-start space-x-3 space-y-0">
                      <Checkbox 
                        id={`perm-${perm.key}`} 
                        checked={selectedPermissions.includes(perm.key)}
                        onCheckedChange={() => togglePermission(perm.key)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={`perm-${perm.key}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {perm.key}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {perm.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole}>Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dynamic Permission Creation Dialog */}
      <Dialog open={isPermDialogOpen} onOpenChange={setIsPermDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register New Permission</DialogTitle>
            <DialogDescription>
              Create a custom permission scope that can be applied to routes and users override lists.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="perm-key">Permission Key</Label>
              <Input 
                id="perm-key"
                value={permKey}
                onChange={(e) => setPermKey(e.target.value.toLowerCase().replace(/[^a-z0-9_:]/g, ""))}
                placeholder="e.g. page:calibration:view"
              />
              <p className="text-[10px] text-muted-foreground">Use alphanumeric characters, colons, and underscores.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="perm-description">Description</Label>
              <Input 
                id="perm-description"
                value={permDescription}
                onChange={(e) => setPermDescription(e.target.value)}
                placeholder="Describe what this permission regulates"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPermDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermission} disabled={isSavingPerm}>
              {isSavingPerm ? "Saving..." : "Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
