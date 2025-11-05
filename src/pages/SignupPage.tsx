import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!id || !password || !confirmPassword || !nickname) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    if (signup(id, password, nickname)) {
      navigate("/");
    } else {
      setError("이미 존재하는 아이디입니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md bg-gray-50">
        <CardHeader className="text-center pb-6">
          <div className="flex flex-col items-center gap-4">
            <img src={logo} alt="SceneLog" className="w-32 h-26" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardTitle className="mb-6 text-left">회원가입</CardTitle>

            <div className="space-y-2">
              <Label htmlFor="signup-id">아이디</Label>
              <Input
                id="signup-id"
                type="text"
                placeholder="아이디"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">비밀번호</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm">비밀번호 확인</Label>
              <Input
                id="signup-confirm"
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-nickname">닉네임</Label>
              <Input
                id="signup-nickname"
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-white"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900"
            >
              회원가입
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
