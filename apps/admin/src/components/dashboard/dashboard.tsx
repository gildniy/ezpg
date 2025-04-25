"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  AlertTriangle,
  Bell,
  Info,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@ezpg/ui";
import { Button } from "@ezpg/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@ezpg/ui";
import { DatePicker } from "@ezpg/ui";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import {
  DashboardCustomizeModal,
  type DashboardCustomization,
  type WidgetType,
} from "./dashboard-customize-modal";
import { useToast, Badge } from "@ezpg/ui";

// 차트 데이터
const transactionData = [
  { name: "1월", deposits: 4000, withdrawals: 2400 },
  { name: "2월", deposits: 3000, withdrawals: 1398 },
  { name: "3월", deposits: 2000, withdrawals: 9800 },
  { name: "4월", deposits: 2780, withdrawals: 3908 },
  { name: "5월", deposits: 1890, withdrawals: 4800 },
  { name: "6월", deposits: 2390, withdrawals: 3800 },
  { name: "7월", deposits: 3490, withdrawals: 4300 },
  { name: "8월", deposits: 4000, withdrawals: 2400 },
  { name: "9월", deposits: 3000, withdrawals: 1398 },
  { name: "10월", deposits: 2000, withdrawals: 9800 },
  { name: "11월", deposits: 2780, withdrawals: 3908 },
  { name: "12월", deposits: 1890, withdrawals: 4800 },
];

const hourlyData = [
  { hour: "00", transactions: 120 },
  { hour: "02", transactions: 80 },
  { hour: "04", transactions: 40 },
  { hour: "06", transactions: 30 },
  { hour: "08", transactions: 150 },
  { hour: "10", transactions: 230 },
  { hour: "12", transactions: 280 },
  { hour: "14", transactions: 320 },
  { hour: "16", transactions: 350 },
  { hour: "18", transactions: 410 },
  { hour: "20", transactions: 390 },
  { hour: "22", transactions: 250 },
];

const pieData = [
  { name: "Sticpay", value: 400 },
  { name: "Atglobal", value: 300 },
  { name: "Siliconsilk", value: 300 },
  { name: "Test03", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const recentTransactions = [
  {
    id: 1,
    merchant: "Sticpay",
    type: "deposit",
    amount: "1,200,000원",
    time: "10분 전",
    status: "completed",
  },
  {
    id: 2,
    merchant: "Atglobal",
    type: "withdrawal",
    amount: "800,000원",
    time: "25분 전",
    status: "pending",
  },
  {
    id: 3,
    merchant: "Siliconsilk",
    type: "deposit",
    amount: "2,500,000원",
    time: "1시간 전",
    status: "completed",
  },
  {
    id: 4,
    merchant: "Test03",
    type: "withdrawal",
    amount: "1,500,000원",
    time: "2시간 전",
    status: "failed",
  },
];

// 알림과 공지사항 데이터 분리
const alerts = [
  {
    id: 1,
    type: "warning",
    message: "Sticpay 가맹점에서 비정상적인 출금 요청이 감지되었습니다.",
    time: "15분 전",
  },
  {
    id: 2,
    type: "error",
    message: "API 서버 연결 오류가 발생했습니다. 기술팀이 조치 중입니다.",
    time: "3시간 전",
  },
];

const notices = [
  {
    id: 1,
    type: "info",
    message: "시스템 점검이 오늘 밤 02:00에 예정되어 있습니다.",
    time: "1시간 전",
  },
  {
    id: 2,
    type: "info",
    message: "새로운 가맹점 등록 정책이 다음 주부터 적용됩니다.",
    time: "2시간 전",
  },
];

const adminActivities = [
  {
    id: 1,
    admin: "admin1",
    action: "가맹점 'newshop' 등록",
    time: "30분 전",
  },
  {
    id: 2,
    admin: "admin2",
    action: "출금 요청 #12345 승인",
    time: "1시간 전",
  },
  {
    id: 3,
    admin: "admin1",
    action: "시스템 설정 변경",
    time: "2시간 전",
  },
];

// 기본 위젯 목록 (공지사항 위젯 추가)
const defaultWidgets: WidgetType[] = [
  { id: "stats", name: "통계 카드", visible: true, order: 1 },
  { id: "transactions", name: "거래 추이 차트", visible: true, order: 2 },
  { id: "hourlyStats", name: "시간대별 통계", visible: true, order: 3 },
  { id: "recentTransactions", name: "최근 거래 내역", visible: true, order: 4 },
  { id: "alerts", name: "알림", visible: true, order: 5 },
  { id: "notices", name: "공지사항", visible: true, order: 6 },
  { id: "adminActivities", name: "관리자 활동", visible: false, order: 7 },
];

// 기본 커스터마이징 설정
const defaultCustomization: DashboardCustomization = {
  widgets: defaultWidgets,
  colorScheme: "default",
  refreshInterval: 0,
  compactMode: true,
};

export function Dashboard() {
  const { toast } = useToast();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customization, setCustomization] =
    useState<DashboardCustomization>(defaultCustomization);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // 로컬 스토리지에서 커스터마이징 설정 불러오기
  useEffect(() => {
    const savedCustomization = localStorage.getItem("dashboardCustomization");
    if (savedCustomization) {
      try {
        setCustomization(JSON.parse(savedCustomization));
      } catch (error) {
        console.error("Failed to parse dashboard customization:", error);
      }
    }
  }, []);

  // 자동 새로고침 설정
  useEffect(() => {
    if (customization.refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshDashboard();
      }, customization.refreshInterval * 1000);
      setRefreshTimer(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
    }
  }, [customization.refreshInterval]);

  const saveCustomization = (newCustomization: DashboardCustomization) => {
    setCustomization(newCustomization);
    localStorage.setItem(
      "dashboardCustomization",
      JSON.stringify(newCustomization),
    );
    toast({
      title: "설정이 저장되었습니다",
      description: "대시보드 커스터마이징이 적용되었습니다.",
    });
  };

  const refreshDashboard = () => {
    setLastRefreshed(new Date());
    toast({
      title: "새로고침 완료",
      description: "대시보드 데이터가 업데이트되었습니다.",
    });
  };

  const getColorSchemeStyles = () => {
    switch (customization.colorScheme) {
      case "blue":
        return "bg-blue-50 dark:bg-blue-950";
      case "green":
        return "bg-green-50 dark:bg-green-950";
      case "purple":
        return "bg-purple-50 dark:bg-purple-950";
      default:
        return "";
    }
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "stats":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 입금액</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,200,000{"원"}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 출금액</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">800,000{"원"}</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 거래량</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold mt-1">1.2{"원"}</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 회원</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "transactions":
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{"거래 추이"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name={"입금"}
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawals"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name={"출금"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "hourlyStats":
        return (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>시간대별 거래량</CardTitle>
              <Tabs defaultValue="day" className="w-auto">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="day">{"일"}</TabsTrigger>
                  <TabsTrigger value="week">{"주"}</TabsTrigger>
                  <TabsTrigger value="month">{"월"}</TabsTrigger>
                  <TabsTrigger value="year">{"년"}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsBarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case "recentTransactions":
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>최근 거래 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          transaction.type === "deposit"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{transaction.merchant}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{transaction.amount}</p>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {transaction.status === "completed"
                          ? "완료"
                          : transaction.status === "pending"
                            ? "대기"
                            : "실패"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "alerts":
        return (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle>알림</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === "warning"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                        : "border-red-500 bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "notices":
        return (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <CardTitle>공지사항</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950"
                  >
                    <p className="text-sm font-medium">{notice.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notice.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "adminActivities":
        return (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center space-x-2">
              <Info className="h-5 w-5 text-green-500" />
              <CardTitle>관리자 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminActivities.map((activity) => (
                  <div key={activity.id} className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.admin}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderWidgetGroups = () => {
    const visibleWidgets = customization.widgets
      .filter((widget) => widget.visible)
      .sort((a, b) => a.order - b.order);

    if (customization.compactMode) {
      // 컴팩트 모드: 통계 카드는 별도로, 나머지는 2열로 배치
      const statsWidget = visibleWidgets.find((w) => w.id === "stats");
      const otherWidgets = visibleWidgets.filter((w) => w.id !== "stats");

      // 2개씩 그룹화
      const widgetPairs = [];
      for (let i = 0; i < otherWidgets.length; i += 2) {
        widgetPairs.push(otherWidgets.slice(i, i + 2));
      }

      return (
        <div className="space-y-6">
          {statsWidget && <div>{renderWidget(statsWidget.id)}</div>}
          {widgetPairs.map((pair, index) => (
            <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>{renderWidget(pair[0].id)}</div>
              {pair[1] && <div>{renderWidget(pair[1].id)}</div>}
            </div>
          ))}
        </div>
      );
    } else {
      // 일반 모드: 모든 위젯을 세로로 배치
      return (
        <div className="space-y-6">
          {visibleWidgets.map((widget) => (
            <div key={widget.id}>{renderWidget(widget.id)}</div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className={`p-6 ${getColorSchemeStyles()}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{"대시보드"}</h1>
          <p className="text-muted-foreground">{"환영합니다"}, 관리자님</p>
        </div>
        <div className="flex items-center space-x-2">
          <DatePicker defaultValue={new Date()} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizeOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {"커스터마이징"}
          </Button>
        </div>
      </div>

      {renderWidgetGroups()}

      <DashboardCustomizeModal
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        customization={customization}
        onSave={saveCustomization}
      />
    </div>
  );
}
