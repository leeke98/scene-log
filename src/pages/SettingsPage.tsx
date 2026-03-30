import { useState } from "react";
import { useAuth, useUpdateProfile, useUpdatePassword } from "@/queries/auth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApiError } from "@/lib/apiClient";

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
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "변경 중..." : "닉네임 변경"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={updatePassword.isPending}>
            {updatePassword.isPending ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isLocalUser = user?.provider === "local";

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 space-y-6">
        <h1 className="text-2xl font-bold">설정</h1>

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

        <NicknameSection />

        {isLocalUser && <PasswordSection />}
      </div>
    </Layout>
  );
}
