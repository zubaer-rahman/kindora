import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreateOpportunityButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
  onClick?: () => void;
}

export function CreateOpportunityButton({
  className,
  size = "lg",
  variant = "default",
  children = "Post an opportunity",
  onClick,
}: CreateOpportunityButtonProps) {
  const router = useRouter();
  const { session, profileCheck } = useAuthCheck();

  const role = session?.user?.role as string | undefined;
  const isOrgRole = role === "organization" || role === "organisation" || role === "admin";
  const hasOrgProfile = !!profileCheck?.hasOrganizationProfile;
  const shouldDisable = isOrgRole && !hasOrgProfile;

  const handleClick = () => {
    if (shouldDisable) {
      router.push("/organisation/profile");
      return;
    }
    if (onClick) {
      onClick();
    } else {
      router.push("/organisation/opportunities/create");
    }
  };

  const button = (
    <Button
      className={cn(
        "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all duration-200 flex items-center w-full sm:w-auto",
        shouldDisable && "opacity-60 cursor-not-allowed hover:bg-blue-600",
        className
      )}
      size={size}
      variant={variant}
      onClick={handleClick}
    >
      <PlusIcon className="mr-2 transform scale-170" />
      {children}
    </Button>
  );

  if (shouldDisable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p>Complete your organisation profile first to post opportunities.</p>
            <p className="text-xs text-muted-foreground mt-1">Click to go to profile</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
} 