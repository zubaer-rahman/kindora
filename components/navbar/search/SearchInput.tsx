import { Input } from "@/components/ui/input";

interface SearchInputProps {
  query: string;
  placeholder: string;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e?: React.FormEvent) => void;
  autoFocus?: boolean;
  readOnly?: boolean;
  className?: string;
}

export const SearchInput = ({ query, placeholder, onInput, onSearch, autoFocus, readOnly, className }: SearchInputProps) => (
  <Input
    type="text"
    placeholder={placeholder}
    value={query}
    onChange={onInput}
    onKeyDown={(e) => {
      if (e.key === 'Enter') onSearch();
    }}
    autoFocus={autoFocus}
    readOnly={readOnly}
    className={`shadow-none text-black focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${className}`}
    autoComplete="off"
  />
); 