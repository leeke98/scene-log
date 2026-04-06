import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUpdateProfile, useUpdatePassword } from "@/queries/auth";
import { useMarks, useRemoveMark } from "@/queries/marks";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { type ApiError } from "@/lib/apiClient";
import { Heart, Ticket, Trash2, LogOut, MapPin, Calendar } from "lucide-react";


// ─── 계정 정보 ───────────────────────────────────────────────

function AccountInfoSection() {
  const { user } = useAuth();
  const isLocalUser = user?.provider === "local";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">계정 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">아이디</span>
          <span>{user?.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">로그인 방식</span>
          <span>{isLocalUser ? "일반" : "Google"}</span>
        </div>
        {user?.createdAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">가입일</span>
            <span>{new Date(user.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── 닉네임 변경 ─────────────────────────────────────────────

function NicknameSection() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (nickname.trim().length < 2 || nickname.trim().length > 20) {
      setError("닉네임은 2자 이상 20자 이하로 입력해주세요.");
      return;
    }

    try {
      await updateProfile.mutateAsync({ nickname: nickname.trim() });
    } catch (err: unknown) {
      setError((err as ApiError)?.error || "닉네임 변경에 실패했습니다.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">닉네임 변경</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="새 닉네임"
              maxLength={20}
              className="bg-background"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "변경 중..." : "닉네임 변경"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── 비밀번호 변경 ────────────────────────────────────────────

function PasswordSection() {
  const updatePassword = useUpdatePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    if (newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await updatePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError((err as ApiError)?.error || "비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">비밀번호 변경</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
              className="bg-background"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={updatePassword.isPending}>
            {updatePassword.isPending ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── 위시리스트 ───────────────────────────────────────────────

function WishlistSection() {
  const navigate = useNavigate();
  const { data: marks = [], isLoading } = useMarks();
  const removeMark = useRemoveMark();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-4 h-4" />
            위시리스트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="w-4 h-4" />
          위시리스트
          {marks.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({marks.length}개)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {marks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            저장한 공연이 없어요.
            <br />
            탐색 페이지에서 마음에 드는 공연을 저장해보세요.
          </p>
        ) : (
          <ul className="space-y-3">
            {marks.map((mark) => (
              <li
                key={mark.kopisId}
                className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30"
              >
                {/* 포스터 썸네일 */}
                <div className="w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {mark.posterUrl ? (
                    <img
                      src={mark.posterUrl}
                      alt={mark.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-600" />
                  )}
                </div>

                {/* 공연명 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug line-clamp-2">
                    {mark.title}
                  </p>
                  {(mark.startDate || mark.endDate) && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      {mark.startDate} ~ {mark.endDate}
                    </p>
                  )}
                  {mark.venue && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{mark.venue}</span>
                    </p>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => {
                      const params = new URLSearchParams({
                        kopisId: mark.kopisId,
                        performanceName: mark.title,
                        ...(mark.posterUrl ? { posterUrl: mark.posterUrl } : {}),
                        ...(mark.venue ? { theater: mark.venue } : {}),
                      });
                      navigate(`/tickets/new?${params.toString()}`);
                    }}
                  >
                    <Ticket className="w-3 h-3" />
                    기록 추가
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive"
                    disabled={removeMark.isPending}
                    onClick={() => removeMark.mutate(mark.kopisId)}
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ─── MyPage ──────────────────────────────────────────────────

export default function MyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isLocalUser = user?.provider === "local";
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 space-y-8 pb-8">
        <h1 className="text-2xl font-bold">마이페이지</h1>

        {/* ── 계정 관리 섹션 ── */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
            계정 관리
          </h2>
          <AccountInfoSection />
          <NicknameSection />
          {isLocalUser && <PasswordSection />}

          <Button
            variant="outline"
            className="w-full gap-2 text-muted-foreground"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </section>

        {/* ── 위시리스트 섹션 ── */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
            공연
          </h2>
          <WishlistSection />
        </section>
      </div>

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
            <Button variant="destructive" onClick={handleLogoutConfirm}>
              로그아웃
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
