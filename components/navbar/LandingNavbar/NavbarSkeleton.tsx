import { Skeleton } from "@/components/ui/skeleton";

export default function NavbarSkeleton() {
  return (
    <>
      {/* Logo Skeleton */}
      <div className="flex items-center ml-6">
        <Skeleton className="h-8 md:h-10 w-[120px]" />
      </div>

      {/* Desktop Navigation Skeleton */}
      <div className="hidden md:flex items-center space-x-8">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Right Side Actions Skeleton */}
      <div className="flex items-center space-x-4 mr-6">
        <Skeleton className="h-[49px] w-[107px] rounded-full" />
      </div>
    </>
  );
}
