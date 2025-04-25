"use client";
import { BarChart, Clock, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@ezpg/ui";
import { Button } from "@ezpg/ui";
import { Card, CardContent } from "@ezpg/ui";
import { useTheme } from "@ezpg/ui";

export function DashboardContent() {
  const { theme } = useTheme();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          대시보드
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          환영합다. 관리자 님.
        </p>
      </div>

      {/* 새로 추가한 둥근 모서리 환영 메시지 */}
      <div className="bg-purple-500 text-white p-4 rounded-lg mb-6">
        <p className="text-sm md:text-base">환영합니다. 관리자 님.</p>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
        <Tabs defaultValue="overview" className="min-w-[480px]">
          <TabsList className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-0 h-auto w-full">
            <TabsTrigger
              value="overview"
              className="px-4 md:px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none text-sm"
            >
              개요
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="px-4 md:px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none text-sm"
            >
              거래
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="px-4 md:px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none text-sm"
            >
              분석
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="px-4 md:px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none text-sm"
            >
              설정
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                총 입금
              </div>
              <div className="text-xl md:text-2xl font-bold mt-1">50건</div>
              <div className="text-xs text-green-500 mt-1">
                <span className="font-medium">+32% 어제 대비</span>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
              <BarChart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                오늘 입금
              </div>
              <div className="text-xl md:text-2xl font-bold mt-1">16건</div>
              <div className="text-xs text-green-500 mt-1">
                <span className="font-medium">실시간 업데이트</span>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                총 금액
              </div>
              <div className="text-xl md:text-2xl font-bold mt-1">
                3,486,240원
              </div>
              <div className="text-xs text-green-500 mt-1">
                <span className="font-medium">+40% 어제 대비</span>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-full">
              <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-lg overflow-hidden">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                오늘 금액
              </div>
              <div className="text-xl md:text-2xl font-bold mt-1">
                1,398,200원
              </div>
              <div className="text-xs text-green-500 mt-1">
                <span className="font-medium">실시간 업데이트</span>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
              <BarChart className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Balance */}
      <div className="bg-blue-500 dark:bg-blue-600 text-white rounded-lg p-4 md:p-5 mb-6">
        <h3 className="text-lg font-medium mb-4">현재 잔액</h3>
        <div className="text-2xl md:text-3xl font-bold mb-2">1,000,000원</div>
        <div className="text-xs md:text-sm">
          마지막 업데이트: 2025. 3. 15. 오후 11:15:26
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto dark:hover:bg-gray-200">
            입금 요청
          </Button>
          <Button className="bg-transparent border border-white hover:bg-blue-600 w-full sm:w-auto">
            내역 보기
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gradient-to-r from-teal-400 to-blue-500 dark:from-teal-500 dark:to-blue-600 text-white rounded-lg p-4 md:p-5">
        <h3 className="text-lg font-medium mb-4">사용자 정보</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <div className="text-sm opacity-80">이름</div>
            <div className="font-medium">관리자</div>
          </div>
          <div>
            <div className="text-sm opacity-80">아이디</div>
            <div className="font-medium">admin</div>
          </div>
          <div>
            <div className="text-sm opacity-80">역할</div>
            <div className="px-2 py-1 bg-white/20 rounded-full text-xs inline-block">
              관리자
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm opacity-80">마지막 로그인</div>
          <div className="font-medium">2025. 03. 13. 00:29:01</div>
        </div>
      </div>
    </div>
  );
}
