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
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Users"
        value={stats.total_users}
        icon={<Users size={24} />}
      />

      <StatCard
        title="Total Posts"
        value={stats.total_posts}
        icon={<FileText size={24} />}
      />

      <StatCard
        title="Active Posts"
        value={stats.active_posts}
        icon={<CheckCircle size={24} />}
      />

      <StatCard
        title="Archived Posts"
        value={stats.archived_posts}
        icon={<Archive size={24} />}
      />

      <StatCard
        title="New Users (7 Days)"
        value={stats.new_users}
        icon={<UserPlus size={24} />}
      />

      <StatCard
        title="Total Comments"
        value={stats.total_comments}
        icon={<MessageSquare size={24} />}
      />

      <StatCard
        title="Total Likes"
        value={stats.total_likes}
        icon={<Heart size={24} />}
      />
    </div>
  );
}
