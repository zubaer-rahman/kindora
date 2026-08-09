import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorite } from "@/hooks/useFavorite";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  opportunityId: string;
  className?: string;
}

export function FavoriteButton({
  opportunityId,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, isLoading, isToggling, toggleFavorite } = useFavorite(opportunityId);
  const { data: session } = useSession();
  const router = useRouter();

  if (isLoading) {
    return (
      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
    );
  }

  return (
    <Star
      className={cn(
        "h-5 w-5 cursor-pointer",
        isFavorite ? "text-yellow-400 fill-current" : "text-gray-400",
        isToggling && "opacity-50",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!session) {
          router.push(`/login?redirect=/opportunities/${opportunityId}`);
          return;
        }
        toggleFavorite();
      }}
    />
  );
} 