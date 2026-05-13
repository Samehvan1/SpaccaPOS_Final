import { useState, useMemo } from "react";
import { useListActivityLogs } from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { History, Search, Activity, Calendar, ArrowLeft, ChevronLeft, ChevronRight, FilterX, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 50;

export default function ActivityLogs() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    action: "",
    userName: "",
    entityType: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const queryParams = useMemo(() => ({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    action: filters.action || undefined,
    userName: filters.userName || undefined,
    entityType: filters.entityType === "ALL_PLACEHOLDER" ? undefined : (filters.entityType || undefined),
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  } as any), [page, filters]);

  const { data, isLoading } = useListActivityLogs(queryParams);
  const logs = (data as any)?.data || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      userName: "",
      entityType: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });
    setPage(0);
  };

  return (
    <div className="p-8 w-full h-full overflow-hidden flex flex-col bg-muted/10">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-background shadow-sm border">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              Activity Logs
            </h1>
            <p className="text-muted-foreground mt-1">Audit trail of system actions and administrative changes.</p>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border shadow-sm">
        <div className="p-4 border-b bg-muted/20 shrink-0 space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                <Activity className="h-3 w-3" /> Action
              </label>
              <Input 
                placeholder="Filter by action (e.g. LOGIN)..." 
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                <Search className="h-3 w-3" /> User Name
              </label>
              <Input 
                placeholder="Filter by user name..." 
                value={filters.userName}
                onChange={(e) => handleFilterChange("userName", e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5 w-48">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                <Filter className="h-3 w-3" /> Entity Type
              </label>
              <Select value={filters.entityType} onValueChange={(val) => handleFilterChange("entityType", val)}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_PLACEHOLDER">All Entities</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="ingredient">Ingredient</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="discount">Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                <Calendar className="h-3 w-3" /> From
              </label>
              <Input 
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="bg-background w-40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 ml-1">
                <Calendar className="h-3 w-3" /> To
              </label>
              <Input 
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="bg-background w-40"
              />
            </div>
            <Button variant="ghost" onClick={clearFilters} className="h-10 px-3 text-muted-foreground hover:text-destructive">
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[150px]">User</TableHead>
                <TableHead className="w-[150px]">Action</TableHead>
                <TableHead className="w-[150px]">Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground animate-pulse">
                    Loading audit logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : logs.map((log: any) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {log.userId}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{log.userName || `User #${log.userId}`}</span>
                        <span className="text-[10px] text-muted-foreground">ID: {log.userId}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-muted/50 border-muted-foreground/20">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.entityType ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        {log.entityType} #{log.entityId}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground max-w-md truncate">
                    {log.details ? JSON.stringify(log.details) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Pagination Controls */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{logs.length}</span> of <span className="font-medium text-foreground">{total}</span> logs
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(0, p - 1))} 
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="flex items-center gap-1 px-4">
              <span className="text-sm font-medium">Page {page + 1}</span>
              <span className="text-sm text-muted-foreground">of {totalPages || 1}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= totalPages - 1 || isLoading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
