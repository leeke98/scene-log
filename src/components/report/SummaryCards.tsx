import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Film,
  DollarSign,
  ShoppingBag,
  User,
  Building2,
} from "lucide-react";

interface SummaryData {
  totalViewCount: number;
  totalPerformanceCount: number;
  totalAmount: number;
  totalMdAmount: number;
  mostFrequentActor: string;
  mostFrequentTheater: string;
}

interface SummaryCardsProps {
  data: SummaryData;
  className?: string;
}

export default function SummaryCards({ data, className }: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
  };

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">요약</h2>
      <div className="grid grid-cols-3 grid-rows-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">총 관람수</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold">{data.totalViewCount}회</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">
              총 관람 작품 수
            </CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold">
              {data.totalPerformanceCount} 작품
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">총 관람 금액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold">
              {formatCurrency(data.totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">총 MD 금액</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold">
              {formatCurrency(data.totalMdAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">
              가장 자주 본 배우
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold">{data.mostFrequentActor}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">
              가장 자주 간 극장
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold">
              {data.mostFrequentTheater}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
