import Layout from "@/components/Layout";
import OverallReport from "@/components/report/OverallReport";
import ActorReport from "@/components/report/ActorReport";
import PerformanceReport from "@/components/report/PerformanceReport";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ReportPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">리포트</h1>
        <div className="space-y-6">
          {/* 서브 네비게이션 - 전체/배우/극 */}
          <Tabs defaultValue="전체" className="w-full">
            <TabsList className="w-full h-[45px] bg-white border-b border-border rounded-none p-0 justify-start">
              <TabsTrigger
                value="전체"
                className="flex-1 h-full rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-1px_0_0_currentColor,0_1px_0_0_currentColor] data-[state=active]:text-primary hover:text-primary/80"
              >
                전체
              </TabsTrigger>
              <TabsTrigger
                value="배우"
                className="flex-1 h-full rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-1px_0_0_currentColor,0_1px_0_0_currentColor] data-[state=active]:text-primary hover:text-primary/80"
              >
                배우
              </TabsTrigger>
              <TabsTrigger
                value="극"
                className="flex-1 h-full rounded-none border-0 data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-1px_0_0_currentColor,0_1px_0_0_currentColor] data-[state=active]:text-primary hover:text-primary/80"
              >
                극
              </TabsTrigger>
            </TabsList>

            {/* 탭별 콘텐츠 */}
            <TabsContent value="전체" className="mt-6" forceMount>
              <OverallReport />
            </TabsContent>
            <TabsContent value="배우" className="mt-6" forceMount>
              <ActorReport />
            </TabsContent>
            <TabsContent value="극" className="mt-6" forceMount>
              <PerformanceReport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
