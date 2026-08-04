import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {[...Array(7)].map((_, index) => (
        <Card key={index} className="bg-white ring-1 ring-slate-100 rounded-xl">
          <CardHeader className="items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100" />
            <div className="min-w-0 space-y-1">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          </CardHeader>

          <CardContent className="pt-3 pb-4">
            <Skeleton className="h-8 w-20 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
