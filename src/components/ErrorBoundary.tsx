import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">
            오류가 발생했습니다
          </h1>
          <p className="text-gray-500 text-sm">
            예기치 못한 문제가 생겼어요. 페이지를 새로고침하거나 홈으로
            돌아가주세요.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 p-4 bg-gray-100 rounded-md text-left text-xs text-red-600 max-w-xl overflow-auto">
              {error.message}
            </pre>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
          <Button
            onClick={() => {
              this.handleReset();
              window.location.href = "/";
            }}
          >
            홈으로
          </Button>
        </div>
      </div>
    );
  }
}
