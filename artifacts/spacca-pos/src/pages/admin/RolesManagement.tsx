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
  ShieldAlert
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RolesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  // Form states
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

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
  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions-list"],
    queryFn: async () => {
      const res = await fetch("/api/roles/permissions/list");
      if (!res.ok) throw new Error("Failed to load permissions list");
      return res.json();
    }
  });

  const handleOpenDialog = async (role?: any) => {
    if (role) {
      setEditingRole(role);
      setKey(role.key);
      setName(role.name);
      setDescription(role.description || "");
      
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
      setKey("");
      setName("");
      setDescription("");
      setSelectedPermissions([]);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!key || !name) {
        toast({ variant: "destructive", title: "Error", description: "Key and Name are required" });
        return;
      }

      const url = editingRole ? `/api/roles/${editingRole.key}` : "/api/roles";
      const method = editingRole ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          name,
          description,
          permissions: selectedPermissions
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save role");
      }

      toast({ title: "Success", description: editingRole ? "Role updated" : "Role created" });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (roleKey: string) => {
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

  const togglePermission = (permKey: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permKey) 
        ? prev.filter(k => k !== permKey) 
        : [...prev, permKey]
    );
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-muted/10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">Manage system roles and their assigned access levels.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 font-bold h-11">
          <Plus className="h-4 w-4" /> Create New Role
        </Button>
      </div>

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
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {role.key !== "admin" && (
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(role.key)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              Define the role name and select the permissions it should have.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role-key">Role Key (ID)</Label>
                <Input 
                  id="role-key" 
                  value={key} 
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s+/g, '_'))} 
                  disabled={!!editingRole}
                  placeholder="e.g. supervisor"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role-name">Display Name</Label>
                <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shift Supervisor" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input id="role-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What can this role do?" />
            </div>

            <div className="space-y-3 mt-4 flex-1 min-h-0 flex flex-col">
              <Label>Permissions</Label>
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
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
