"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Key, Ban, CheckCircle, Search, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/app/loading";
import { adminService } from "@/services/admin.service";

const LIMIT = 15;

export default function SystemAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [editName, setEditName] = useState("");

  const userEmail: string = (session?.user as any)?.email ?? "";
  const userRole: string = (session?.user as any)?.role ?? "";
  const isSystemAdmin =
    userRole === "system_admin" && userEmail.endsWith(".kindora.com");

  if (status === "loading")
    return (
      <Loading size="medium">
        <p className="text-muted-foreground mt-2">Checking access...</p>
      </Loading>
    );
  if (status === "authenticated" && !isSystemAdmin) {
    router.replace("/login");
    return null;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers", search, page],
    queryFn: () => adminService.getUsers(axiosAuth, search, LIMIT, page),
    enabled: isSystemAdmin,
  });

  const users: any[] = data?.users ?? [];
  const totalPages: number = data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(axiosAuth, userId),
    onSuccess: () => {
      toast.success("User deleted.");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Failed to delete user."),
  });

  const passwordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      adminService.updatePassword(axiosAuth, userId, password),
    onSuccess: () => {
      toast.success("Password updated.");
      setPasswordModalOpen(false);
      setNewPassword("");
      setSelectedUser(null);
    },
    onError: () => toast.error("Failed to update password."),
  });

  const blockMutation = useMutation({
    mutationFn: ({ userId, is_blocked }: { userId: string; is_blocked: boolean }) =>
      adminService.updateBlockStatus(axiosAuth, userId, is_blocked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
    onError: () => toast.error("Failed to update block status."),
  });

  const editMutation = useMutation({
    mutationFn: ({ userId, name }: { userId: string; name: string }) =>
      adminService.updateUser(axiosAuth, userId, name),
    onSuccess: () => {
      toast.success("User updated.");
      setEditModalOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Failed to update user."),
  });

  return (
    <>
      {/* ── Outer wrapper: fills the parent content column ── */}
      <div className="flex flex-col h-full min-h-0 gap-4">
        {/* Header card — fixed height */}
        <div className="bg-accent rounded-xl p-6 border border-border shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {data?.total ?? "—"} total users · page {page} of {totalPages}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-background border-border text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table card — flex-1 fills remaining height; only tbody scrolls */}
        <div className="bg-background rounded-xl border border-border flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Mobile cards */}
          <div className="flex-1 overflow-auto min-h-0 md:hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-accent/50 rounded-xl p-4 border border-border">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-5 w-20 rounded-md" />
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="p-4 space-y-3">
                {users.map((u: any) => (
                  <div
                    key={u._id}
                    className="bg-accent/50 rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          u.is_blocked
                            ? "bg-destructive/10 text-destructive shrink-0"
                            : "bg-success/10 text-success shrink-0"
                        }
                      >
                        {u.is_blocked ? "Blocked" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-accent text-primary border-none capitalize"
                      >
                        {u.role}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setEditName(u.name);
                            setEditModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:bg-accent"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setPasswordModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-primary hover:bg-accent"
                          title="Set new password"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            blockMutation.mutate({
                              userId: u._id,
                              is_blocked: !u.is_blocked,
                            })
                          }
                          className={`h-8 w-8 p-0 ${u.is_blocked ? "text-success" : "text-amber-600"} hover:bg-accent`}
                          title={u.is_blocked ? "Unblock" : "Block"}
                        >
                          {u.is_blocked ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Delete ${u.name}? This cannot be undone.`
                              )
                            )
                              deleteMutation.mutate(u._id);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground px-4">
                No users found.
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:flex flex-1 overflow-auto min-h-0">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow className="border-b border-border">
                  <TableHead className="text-muted-foreground font-semibold pl-6">
                    User
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    Role
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-border/60">
                        <TableCell className="py-4 pl-6">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 rounded-md" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : users.length > 0 ? (
                  users.map((u: any) => (
                    <TableRow
                      key={u._id}
                      className="border-b border-border/60 hover:bg-accent/60 transition-colors"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="font-medium text-foreground">
                          {u.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-accent text-primary border-none capitalize"
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            u.is_blocked
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success"
                          }
                        >
                          {u.is_blocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setEditName(u.name);
                              setEditModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:bg-accent"
                            title="Edit user"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setPasswordModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-primary hover:bg-accent"
                            title="Set new password"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              blockMutation.mutate({
                                userId: u._id,
                                is_blocked: !u.is_blocked,
                              })
                            }
                            className={`h-8 w-8 p-0 ${u.is_blocked ? "text-success" : "text-amber-600"} hover:bg-accent`}
                            title={u.is_blocked ? "Unblock" : "Block"}
                          >
                            {u.is_blocked ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete ${u.name}? This cannot be undone.`
                                )
                              )
                                deleteMutation.mutate(u._id);
                            }}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination — pinned to bottom of card */}
          <div className="border-t border-border px-6 py-3 shrink-0">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    aria-disabled={page === totalPages}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* ── Password Reset Modal ── */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="bg-background rounded-xl border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Set New Password — {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-border"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordModalOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                passwordMutation.mutate({
                  userId: selectedUser?._id,
                  password: newPassword,
                })
              }
              disabled={newPassword.length < 6 || passwordMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {passwordMutation.isPending ? "Updating…" : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Modal ── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-background rounded-xl border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Edit User
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Display name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border-border"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                editMutation.mutate({
                  userId: selectedUser?._id,
                  name: editName,
                })
              }
              disabled={!editName.trim() || editMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
