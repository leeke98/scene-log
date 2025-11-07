import { useMemo } from "react";

interface GrassFieldProps {
  data: Array<{ date: string; count: number }>; // YYYY-MM-DD 형식, 관람 수
}

export default function GrassField({ data }: GrassFieldProps) {
  // 5년치 데이터 생성 (가짜 데이터)
  const grassData = useMemo(() => {
    const today = new Date();
    const fiveYearsAgo = new Date(today);
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    const days: Array<{ date: string; count: number }> = [];

    // 5년치 날짜 생성
    for (
      let date = new Date(fiveYearsAgo);
      date <= today;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split("T")[0];
      const existingData = data.find((d) => d.date === dateStr);
      days.push({
        date: dateStr,
        count: existingData?.count || 0,
      });
    }

    return days;
  }, [data]);

  // 색상 레벨 계산 (0-4 레벨)
  const getColorLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  // 색상 반환 (초록 계열)
  const getColor = (level: number): string => {
    const colors = [
      "#ebedf0", // 레벨 0: 없음 (흰색)
      "#9be9a8", // 레벨 1: 1-2회 (연한 초록)
      "#40c463", // 레벨 2: 3-5회 (초록)
      "#30a14e", // 레벨 3: 6-10회 (진한 초록)
      "#216e39", // 레벨 4: 11회 이상 (더 진한 초록)
    ];
    return colors[level] || colors[0];
  };

  // 월별로 그룹화 (5년치 데이터를 월별로 정리)
  const monthlyData = useMemo(() => {
    const months: Array<
      Array<Array<{ date: string; count: number; year: number }>>
    > = [];

    // 5년치 데이터를 연도별, 월별로 정리
    for (let yearOffset = 4; yearOffset >= 0; yearOffset--) {
      const currentYear = new Date().getFullYear() - yearOffset;
      const yearData: Array<
        Array<{ date: string; count: number; year: number }>
      > = [];

      // 각 월별로 데이터 정리
      for (let month = 0; month < 12; month++) {
        const monthDays: Array<{
          date: string;
          count: number;
          year: number;
        }> = [];

        // 해당 월의 모든 일자에 대해 데이터 찾기
        for (let day = 1; day <= 31; day++) {
          const date = new Date(currentYear, month, day);
          // 유효한 날짜인지 확인 (예: 2월 31일은 없음)
          if (date.getMonth() === month && date.getDate() === day) {
            const dateStr = date.toISOString().split("T")[0];
            const dayData = grassData.find((d) => d.date === dateStr);
            monthDays.push({
              date: dateStr,
              count: dayData?.count || 0,
              year: currentYear,
            });
          } else {
            // 유효하지 않은 날짜는 빈 데이터
            monthDays.push({
              date: "",
              count: 0,
              year: currentYear,
            });
          }
        }

        yearData.push(monthDays);
      }

      months.push(yearData);
    }

    return months;
  }, [grassData]);

  // 연도별 총 관람 횟수 계산
  const yearlyTotals = useMemo(() => {
    const totals: { [year: number]: number } = {};
    const currentYear = new Date().getFullYear();

    for (let yearOffset = 4; yearOffset >= 0; yearOffset--) {
      const year = currentYear - yearOffset;
      totals[year] = grassData
        .filter((d) => {
          const date = new Date(d.date);
          return date.getFullYear() === year;
        })
        .reduce((sum, d) => sum + d.count, 0);
    }

    return totals;
  }, [grassData]);

  // 최대 관람 횟수 (막대 그래프 스케일링용)
  const maxCount = useMemo(() => {
    return Math.max(...Object.values(yearlyTotals), 1);
  }, [yearlyTotals]);

  // 월 약어
  const monthLabels = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // 그리드 데이터 준비: 12개 행(월) × 31개 컬럼(일)
  const gridData = useMemo(() => {
    const grid: Array<Array<{ count: number; date: string }>> = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthRow: Array<{ count: number; date: string }> = [];

      for (let day = 1; day <= 31; day++) {
        // 5년치 데이터 중에서 해당 월/일의 데이터 합산
        let cellCount = 0;
        let cellDate = "";

        for (const yearData of monthlyData) {
          const monthData = yearData[monthIndex];
          if (monthData && monthData[day - 1]) {
            const dayData = monthData[day - 1];
            if (dayData.date && dayData.count > 0) {
              cellCount += dayData.count;
              if (!cellDate) cellDate = dayData.date;
            }
          }
        }

        monthRow.push({
          count: cellCount,
          date: cellDate,
        });
      }

      grid.push(monthRow);
    }

    return grid;
  }, [monthlyData]);

  return (
    <div className="w-full space-y-4">
      {/* 연도별 막대 그래프 */}
      {/* <div className="space-y-2">
        {Object.entries(yearlyTotals)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([year, total]) => (
            <div key={year} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-12">
                {year}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-green-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(total / maxCount) * 100}%` }}
                >
                  {total > 0 && (
                    <span className="text-xs text-white font-medium">
                      {total}회
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div> */}

      {/* 잔디밭 그리드 - 날짜 가로, 월 세로 */}
      <div className="w-full overflow-x-auto">
        <div className="inline-block">
          {/* 일 레이블 (상단) */}
          <div className="flex mb-1">
            <div className="w-10 text-right pr-2 flex-shrink-0"></div>{" "}
            {/* 월 레이블 공간 */}
            <div className="flex" style={{ gap: "2px" }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className="text-xs text-gray-600 text-center flex-shrink-0"
                  style={{ width: "20px" }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* 그리드 */}
          <div className="flex flex-col" style={{ gap: "2px" }}>
            {monthLabels.map((month, monthIndex) => (
              <div key={month} className="flex items-center">
                {/* 월 레이블 (좌측) */}
                <div className="w-10 text-xs text-gray-600 text-right pr-2 flex-shrink-0">
                  {month}
                </div>

                {/* 잔디밭 셀들 (가로) */}
                <div className="flex" style={{ gap: "2px" }}>
                  {gridData[monthIndex].map((cell, dayIndex) => {
                    const level = getColorLevel(cell.count);
                    const color = getColor(level);

                    return (
                      <div
                        key={dayIndex}
                        className="rounded-sm cursor-pointer hover:ring-2 hover:ring-green-400 transition-all flex-shrink-0"
                        style={{
                          backgroundColor: color,
                          width: "20px",
                          height: "20px",
                        }}
                        title={
                          cell.date
                            ? `${new Date(cell.date).toLocaleDateString(
                                "ko-KR"
                              )}: ${cell.count}회`
                            : ""
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColor(level) }}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">More</span>
      </div>
    </div>
  );
}
