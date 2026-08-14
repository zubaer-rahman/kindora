import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  cardClassName?: string;
}

export function AuthCard({ title, description, children, cardClassName }: AuthCardProps) {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className={cn("w-full max-w-md", cardClassName)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
