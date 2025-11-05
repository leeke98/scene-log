import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function NavigationBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="SceneLog" className="w-18 h-14" />
          </Link>
          <nav className="flex gap-6">
            <Link
              to="/"
              className={`font-medium transition-colors ${
                isActive("/")
                  ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              공연기록
            </Link>
            <Link
              to="/report"
              className={`font-medium transition-colors ${
                isActive("/report")
                  ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              리포트
            </Link>
            <Link
              to="/explore"
              className={`font-medium transition-colors ${
                isActive("/explore")
                  ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              탐색
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">
            {user?.nickname}님
          </span>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-white"
          >
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}

