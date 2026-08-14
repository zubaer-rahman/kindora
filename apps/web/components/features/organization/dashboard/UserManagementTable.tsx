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
import UserAvatar from "@/components/common/UserAvatar";
import { UserActionMenu } from "./UserActionMenu";
import { useUserMutations } from "@/hooks/useUserMutations";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const columnHelper = legacyCreateColumnHelper<User>();



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
              <UserActionMenu
                currentUserRole={currentUserRole}
                targetUserRole={targetUserRole}
                userId={info.row.original._id}
                onUpdateRole={handleUpdateRole}
                onToggleMentor={handleToggleMentor}
                onDeleteUser={handleDeleteUser}
                isUpdatingRole={updateRoleMutation.isPending}
                isDemotingMentor={demoteMentorMutation.isPending}
              />
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
                  <UserActionMenu
                    currentUserRole={currentUserRole}
                    targetUserRole={targetUserRole}
                    userId={user._id}
                    onUpdateRole={handleUpdateRole}
                    onToggleMentor={handleToggleMentor}
                    onDeleteUser={handleDeleteUser}
                    isUpdatingRole={updateRoleMutation.isPending}
                    isDemotingMentor={demoteMentorMutation.isPending}
                  />
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
