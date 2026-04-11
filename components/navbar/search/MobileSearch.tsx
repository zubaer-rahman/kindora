import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { SearchSuggestions } from "./SearchSuggestions";

interface MobileSearchProps {
  query: string;
  placeholder: string;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e?: React.FormEvent) => void;
  searchHistory: string[];
  suggestions: string[];
  showDropdown: boolean;
  onSelect: (item: string) => void;
  onClose: () => void;
}

export const MobileSearch = ({ query, placeholder, onInput, onSearch, searchHistory, suggestions, showDropdown, onSelect, onClose }: MobileSearchProps) => (
  <div className="md:hidden w-full">
    <div className="flex items-center justify-between px-3 pt-6 pb-2">
      <motion.div
        initial={{ scaleX: 0.5, width: '100%', transformOrigin: 'right' }}
        animate={{ scaleX: 1, width: '100%' }}
        exit={{ scaleX: 0.5, width: '100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="flex-1 flex items-center relative"
        style={{ minWidth: 0 }}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <Search className="h-5 w-5" />
        </span>
        <SearchInput
          query={query}
          placeholder={placeholder}
          onInput={onInput}
          onSearch={onSearch}
          autoFocus
          className="w-full pl-10 pr-2 py-2 border border-black text-base font-normal focus:border-black focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 bg-white outline-none shadow-none rounded-md"
        />
        <SearchSuggestions
          query={query}
          searchHistory={searchHistory}
          suggestions={suggestions}
          onSelect={onSelect}
          showDropdown={showDropdown}
        />
      </motion.div>
      <button
        type="button"
        className="ml-2 text-green-600 font-medium text-base"
        onClick={onClose}
        aria-label="Close search"
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        Close
      </button>
    </div>
  </div>
); 