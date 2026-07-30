"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/adminapi";
import { AdminDashboardResponse } from "@/lib/admin";
import DashboardStats from "@/components/admin/dashboardstat";
import DashboardSkeleton from "@/components/admin/DashboardSkeleton";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return <DashboardStats stats={stats!} />;
}
