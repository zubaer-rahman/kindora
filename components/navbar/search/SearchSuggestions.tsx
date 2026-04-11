import { motion, AnimatePresence } from "framer-motion";
import { Search, History } from "lucide-react";

interface SearchSuggestionsProps {
  query: string;
  searchHistory: string[];
  suggestions: string[];
  onSelect: (item: string) => void;
  showDropdown: boolean;
}

export const SearchSuggestions = ({ query, searchHistory, suggestions, onSelect, showDropdown }: SearchSuggestionsProps) => (
  <AnimatePresence>
    {showDropdown && (query === '' ? searchHistory.length : suggestions.length) > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="absolute left-0 top-full mt-2 w-full bg-white rounded-md z-50"
      >
        {(query === '' ? searchHistory : suggestions).map((item) => (
          <button
            key={item}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-800 gap-2 rounded"
            onClick={() => onSelect(item)}
          >
            {query === '' ? (
              <History className="w-4 h-4 text-gray-400" />
            ) : (
              <Search className="w-4 h-4 text-gray-400" />
            )}
            {item}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
); 