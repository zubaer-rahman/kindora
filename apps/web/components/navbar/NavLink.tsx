import Link from "next/link";
import { ComponentType } from "react";

interface NavLinkProps {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  onClick?: () => void;
  showBadge?: boolean;
  badgeCount?: number;
}

export function NavLink({
  href,
  label,
  icon: Icon,
  className = "",
  onClick,
  showBadge,
  badgeCount,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{label}</span>
      {showBadge && badgeCount && badgeCount > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
          {badgeCount}
        </span>
      )}
    </Link>
  );
} 