import React, { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/message";
import Avatar from "./Avatar";
import FormattedMessage from "./FormattedMessage";
import { getSupabaseFileUrl } from "@/utils/supabase-url";
import { Download, FileText, Image as ImageIcon } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatMessageDate = (date: Date): string => {
  const now = new Date();
  const diffInDays = differenceInDays(now, date);

  if (diffInDays === 0) {
    return format(date, "h:mm a");
  } else if (diffInDays === 1) {
    return "Yesterday " + format(date, "h:mm a");
  } else if (diffInDays < 7) {
    return format(date, "EEE h:mm a");
  } else {
    return format(date, "MMM d, h:mm a");
  }
};

const AttachmentFile: React.FC<{
  file: { path: string; filename: string; fileType: string; size: number };
  isOwnMessage: boolean;
  index: number;
}> = ({ file, isOwnMessage, index }) => {
  const [imageError, setImageError] = useState(false);
  const isImage = file.fileType.startsWith('image/');
  const fileUrl = getSupabaseFileUrl(file.path);

  if (!fileUrl) {
    // Fallback if URL generation fails
    return (
      <div
        key={index}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg",
          isOwnMessage
            ? "bg-white/10 text-white border border-white/10"
            : "bg-gray-50 text-gray-800 border border-gray-200"
        )}
      >
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
          isOwnMessage ? "bg-white/20" : "bg-white shadow-sm text-blue-500"
        )}>
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.filename}</p>
          <p className={cn("text-xs opacity-70", isOwnMessage ? "text-blue-100" : "text-gray-500")}>
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
    );
  }

  if (isImage && !imageError) {
    return (
      <a
        key={index}
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden transition-all duration-200 hover:opacity-90"
      >
        <img
          src={fileUrl}
          alt={file.filename}
          className="w-full max-h-[400px] object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </a>
    );
  }

  // Fallback for images that fail to load or non-image files
  return (
    <a
      key={index}
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group/file",
        isOwnMessage
          ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
          : "bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200"
      )}
    >
      <div className={cn(
        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
        isOwnMessage ? "bg-white/20 group-hover/file:bg-white/30" : "bg-white shadow-sm text-blue-500"
      )}>
        {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.filename}</p>
        <p className={cn("text-xs opacity-70", isOwnMessage ? "text-blue-100" : "text-gray-500")}>
          {formatFileSize(file.size)}
        </p>
      </div>
      <Download size={16} className={cn("flex-shrink-0 opacity-0 group-hover/file:opacity-100 transition-opacity", isOwnMessage ? "text-white" : "text-gray-500")} />
    </a>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const hasText = message.content && message.content.trim();
  const attachments = message.attachments || [];

  return (
    <div
      className={cn(
        "group flex w-full mb-4 fade-in-0 animate-in zoom-in-95 duration-200",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
    >
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-2 sm:mr-3 self-end mb-1">
          <Avatar
            name={message.sender?.organization_profile?.title || message.sender?.name || 'User'}
            image={message.sender?.image}
            size={32}
            className="ring-2 ring-white"
          />
        </div>
      )}

      <div className={cn("flex flex-col max-w-[75%] sm:max-w-[70%]", isOwnMessage ? "items-end" : "items-start")}>
        <div
          className={cn(
            "relative shadow-sm overflow-hidden",
            isOwnMessage
              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-tr-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm"
          )}
        >
          {hasText && (
            <div className={cn("px-4 py-3 text-sm sm:text-[15px] leading-relaxed", isOwnMessage ? "text-blue-50" : "text-gray-800")}>
              <FormattedMessage content={message.content!} isOwnMessage={isOwnMessage} />
            </div>
          )}

          {attachments.length > 0 && (
            <div className={cn(
              "flex flex-col",
              hasText ? "gap-2 pb-2" : "gap-0"
            )}>
              {attachments.map((file, index) => {
                const isImage = file.fileType.startsWith('image/');
                return (
                  <div
                    key={index}
                    className={cn(
                      !isImage ? "px-4 py-2" : "",
                      isImage && hasText ? "mt-1" : ""
                    )}
                  >
                    <AttachmentFile file={file} isOwnMessage={isOwnMessage} index={index} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className={cn(
          "text-[11px] font-medium mt-1 px-1 transition-opacity opacity-0 group-hover:opacity-100 select-none",
          isOwnMessage ? "text-gray-400 mr-1" : "text-gray-400 ml-1"
        )}>
          {formatMessageDate(new Date(message.createdAt))}
        </p>
      </div>

      {isOwnMessage && (
        <div className="flex-shrink-0 ml-2 sm:ml-3 self-end mb-1 opacity-0">
          <div className="w-8 h-8" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble; 