import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon, Settings } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import logoBlack from "@/assets/logo_black.png";
import logoWhite from "@/assets/logo_white.png";

export default function MobileHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUiStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background flex items-center justify-between px-4">
      <Link to="/">
        <img src={logoBlack} alt="SceneLog" className="h-8 dark:hidden" />
        <img src={logoWhite} alt="SceneLog" className="h-8 hidden dark:block" />
      </Link>
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">{user?.nickname}님</span>
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} title="설정">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === "light" ? "다크 모드" : "라이트 모드"}>
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="로그아웃">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
