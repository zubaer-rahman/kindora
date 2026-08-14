import React from "react";
import Avatar from "./Avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  _id: string;
  name: string;
  image: string;
  role: string;
}

interface UserListProps {
  users: User[] | undefined;
  onSelectUser: (userId: string) => void;
  isLoading: boolean;
}

export const UserList: React.FC<UserListProps> = React.memo(({
  users,
  onSelectUser,
  isLoading
}) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto" style={{ height: '100%' }}>
        <div className="px-2">
          {isLoading ? (
            <div className="p-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                >
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-2/3 max-w-[140px]" />
                    <Skeleton className="h-3 w-1/3 max-w-[90px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : users?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No users found</div>
          ) : (
            <div className="divide-y divide-border">
              {users?.map((user) => (
                <button
                  key={user._id}
                  onClick={() => onSelectUser(user._id)}
                  className="w-[calc(100%-16px)] mx-2 my-1 p-3 rounded-2xl text-left transition-all duration-200 group relative border border-transparent hover:bg-muted hover:border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 transition-transform group-hover:scale-105">
                      <Avatar name={user.name} image={user.image} size={44} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

UserList.displayName = 'UserList';

export default UserList; 