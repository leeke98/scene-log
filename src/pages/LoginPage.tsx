import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!id || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    if (login(id, password)) {
      navigate("/");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md bg-gray-50">
        <CardHeader className="text-center pb-6">
          <div className="flex flex-col items-center gap-4">
            <img src={logo} alt="SceneLog" className="w-32 h-26" />
            {/* <h1 className="text-2xl font-semibold text-gray-900">SceneLog</h1> */}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <CardTitle className="mb-6 text-left">로그인</CardTitle>

            <div className="space-y-2">
              <Label htmlFor="id">아이디</Label>
              <Input
                id="id"
                type="text"
                placeholder="아이디"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              Login
            </Button>

            <div className="text-center">
              <Link
                to="/signup"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                회원가입
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
