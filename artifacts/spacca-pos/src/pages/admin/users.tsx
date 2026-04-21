import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Coffee, 
  Monitor, 
  Calculator, 
  Package,
  Plus,
  Search,
  Key
} from "lucide-react";

type UserRole = "admin" | "barista" | "frontdesk" | "cashier" | "pickup";

const ROLE_CONFIG: Record<UserRole, { label: string; icon: any; color: string }> = {
  admin: { label: "Administrator", icon: ShieldCheck, color: "bg-red-500/10 text-red-600 border-red-500/20" },
  barista: { label: "Barista", icon: Coffee, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  frontdesk: { label: "Front Desk", icon: Monitor, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  cashier: { label: "Cashier", icon: Calculator, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  pickup: { label: "Pickup", icon: Package, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("barista");
  const [pin, setPin] = useState("");

  const { data: users = [], isLoading, error } = useListUsers();
  
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser } = useDeleteUser();

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setRole(user.role as UserRole);
      setPin(user.pin || "");
    } else {
      setEditingUser(null);
      setName("");
      setRole("barista");
      setPin("");
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !pin.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Name and PIN are required" });
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
        toast({ variant: "destructive", title: "Error", description: "PIN must be 4-6 digits" });
        return;
    }

    const payload = { name, role, pin };

    if (editingUser) {
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

    deleteUser(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/users"] });
          toast({ title: "Success", description: "User deleted" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to delete user" });
        }
      }
    );
  };

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <p className="text-muted-foreground mt-1">Manage staff access, roles, and security PINs.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 font-bold h-11">
          <UserPlus className="h-4 w-4" /> Add New User
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-3">
          <ShieldCheck className="h-5 w-5" />
          <div className="flex-1 font-medium">
            Failed to load users: {(error as any).message || "Unknown error"}
          </div>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/users"] })}>
            Retry
          </Button>
        </div>
      )}

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
              <TableHead>Role</TableHead>
              <TableHead>Security PIN</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground capitalize animate-pulse">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : filteredUsers.map((user) => {
              const config = ROLE_CONFIG[user.role as UserRole];
              const Icon = config.icon;
              return (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="font-bold text-lg">{user.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1.5 px-3 py-1 font-semibold ${config.color}`}>
                      <Icon className="h-3.5 w-3.5" /> {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono bg-muted px-2 py-1 rounded w-fit">
                      <Key className="h-3 w-3 text-muted-foreground" />
                      {user.pin}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt!).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUser ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              Set the name, role, and terminal PIN for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Assigned Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pin">Terminal PIN (4-6 digits)</Label>
              <Input 
                id="pin" 
                maxLength={6} 
                value={pin} 
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                placeholder="****"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? "Saving..." : "Save User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
