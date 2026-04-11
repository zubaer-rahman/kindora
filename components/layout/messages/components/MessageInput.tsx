import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Avatar from "./Avatar";
import { Paperclip, X, FileText, Image as ImageIcon, Loader2, SendHorizontal, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Mentionee {
  _id: string;
  name: string;
  image?: string;
}

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e?: React.FormEvent, files?: File[]) => void;
  isSending: boolean;
  mentionees?: Mentionee[];
  onTypingStatusChange?: (isTyping: boolean) => void;
  isGroup?: boolean;
  currentUserId?: string;
}

export const MessageInput: React.FC<MessageInputProps> = React.memo(({
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
  mentionees = [],
  onTypingStatusChange,
  isGroup = false,
  currentUserId
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const isTypingRef = useRef(false);

  useEffect(() => {
    // Only enable mentions in group messages
    if (!isGroup) {
      setShowMentions(false);
    } else {
      const lastWord = newMessage.split(/\s/).pop() || "";
      if (lastWord.startsWith("@")) {
        setShowMentions(true);
        setMentionFilter(lastWord.slice(1).toLowerCase());
        setSelectedIndex(0);
      } else {
        setShowMentions(false);
      }
    }

    if (newMessage.length > 0) {
      if (!isTypingRef.current) {
        onTypingStatusChange?.(true);
        isTypingRef.current = true;
      }

      const timer = setTimeout(() => {
        onTypingStatusChange?.(false);
        isTypingRef.current = false;
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      if (isTypingRef.current) {
        onTypingStatusChange?.(false);
        isTypingRef.current = false;
      }
    }
  }, [newMessage, onTypingStatusChange, isGroup]);

  // Filter out current user and filter by name
  const filteredMentionees = mentionees
    .filter(m => {
      // Exclude current user from mentions
      if (currentUserId && m._id === currentUserId) return false;
      // Filter by name if there's a filter
      return m.name.toLowerCase().includes(mentionFilter);
    })
    .slice(0, 5);

  const handleMentionSelect = (name: string) => {
    const words = newMessage.split(/\s/);
    words.pop();
    const formattedName = name.replace(/\s+/g, '_');
    const updatedMessage = [...words, `@${formattedName} `].join(" ");
    setNewMessage(updatedMessage);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredMentionees.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMentionees.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMentionees.length) % filteredMentionees.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleMentionSelect(filteredMentionees[selectedIndex].name);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024); // 10MB limit
      if (validFiles.length < files.length) {
        import("react-hot-toast").then(t => t.default.error("Some files exceed the 10MB limit"));
      }
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showMentions) return;
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    await handleSendMessage(e, selectedFiles);
    setSelectedFiles([]);
  };

  return (
    <div className="w-full bg-white pb-3 pt-3 relative">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-b flex flex-wrap gap-2 max-h-32 overflow-y-auto mb-2 bg-gray-50/50">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-lg py-1.5 px-3 text-xs group relative animate-in fade-in zoom-in-95">
              {file.type.startsWith('image/') ? <ImageIcon size={14} className="text-blue-500" /> : <FileText size={14} className="text-orange-500" />}
              <span className="max-w-[120px] truncate font-medium text-gray-700">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                disabled={isSending}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showMentions && filteredMentionees.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] overflow-hidden ring-1 ring-black/5 animate-in slide-in-from-bottom-2">
          <div className="p-2 border-b bg-gray-50/50 text-xs font-medium text-gray-500">
            Mention someone
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filteredMentionees.map((m, index) => (
              <div
                key={m._id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all duration-200",
                  index === selectedIndex ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"
                )}
                onClick={() => handleMentionSelect(m.name)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Avatar name={m.name} image={m.image} size={28} />
                <span className="text-sm font-medium">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="w-full px-3 sm:px-4 relative">
        <div className="flex items-end gap-2 bg-gray-100 rounded-[26px] p-1.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white border border-transparent focus-within:border-blue-200">

          <div className="flex items-center pb-1 pl-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              multiple
              disabled={isSending}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-transparent rounded-full transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            {/* Emoji Picker */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "h-8 w-8 text-gray-400 hover:text-yellow-500 hover:bg-transparent rounded-full transition-colors hidden sm:flex",
                  showEmojiPicker && "text-yellow-500 bg-yellow-50"
                )}
              >
                <Smile className="h-5 w-5" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-10 left-0 z-50">
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <div className="relative z-50 shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={(emojiData: EmojiClickData) => {
                        setNewMessage(newMessage + emojiData.emoji);
                        inputRef.current?.focus();
                      }}
                      lazyLoadEmojis={true}
                      width={300}
                      height={400}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={newMessage || ''}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 min-h-[40px] max-h-32 py-2.5 px-2 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 text-gray-700 text-[15px] leading-relaxed resize-none overflow-y-auto shadow-none"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
            }}
          />

          <Button
            type="submit"
            disabled={(!newMessage?.trim() && selectedFiles.length === 0) || isSending}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full flex-shrink-0 transition-all duration-200 mb-0.5 mr-0.5",
              (!newMessage?.trim() && selectedFiles.length === 0)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95"
            )}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SendHorizontal className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;