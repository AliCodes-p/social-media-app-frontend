import {
  Users,
  FileText,
  Archive,
  UserPlus,
  MessageSquare,
  Heart,
  CheckCircle,
} from "lucide-react";

import StatCard from "./statcard";
import { AdminDashboardResponse } from "@/lib/admin";

interface DashboardStatsProps {
  stats: AdminDashboardResponse;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Users"
        value={stats.total_users}
        icon={
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <Users size={20} />
          </div>
        }
      />

      <StatCard
        title="Total Posts"
        value={stats.total_posts}
        icon={
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
            <FileText size={20} />
          </div>
        }
      />

      <StatCard
        title="Active Posts"
        value={stats.active_posts}
        icon={
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle size={20} />
          </div>
        }
      />

      <StatCard
        title="Archived Posts"
        value={stats.archived_posts}
        icon={
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Archive size={20} />
          </div>
        }
      />

      <StatCard
        title="New Users (7 Days)"
        value={stats.new_users}
        icon={
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <UserPlus size={20} />
          </div>
        }
      />

      <StatCard
        title="Total Comments"
        value={stats.total_comments}
        icon={
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <MessageSquare size={20} />
          </div>
        }
      />

      <StatCard
        title="Total Likes"
        value={stats.total_likes}
        icon={
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
            <Heart size={20} />
          </div>
        }
      />
    </div>
  );
}
