import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  useListUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser 
} from "@workspace/api-client-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Permission Override Dialog State
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [permEditingUser, setPermEditingUser] = useState<any>(null);
  const [userOverrides, setUserOverrides] = useState<Record<string, boolean>>({});

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("barista");
  const [isActive, setIsActive] = useState(true);

  const { data: users = [], isLoading } = useListUsers();
  
  // Fetch dynamic roles for the select
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error("Failed to load roles");
      return res.json();
    }
  });

  // Fetch permissions list
  const { data: permissionsList = [] } = useQuery({
    queryKey: ["permissions-list"],
    queryFn: async () => {
      const res = await fetch("/api/roles/permissions/list");
      if (!res.ok) throw new Error("Failed to load permissions list");
      return res.json();
    }
  });

  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser } = useDeleteUser();

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setUsername(user.username || "");
      setPassword(""); 
      setRole(user.role);
      setIsActive(user.isActive !== false);
    } else {
      setEditingUser(null);
      setName("");
      setUsername("");
      setPassword("");
      setRole("barista");
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleOpenPermDialog = async (user: any) => {
    setPermEditingUser(user);
    try {
      const res = await fetch(`/api/users/${user.id}/permissions`);
      if (res.ok) {
        const data = await res.json();
        const overrides: Record<string, boolean> = {};
        data.forEach((p: any) => {
          overrides[p.permissionKey] = p.granted;
        });
        setUserOverrides(overrides);
        setIsPermDialogOpen(true);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load user permissions" });
    }
  };

  const handleSavePermissions = async () => {
    try {
      const permissions = Object.entries(userOverrides).map(([key, granted]) => ({
        key,
        granted
      }));
      const res = await fetch(`/api/users/${permEditingUser.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions })
      });
      if (!res.ok) throw new Error("Failed to update permissions");
      
      toast({ title: "Success", description: "User-level permissions updated" });
      setIsPermDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleSave = () => {
    if (!name.trim() || !username.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Name and Username are required" });
      return;
    }

    const payload: any = { name, username, role };
    if (password) payload.password = password;

    if (editingUser) {
      payload.isActive = isActive;
      updateUser(
        { id: editingUser.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "Success", description: "User updated successfully" });
            setIsDialogOpen(false);
          },
          onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update user" });
          }
        }
      );
    } else {
      createUser(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/users"] });
            toast({ title: "Success", description: "User created successfully" });
            setIsDialogOpen(false);
          },
          onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create user" });
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    deleteUser({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        toast({ title: "Success", description: "User deleted" });
      }
    });
  };

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 w-full h-full overflow-y-auto bg-muted/10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage staff accounts, roles, and access status.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 font-bold h-11">
          <UserPlus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 animate-pulse capitalize">Loading users...</TableCell></TableRow>
            ) : filteredUsers.map((user: any) => (
              <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="font-bold text-lg">{user.name}</div>
                  <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-mono bg-muted/50 px-2 py-1 rounded w-fit text-sm">
                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                    {user.username}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="px-3 py-1 font-semibold uppercase">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isActive !== false ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-500/20 gap-1">
                      <XCircle className="h-3 w-3" /> Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" title="Permissions" onClick={() => handleOpenPermDialog(user)}>
                      <Lock className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r: any) => (
                    <SelectItem key={r.key} value={r.key}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <Label>Active Account</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isCreating || isUpdating}>Save User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPermDialogOpen} onOpenChange={setIsPermDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Permissions for {permEditingUser?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col">
            <ScrollArea className="flex-1 border rounded-md p-4 my-4 bg-muted/5">
              <div className="space-y-4">
                {permissionsList.map((perm: any) => (
                  <div key={perm.key} className="flex items-center justify-between group">
                    <div className="grid gap-1">
                      <Label className="text-sm font-medium">{perm.key}</Label>
                      <p className="text-xs text-muted-foreground">{perm.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{userOverrides[perm.key] ? "Granted" : "Denied"}</span>
                          <Switch 
                            checked={userOverrides[perm.key] ?? false}
                            onCheckedChange={(checked) => setUserOverrides(prev => ({ ...prev, [perm.key]: checked }))}
                          />
                       </div>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-7 px-2 text-[10px]"
                         onClick={() => {
                            const newOverrides = { ...userOverrides };
                            delete newOverrides[perm.key];
                            setUserOverrides(newOverrides);
                         }}
                       >
                         Reset
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPermDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions}>Save Overrides</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
