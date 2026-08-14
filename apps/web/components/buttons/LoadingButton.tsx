import { type ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type LoadingButtonProps = ComponentProps<typeof Button> & {
  isLoading: boolean;
  loadingText?: string;
};

export function LoadingButton({
  isLoading,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}
