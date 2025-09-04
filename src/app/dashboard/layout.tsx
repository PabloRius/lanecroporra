"use client";

import { useAuth } from "@/providers/auth-provider";
import { SidebarProvider } from "@/providers/sidebar-provider";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    redirect("/login");
  }

  return <SidebarProvider>{children}</SidebarProvider>;
}
