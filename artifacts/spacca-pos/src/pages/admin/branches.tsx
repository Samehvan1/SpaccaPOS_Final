import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, MapPin, Phone, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface Branch {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function BranchesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    isActive: true,
  });

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ["admin-branches"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/branches`);
      if (!res.ok) throw new Error("Failed to fetch branches");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${API_BASE}/admin/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create branch");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
      toast({ title: "Success", description: "Branch created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`${API_BASE}/admin/branches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update branch");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
      toast({ title: "Success", description: "Branch updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/admin/branches/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete branch");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
      toast({ title: "Deleted", description: "Branch has been removed" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", address: "", phone: "", isActive: true });
    setEditingBranch(null);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address || "",
      phone: branch.phone || "",
      isActive: branch.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Branch <span className="text-neon-cyan">Management</span></h1>
          <p className="text-muted-foreground mt-1 font-bold uppercase tracking-widest text-[10px]">Configure your locations and service points</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-neon-cyan text-black font-bold uppercase tracking-widest hover:opacity-90 transition-all px-6">
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                {editingBranch ? "Edit Branch" : "New Branch"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Branch Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Downtown Cafe"
                  className="bg-white/5 border-white/10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Unique Code</Label>
                <Input
                  id="code"
                  placeholder="e.g. DNTN-01"
                  className="bg-white/5 border-white/10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address</Label>
                <Input
                  id="address"
                  placeholder="Street, City"
                  className="bg-white/5 border-white/10"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  className="bg-white/5 border-white/10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 rounded border-white/10 bg-white/5 accent-neon-cyan"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Branch is active</Label>
              </div>
              <DialogFooter className="pt-6">
                <Button type="submit" className="w-full bg-neon-cyan text-black font-black uppercase tracking-widest py-6">
                  {editingBranch ? "Update Location" : "Create Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} className="glass-card border-white/10 overflow-hidden group hover:border-neon-cyan/30 transition-all duration-500">
            <CardHeader className="p-6 pb-2">
              <div className="flex justify-between items-start mb-2">
                <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center text-neon-cyan border border-neon-cyan/20 group-hover:glow-cyan transition-all duration-500">
                  <Building2 className="h-6 w-6" />
                </div>
                <Badge variant="outline" className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border-0 ${
                  branch.isActive ? "bg-neon-green/10 text-neon-green" : "bg-red-500/10 text-red-500"
                }`}>
                  {branch.isActive ? "Online" : "Offline"}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-black tracking-tighter uppercase">{branch.name}</CardTitle>
              <CardDescription className="text-[10px] font-bold text-neon-cyan uppercase tracking-[0.2em]">{branch.code}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <MapPin className="h-4 w-4 shrink-0 text-white/30" />
                  <span className="truncate">{branch.address || "No address set"}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <Phone className="h-4 w-4 shrink-0 text-white/30" />
                  <span>{branch.phone || "No phone set"}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                  onClick={() => handleEdit(branch)}
                >
                  <Pencil className="mr-2 h-3 w-3" /> Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-red-500/5 border-red-500/10 hover:bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Trash2 className="mr-2 h-3 w-3" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-card border-white/10 text-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/40 font-medium">
                        This will permanently delete the <strong>{branch.name}</strong> location. All associated reports will remain but the branch cannot be selected anymore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 uppercase font-black text-[10px]">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700 text-white uppercase font-black text-[10px]"
                        onClick={() => deleteMutation.mutate(branch.id)}
                      >
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
