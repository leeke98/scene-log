import Layout from "@/components/Layout";

export default function ReportPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">리포트</h1>
        <div className="space-y-6">
          {/* 탭 영역 */}
          <div className="border-b">
            <nav className="flex gap-4">
              <button className="px-4 py-2 border-b-2 border-primary font-medium">
                전체
              </button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                배우
              </button>
              <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
                극
              </button>
            </nav>
          </div>

          {/* 필터 영역 */}
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              연도
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
              누적
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
              월별
            </button>
          </div>

          {/* 리포트 콘텐츠 영역 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-500">리포트 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
