import { useNavigate } from "react-router-dom";
import { useAuth } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="SceneLog" className="w-18 h-14" />
            </div>
            <nav className="flex gap-6">
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                공연기록
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                리포트
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                탐색
              </button>
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
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          <p className="text-lg">홈 화면입니다.</p>
        </div>
      </main>
    </div>
  );
}
