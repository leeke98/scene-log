import Sidebar from "@/components/Sidebar";
import BottomTabBar from "@/components/BottomTabBar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 py-8 pb-24 md:pb-8 min-w-0">{children}</main>
      <BottomTabBar />
    </div>
  );
}
