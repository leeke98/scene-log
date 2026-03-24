import { Card, CardContent } from "@/components/ui/card";
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

const cardItems = [
  {
    key: "totalViewCount" as const,
    label: "총 관람수",
    icon: Eye,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    formatValue: (v: number | string) => `${v}회`,
  },
  {
    key: "totalPerformanceCount" as const,
    label: "총 관람 작품 수",
    icon: Film,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    formatValue: (v: number | string) => `${v} 작품`,
  },
  {
    key: "totalAmount" as const,
    label: "총 관람 금액",
    icon: DollarSign,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    formatValue: (v: number | string) =>
      new Intl.NumberFormat("ko-KR").format(Number(v)) + "원",
  },
  {
    key: "totalMdAmount" as const,
    label: "총 MD 금액",
    icon: ShoppingBag,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    formatValue: (v: number | string) =>
      new Intl.NumberFormat("ko-KR").format(Number(v)) + "원",
  },
  {
    key: "mostFrequentActor" as const,
    label: "가장 자주 본 배우",
    icon: User,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-50 dark:bg-pink-950/40",
    formatValue: (v: number | string) => String(v),
  },
  {
    key: "mostFrequentTheater" as const,
    label: "가장 자주 간 극장",
    icon: Building2,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
    formatValue: (v: number | string) => String(v),
  },
];

export default function SummaryCards({ data, className }: SummaryCardsProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h2 className="text-base font-semibold tracking-wide">요약</h2>
      </div>
      <div className="grid grid-cols-3 grid-rows-2 gap-3">
        {cardItems.map(({ key, label, icon: Icon, iconColor, iconBg, formatValue }) => (
          <Card key={key} className="shadow-sm border-border rounded-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground leading-tight">{label}</p>
                <div className={`p-1.5 rounded-lg ${iconBg}`}>
                  <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                </div>
              </div>
              <div className="text-base font-bold truncate">
                {formatValue(data[key])}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
