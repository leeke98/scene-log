import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { LogOut, Sun, Moon, Settings } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import faviconBlack from "@/assets/favicon_black.png";
import faviconWhite from "@/assets/favicon_white.png";

export default function MobileHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUiStore();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b bg-background flex items-center justify-between px-4">
        <Link to="/">
          <img src={faviconBlack} alt="SceneLog" className="h-8 dark:hidden" />
          <img src={faviconWhite} alt="SceneLog" className="h-8 hidden dark:block" />
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">{user?.nickname}님</span>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} title="설정" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === "light" ? "다크 모드" : "라이트 모드"} className="text-muted-foreground hover:text-foreground">
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLogoutDialogOpen(true)} title="로그아웃" className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>로그아웃</DialogTitle>
            <DialogDescription>로그아웃 하시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-center gap-4 sm:justify-between sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleLogoutConfirm}>로그아웃</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
