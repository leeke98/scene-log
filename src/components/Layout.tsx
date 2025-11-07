import NavigationBar from "@/components/NavigationBar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="py-8">{children}</main>
    </div>
  );
}
