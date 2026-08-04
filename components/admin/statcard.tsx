import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="bg-white ring-1 ring-slate-100 rounded-xl transition-transform hover:shadow-md hover:-translate-y-0.5">
      <CardHeader className="items-center gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div className="min-w-0">
          <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-3 pb-4">
        <div className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
