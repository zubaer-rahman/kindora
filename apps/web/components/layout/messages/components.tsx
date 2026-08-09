import React from "react";
import { Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const MessageInput = React.memo(({ 
  newMessage, 
  setNewMessage, 
  handleSendMessage, 
  isSending 
}: { 
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isSending: boolean;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSendMessage} className="w-full">
      <div className="flex items-center h-16 px-4 py-4 border-t">
        <div className="flex-1 flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="h-10 flex-1"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isSending}
            className="h-10"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Sending...
              </span>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
});

MessageInput.displayName = 'MessageInput';

export const ConversationHeader = ({ 
  user, 
  onMenuClick,
  isGroup,
  onDeleteGroup
}: { 
  user: { name: string; image?: string; members?: number }; 
  onMenuClick: () => void;
  isGroup?: boolean;
  onDeleteGroup?: () => void;
}) => (
  <header className="p-4 border-b flex-shrink-0">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>
        {isGroup ? (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-500" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-500 font-semibold">
              {user.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h2 className="font-semibold">{user.name}</h2>
          {isGroup && user.members && (
            <p className="text-xs text-gray-500">{user.members} members</p>
          )}
        </div>
      </div>
      {isGroup && onDeleteGroup && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onDeleteGroup}
        >
          Delete Group
        </Button>
      )}
    </div>
  </header>
); 