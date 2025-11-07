import { useState } from "react";
import Chart from "react-apexcharts";
import { ChevronRight } from "lucide-react";

export default function OverallAnnualTab() {
  const [posterIndex, setPosterIndex] = useState(0);

  const handlePosterNext = () => {
    setPosterIndex((prev) => (prev + 1) % 10);
  };

  const posters = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    title: `작품 ${i + 1}`,
  }));

  const displayedPosters = posters.slice(posterIndex, posterIndex + 6);
  if (displayedPosters.length < 6) {
    displayedPosters.push(...posters.slice(0, 6 - displayedPosters.length));
  }

  // 월별 관람수 막대 그래프 데이터
  const monthlyViewCountOptions = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
    },
    xaxis: {
      categories: [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ],
    },
    yaxis: {
      title: { text: "관람수" },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#3b82f6"],
  };

  const monthlyViewCountSeries = [
    {
      name: "관람수",
      data: [5, 8, 12, 6, 10, 15, 9, 11, 7, 13, 8, 6],
    },
  ];

  // 월별 관람 금액 막대 차트 데이터
  const monthlyAmountOptions = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
    },
    xaxis: {
      categories: [
        "1월",
        "2월",
        "3월",
        "4월",
        "5월",
        "6월",
        "7월",
        "8월",
        "9월",
        "10월",
        "11월",
        "12월",
      ],
    },
    yaxis: {
      title: { text: "금액 (원)" },
      labels: {
        formatter: (value: number) => {
          return (value / 10000).toFixed(0) + "만";
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#10b981"],
  };

  const monthlyAmountSeries = [
    {
      name: "관람 금액",
      data: [
        150000, 240000, 360000, 180000, 300000, 450000, 270000, 330000, 210000,
        390000, 240000, 180000,
      ],
    },
  ];

  // 관극 요일 파이 차트 데이터
  const dayOfWeekOptions = {
    chart: {
      type: "pie" as const,
    },
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    legend: {
      position: "bottom" as const,
    },
    colors: [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#ef4444",
      "#06b6d4",
    ],
  };

  const dayOfWeekSeries = [8, 5, 7, 6, 9, 15, 8];

  return (
    <div className="space-y-6">
      {/* 요약과 가장 많이 본 작품 동일 선상 */}
      <div className="grid grid-cols-5 gap-6 items-stretch">
        {/* 요약 섹션 */}
        <div className="col-span-2 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">요약</h2>
          <div className="grid grid-cols-3 grid-rows-2 gap-2 flex-1">
            <div className="bg-gray-200 rounded-lg p-3 flex flex-col justify-center">
              <div className="text-xs text-gray-600 mb-1">총 관람수</div>
              <div className="text-base font-bold text-gray-900">58회</div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 flex flex-col justify-center">
              <div className="text-xs text-gray-600 mb-1">총 관람 작품 수</div>
              <div className="text-base font-bold text-gray-900">26 작품</div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 flex flex-col justify-center">
              <div className="text-xs text-gray-600 mb-1">총 관람 금액</div>
              <div className="text-base font-bold text-gray-900">
                123,456,789원
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 flex flex-col justify-center">
              <div className="text-xs text-gray-600 mb-1">총 MD 금액</div>
              <div className="text-base font-bold text-gray-900">234,567원</div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 flex flex-col justify-center">
              <div className="text-xs text-gray-600 mb-1">
                가장 자주 본 배우
              </div>
              <div className="text-base font-bold text-gray-900">
                아무개 / 17회
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-3 flex flex-col justify-center">
              <div className="text-xs text-gray-600 mb-1">
                가장 자주 간 극장
              </div>
              <div className="text-base font-bold text-gray-900">
                블루스퀘어 | 17회
              </div>
            </div>
          </div>
        </div>

        {/* 가장 많이 본 작품 섹션 */}
        <div className="col-span-3">
          <h2 className="text-lg font-semibold mb-3">가장 많이 본 작품</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-3 flex-1 overflow-hidden">
              {displayedPosters.map((poster) => (
                <div
                  key={poster.id}
                  className="bg-gray-200 rounded-lg aspect-[3/4] w-32 flex-shrink-0 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-xs">포스터</span>
                </div>
              ))}
            </div>
            <button
              onClick={handlePosterNext}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">차트</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              월 별 관람수
            </h3>
            <Chart
              options={monthlyViewCountOptions}
              series={monthlyViewCountSeries}
              type="bar"
              height={240}
            />
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              월 별 관람 금액
            </h3>
            <Chart
              options={monthlyAmountOptions}
              series={monthlyAmountSeries}
              type="bar"
              height={240}
            />
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              관극 요일
            </h3>
            <Chart
              options={dayOfWeekOptions}
              series={dayOfWeekSeries}
              type="pie"
              height={240}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
