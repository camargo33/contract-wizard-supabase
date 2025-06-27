
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton = ({ className, lines = 3 }: LoadingSkeletonProps) => {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-4 bg-gray-200 rounded",
            index === lines - 1 && "w-3/4",
            className
          )}
        />
      ))}
    </div>
  );
};

export const CardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("ciabrasnet-card p-6 animate-pulse", className)}>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex space-x-4 p-4 border rounded-lg animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};
