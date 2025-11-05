import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  login: (id: string, password: string) => boolean;
  signup: (id: string, password: string, nickname: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (id: string, password: string): boolean => {
    // 개발 모드: 아무 아이디/비밀번호나 입력하면 로그인 성공
    if (id && password) {
      // 기존 사용자 정보 확인 (닉네임 가져오기)
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u: any) => u.id === id);

      const userData = {
        id,
        nickname: existingUser?.nickname || id || "테스트 사용자",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }

    // 임시: 로컬 스토리지에서 사용자 정보 확인
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find(
      (u: any) => u.id === id && u.password === password
    );

    if (foundUser) {
      const userData = { id: foundUser.id, nickname: foundUser.nickname };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const signup = (id: string, password: string, nickname: string): boolean => {
    // 임시: 로컬 스토리지에 저장
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // 중복 체크
    if (users.some((u: any) => u.id === id)) {
      return false;
    }

    const newUser = { id, password, nickname };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // 자동 로그인
    const userData = { id, nickname };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
