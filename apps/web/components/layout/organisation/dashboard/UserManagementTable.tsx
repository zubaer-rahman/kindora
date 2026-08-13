"use client";
import React, { useMemo, useState } from "react";
import {
  useLegacyTable,
  getCoreRowModel,
  getPaginationRowModel,
  legacyCreateColumnHelper,
} from "@tanstack/react-table/legacy";
import { flexRender } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Loader2,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";
import UserAvatar from "@/components/ui/UserAvatar";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const columnHelper = legacyCreateColumnHelper<User>();

function useUserMutations() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateRoleMutation = useMutation({
    mutationFn: async (payload: { userId: string; role: "admin" | "mentor" }) => {
      const res = await axiosAuth.patch(`/api/v1/users/${payload.userId}/role`, { role: payload.role });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["organizationUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user role");
    },
  });

  const demoteMentorMutation = useMutation({
    mutationFn: async (payload: { userId: string }) => {
      const res = await axiosAuth.post(`/api/v1/users/${payload.userId}/demote`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Mentor role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["organizationUsers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove mentor role");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (payload: { userId: string }) => {
      const res = await axiosAuth.delete(`/api/v1/users/${payload.userId}`);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["organizationUsers"] });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
  });

  const handleUpdateRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "mentor" : "admin";
    updateRoleMutation.mutate({ userId, role: newRole as "admin" | "mentor" });
  };

  const handleToggleMentor = (userId: string, currentRole: string) => {
    if (currentRole === "mentor") {
      demoteMentorMutation.mutate({ userId });
    } else if (currentRole === "volunteer") {
      updateRoleMutation.mutate({ userId, role: "mentor" });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate({ userId: userToDelete });
    }
  };

  return {
    updateRoleMutation,
    demoteMentorMutation,
    deleteUserMutation,
    handleUpdateRole,
    handleToggleMentor,
    handleDeleteUser,
    confirmDeleteUser,
    userToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    session,
  };
}

export default function UserManagementTable({
  organizationId,
}: {
  organizationId: string;
}) {
  const axiosAuth = useAxiosAuth();
  const { data: users, isLoading } = useQuery({
    queryKey: ["organizationUsers"],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/users/organization/${organizationId}`);
      return res.data.data;
    },
    enabled: !!organizationId
  });

  const {
    updateRoleMutation,
    demoteMentorMutation,
    deleteUserMutation,
    handleUpdateRole,
    handleToggleMentor,
    handleDeleteUser,
    confirmDeleteUser,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    session,
  } = useUserMutations();

  const filteredUsers = useMemo(
    () => users?.filter((user) => user._id !== session?.user?.id) || [],
    [users, session?.user?.id]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <UserAvatar
              user={{
                name: info.getValue(),
                image: info.row.original.avatar
              }}
              size={32}
              className="w-8 h-8"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base truncate">
                {info.getValue()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {info.row.original.email}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => (
          <span className="capitalize text-sm sm:text-base">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => {
          const currentUserRole = session?.user?.role || "";
          const targetUserRole = info.row.original.role;
          const canDelete =
            currentUserRole === "admin" ||
            (currentUserRole === "mentor" && targetUserRole === "mentor");
          const canToggleMentor =
            currentUserRole === "admin" &&
            (targetUserRole === "volunteer" || targetUserRole === "mentor");

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-full hover:bg-muted/80 transition-colors duration-200"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-xl"
                sideOffset={8}
              >
                {currentUserRole === "admin" &&
                  targetUserRole !== "volunteer" && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleUpdateRole(info.row.original._id, targetUserRole)
                      }
                      disabled={updateRoleMutation.isPending}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 focus:from-blue-50 focus:to-blue-100/50 focus:outline-none"
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
                        <Crown className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-foreground font-medium">
                           Change to{" "}
                           {targetUserRole === "admin" ? "Mentor" : "Admin"}
                         </span>
                         <span className="text-xs text-muted-foreground">
                           {targetUserRole === "admin"
                             ? "Demote to mentor role"
                             : "Promote to admin role"}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )}
                {canToggleMentor && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleToggleMentor(info.row.original._id, targetUserRole)
                    }
                    disabled={
                      updateRoleMutation.isPending ||
                      demoteMentorMutation.isPending
                    }
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm",
                      "hover:bg-gradient-to-r hover:shadow-sm focus:outline-none",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                      targetUserRole === "mentor"
                        ? "hover:from-red-50 hover:to-red-100/50 focus:from-red-50 focus:to-red-100/50"
                        : "hover:from-emerald-50 hover:to-emerald-100/50 focus:from-emerald-50 focus:to-emerald-100/50"
                    )}
                  >
                    {updateRoleMutation.isPending ||
                    demoteMentorMutation.isPending ? (
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex items-center justify-center w-5 h-5">
                           <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                         <span className="text-muted-foreground">
                           {targetUserRole === "mentor"
                             ? "Removing..."
                             : "Promoting..."}
                        </span>
                      </div>
                    ) : targetUserRole === "mentor" ? (
                      <>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                          <UserMinus className="w-3.5 h-3.5 text-red-600" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-foreground font-medium">
                             Remove Mentor Role
                           </span>
                           <span className="text-xs text-muted-foreground">
                             Demote to volunteer
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                          <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-foreground font-medium">
                             Promote to Mentor
                           </span>
                           <span className="text-xs text-muted-foreground">
                             Grant mentor privileges
                          </span>
                        </div>
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 focus:from-red-50 focus:to-red-100/50 focus:outline-none"
                    onClick={() => handleDeleteUser(info.row.original._id)}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">Delete User</span>
                      <span className="text-xs text-red-500">
                        Permanently remove user
                      </span>
                    </div>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [
      session?.user?.role,
      handleUpdateRole,
      handleToggleMentor,
      handleDeleteUser,
      demoteMentorMutation.isPending,
      updateRoleMutation.isPending,
    ]
  );

  const table = useLegacyTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden sm:block rounded-md">
        <table className="w-full caption-bottom text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {table.getRowModel().rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          table.getRowModel().rows.map((row) => {
            const user = row.original;
            const currentUserRole = session?.user?.role || "";
            const targetUserRole = user.role;
            const canDelete =
              currentUserRole === "admin" ||
              (currentUserRole === "mentor" && targetUserRole === "mentor");
            const canToggleMentor =
              currentUserRole === "admin" &&
              (targetUserRole === "volunteer" || targetUserRole === "mentor");

            return (
              <div key={row.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                  <UserAvatar
                    user={{
                      name: user.name,
                      image: user.avatar
                    }}
                    size={40}
                    className="w-10 h-10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full hover:bg-muted/80 transition-colors duration-200"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-64 p-2 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-xl"
                        sideOffset={8}
                      >
                      {currentUserRole === "admin" &&
                        targetUserRole !== "volunteer" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateRole(user._id, targetUserRole)
                            }
                            disabled={updateRoleMutation.isPending}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 focus:from-blue-50 focus:to-blue-100/50 focus:outline-none"
                          >
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
                              <Crown className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-foreground font-medium">
                                 Change to{" "}
                                 {targetUserRole === "admin"
                                   ? "Mentor"
                                   : "Admin"}
                               </span>
                               <span className="text-xs text-muted-foreground">
                                 {targetUserRole === "admin"
                                   ? "Demote to mentor role"
                                   : "Promote to admin role"}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        )}
                      {canToggleMentor && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleMentor(user._id, targetUserRole)
                          }
                          disabled={
                            updateRoleMutation.isPending ||
                            demoteMentorMutation.isPending
                          }
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm",
                            "hover:bg-gradient-to-r hover:shadow-sm focus:outline-none",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                            targetUserRole === "mentor"
                              ? "hover:from-red-50 hover:to-red-100/50 focus:from-red-50 focus:to-red-100/50"
                              : "hover:from-emerald-50 hover:to-emerald-100/50 focus:from-emerald-50 focus:to-emerald-100/50"
                          )}
                        >
                          {updateRoleMutation.isPending ||
                          demoteMentorMutation.isPending ? (
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex items-center justify-center w-5 h-5">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                              </div>
                               <span className="text-muted-foreground">
                                 {targetUserRole === "mentor"
                                   ? "Removing..."
                                   : "Promoting..."}
                              </span>
                            </div>
                          ) : targetUserRole === "mentor" ? (
                            <>
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                                <UserMinus className="w-3.5 h-3.5 text-red-600" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-foreground font-medium">
                                   Remove Mentor Role
                                 </span>
                                 <span className="text-xs text-muted-foreground">
                                   Demote to volunteer
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-foreground font-medium">
                                   Promote to Mentor
                                 </span>
                                 <span className="text-xs text-muted-foreground">
                                   Grant mentor privileges
                                </span>
                              </div>
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 focus:from-red-50 focus:to-red-100/50 focus:outline-none"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                            <Shield className="w-3.5 h-3.5 text-red-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">Delete User</span>
                            <span className="text-xs text-red-500">
                              Permanently remove user
                            </span>
                          </div>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Role:</span>
                  <span className="capitalize text-sm font-medium">
                    {user.role}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        onConfirm={confirmDeleteUser}
        variant="destructive"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
