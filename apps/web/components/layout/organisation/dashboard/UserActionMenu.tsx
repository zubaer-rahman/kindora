import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Loader2, UserPlus, UserMinus, Crown, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserActionMenuProps {
  currentUserRole: string;
  targetUserRole: string;
  userId: string;
  onUpdateRole: (userId: string, role: string) => void;
  onToggleMentor: (userId: string, role: string) => void;
  onDeleteUser: (userId: string) => void;
  isUpdatingRole: boolean;
  isDemotingMentor: boolean;
}

export function UserActionMenu({
  currentUserRole,
  targetUserRole,
  userId,
  onUpdateRole,
  onToggleMentor,
  onDeleteUser,
  isUpdatingRole,
  isDemotingMentor,
}: UserActionMenuProps) {
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
        {currentUserRole === "admin" && targetUserRole !== "volunteer" && (
          <DropdownMenuItem
            onClick={() => onUpdateRole(userId, targetUserRole)}
            disabled={isUpdatingRole}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 focus:from-blue-50 focus:to-blue-100/50 focus:outline-none"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100">
              <Crown className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground font-medium">
                Change to {targetUserRole === "admin" ? "Mentor" : "Admin"}
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
            onClick={() => onToggleMentor(userId, targetUserRole)}
            disabled={isUpdatingRole || isDemotingMentor}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm",
              "hover:bg-gradient-to-r hover:shadow-sm focus:outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
              targetUserRole === "mentor"
                ? "hover:from-red-50 hover:to-red-100/50 focus:from-red-50 focus:to-red-100/50"
                : "hover:from-emerald-50 hover:to-emerald-100/50 focus:from-emerald-50 focus:to-emerald-100/50"
            )}
          >
            {isUpdatingRole || isDemotingMentor ? (
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center w-5 h-5">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">
                  {targetUserRole === "mentor" ? "Removing..." : "Promoting..."}
                </span>
              </div>
            ) : targetUserRole === "mentor" ? (
              <>
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                  <UserMinus className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">Remove Mentor Role</span>
                  <span className="text-xs text-muted-foreground">Demote to volunteer</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">Promote to Mentor</span>
                  <span className="text-xs text-muted-foreground">Grant mentor privileges</span>
                </div>
              </>
            )}
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-medium text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 focus:from-red-50 focus:to-red-100/50 focus:outline-none"
            onClick={() => onDeleteUser(userId)}
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
              <Shield className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Delete User</span>
              <span className="text-xs text-red-500">Permanently remove user</span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
