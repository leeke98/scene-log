import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/queries/auth";
import { useUiStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoBlack from "@/assets/logo_black.png";
import logoWhite from "@/assets/logo_white.png";
import {
  Home,
  BookOpen,
  BarChart2,
  Compass,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "홈", icon: Home },
  { path: "/records", label: "공연기록", icon: BookOpen },
  { path: "/report", label: "리포트", icon: BarChart2 },
  { path: "/explore", label: "탐색", icon: Compass },
];

const reportSubItems = [
  { path: "/report", label: "전체" },
  { path: "/report/actor", label: "배우" },
  { path: "/report/performance", label: "극" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useUiStore();
  const isReportSection = location.pathname.startsWith("/report");
  const [reportOpen, setReportOpen] = useState(isReportSection);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-background sticky top-0 h-screen shrink-0 transition-[width] duration-200",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!sidebarCollapsed && (
          <Link to="/">
            <img src={logoBlack} alt="SceneLog" className="h-9 dark:hidden" />
            <img src={logoWhite} alt="SceneLog" className="h-9 hidden dark:block" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "사이드바 열기" : "사이드바 접기"}
          className="shrink-0 text-muted-foreground"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isReport = item.path === "/report";
          return (
            <div key={item.path}>
              <div
                className={cn(
                  "flex items-center rounded-md transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-bold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Link
                  to={item.path}
                  className={cn(
                    "flex flex-1 items-center gap-3 py-2.5 text-sm font-medium",
                    sidebarCollapsed ? "justify-center px-0" : "px-3"
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && item.label}
                </Link>

                {isReport && !sidebarCollapsed && (
                  <button
                    onClick={() => setReportOpen((prev) => !prev)}
                    className="pr-2 py-2.5 pl-1"
                  >
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        reportOpen && "rotate-180"
                      )}
                    />
                  </button>
                )}
              </div>

              {/* 리포트 하위 메뉴 */}
              {isReport && reportOpen && !sidebarCollapsed && (
                <div className="mt-1 ml-7 space-y-0.5">
                  {reportSubItems.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={cn(
                        "block px-3 py-1.5 rounded-md text-sm transition-colors",
                        location.pathname === sub.path
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              title="설정"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === "light" ? "다크 모드" : "라이트 모드"}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="로그아웃"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/settings"
              className="text-sm font-medium text-foreground truncate hover:underline"
              title="설정"
            >
              {user?.nickname}님
            </Link>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={theme === "light" ? "다크 모드" : "라이트 모드"}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="로그아웃"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
