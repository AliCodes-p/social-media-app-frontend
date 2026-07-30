"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import AdminSidebar from "@/components/admin/adminsidebar";
import AdminTopbar from "@/components/admin/admintopbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  let title = "Admin Dashboard";

  if (pathname === "/admin") {
    title = "Dashboard";
  } else if (pathname.startsWith("/admin/users")) {
    title = "User Management";
  } else if (pathname === "/admin/posts") {
    title = "Post Management";
  } else if (pathname.startsWith("/admin/posts/")) {
    title = "Post Details";
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <AdminTopbar title={title} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
