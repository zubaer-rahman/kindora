import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SignupActionBarProps {
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  defaultText?: string;
}

export function SignupActionBar({
  onClick,
  isLoading = false,
  disabled = false,
  children,
  defaultText = "Create Account",
}: SignupActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background py-4 px-6 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-end">
          <Button
            type={onClick ? "button" : "submit"}
            onClick={onClick}
            disabled={isLoading || disabled}
            className="bg-primary hover:bg-primary/90 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating account...
              </div>
            ) : (
              children ?? defaultText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
