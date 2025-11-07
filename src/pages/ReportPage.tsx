import { useState } from "react";
import Layout from "@/components/Layout";
import OverallReport from "@/components/report/OverallReport";
import ActorReport from "@/components/report/ActorReport";
import PerformanceReport from "@/components/report/PerformanceReport";

type TabType = "전체" | "배우" | "극";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<TabType>("전체");

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {/* 서브 네비게이션 - 전체/배우/극 */}
          <div className="border-b">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab("전체")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "전체"
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setActiveTab("배우")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "배우"
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                배우
              </button>
              <button
                onClick={() => setActiveTab("극")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "극"
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                극
              </button>
            </nav>
          </div>

          {/* 탭별 콘텐츠 */}
          {activeTab === "전체" && <OverallReport />}
          {activeTab === "배우" && <ActorReport />}
          {activeTab === "극" && <PerformanceReport />}
        </div>
      </div>
    </Layout>
  );
}
