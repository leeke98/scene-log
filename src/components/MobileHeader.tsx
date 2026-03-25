import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo_new.png";

export default function MobileHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b bg-background flex items-center justify-between px-4">
      <Link to="/">
        <img src={logo} alt="SceneLog" className="h-8" />
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{user?.nickname}님</span>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="로그아웃">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
