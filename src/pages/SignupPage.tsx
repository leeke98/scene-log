import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

// 비밀번호 유효성 검사 함수
function validatePassword(password: string): {
  isValid: boolean;
  isLengthValid: boolean;
  isTypeValid: boolean;
} {
  // 8글자 이상 체크
  const isLengthValid = password.length >= 8;

  // 대문자, 소문자, 숫자 중 2개 이상 포함 체크
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const typeCount = [hasUpperCase, hasLowerCase, hasNumber].filter(
    Boolean
  ).length;
  const isTypeValid = typeCount >= 2;

  return {
    isValid: isLengthValid && isTypeValid,
    isLengthValid,
    isTypeValid,
  };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 비밀번호 유효성 검사 결과
  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 중복 제출 방지
    if (isSubmitting) {
      return;
    }

    if (!id || !password || !confirmPassword || !nickname) {
      setError("모든 입력란을 입력해주세요.");
      return;
    }

    // 비밀번호 유효성 검사
    if (!passwordValidation.isValid) {
      setError("비밀번호 요구사항을 만족하지 않습니다.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup(id, password, nickname);
      if (result.success) {
        // 회원가입 완료 메시지 표시
        toast.success("회원가입이 완료되었습니다.");
        // 로그인 페이지로 이동
        navigate("/login");
      } else {
        setError(result.error || "회원가입에 실패했습니다.");
        toast.error(result.error || "회원가입에 실패했습니다.");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      const errorMessage = error?.error || "회원가입 중 오류가 발생했습니다.";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
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
              <div className="text-xs space-y-1">
                <div
                  className={
                    password.length > 0 && !passwordValidation.isLengthValid
                      ? "text-destructive"
                      : "text-gray-500"
                  }
                >
                  • 8글자 이상
                </div>
                <div
                  className={
                    password.length > 0 && !passwordValidation.isTypeValid
                      ? "text-destructive"
                      : "text-gray-500"
                  }
                >
                  • 대문자, 소문자, 숫자 중 2개 이상 포함
                </div>
              </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리 중..." : "회원가입"}
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
