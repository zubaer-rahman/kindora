import React from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { MoreHorizontal, MoreVertical } from 'lucide-react';

export interface ActionDropdownOption {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  showSeparatorBefore?: boolean;
}

interface ActionDropdownProps {
  options: ActionDropdownOption[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'default';
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  options,
  orientation = 'horizontal',
  size = 'default',
  className = '',
  open,
  onOpenChange,
}) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : '';

  return (
    <DropdownMenu {...(open !== undefined ? { open, onOpenChange } : {})}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`cursor-pointer ${buttonSize} ${orientation === 'vertical' ? 'rounded-full' : ''} ${className}`}
          onClick={e => e.stopPropagation()}
        >
          {orientation === 'vertical' ? (
            <MoreVertical className={iconSize + ' text-gray-500'} />
          ) : (
            <MoreHorizontal className={iconSize + ' text-gray-500'} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option, idx) => (
          <React.Fragment key={option.label + idx}>
            {option.showSeparatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={option.onClick}
              className={`flex items-center gap-2 cursor-pointer ${option.variant === 'destructive' ? 'text-red-600' : ''}`}
              variant={option.variant}
              disabled={option.disabled}
            >
              {option.icon && <option.icon className="h-4 w-4" />}
              {option.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown; 