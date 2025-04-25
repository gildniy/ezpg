"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Users,
  CreditCard,
  Wallet,
  Settings,
  AlertTriangle,
  Bell,
  Info,
  FileText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@ezpg/ui";
import { Button } from "@ezpg/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@ezpg/ui";
import { useLanguage } from "@ezpg/hooks";
import { DatePicker } from "@ezpg/ui";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import {
  DashboardCustomizeModal,
  type DashboardCustomization,
  type WidgetType,
} from "./dashboard-customize-modal";
import { useToast } from "@ezpg/ui";
import { useNavigation } from "@/contexts/navigation-context";

// 그룹별 차트 데이터
const transactionDataByGroup = {
  all: [
    { name: "1", deposits: 4000, withdrawals: 2400 },
    { name: "2", deposits: 3000, withdrawals: 1398 },
    { name: "3", deposits: 2000, withdrawals: 9800 },
    { name: "4", deposits: 2780, withdrawals: 3908 },
    { name: "5", deposits: 1890, withdrawals: 4800 },
    { name: "6", deposits: 2390, withdrawals: 3800 },
    { name: "7", deposits: 3490, withdrawals: 4300 },
    { name: "8", deposits: 4000, withdrawals: 2400 },
    { name: "9", deposits: 3000, withdrawals: 1398 },
    { name: "10", deposits: 2000, withdrawals: 9800 },
    { name: "11", deposits: 2780, withdrawals: 3908 },
    { name: "12", deposits: 1890, withdrawals: 4800 },
  ],
  reseller: [
    { name: "1", deposits: 2500, withdrawals: 1200 },
    { name: "2", deposits: 1800, withdrawals: 900 },
    { name: "3", deposits: 1200, withdrawals: 5000 },
    { name: "4", deposits: 1500, withdrawals: 2000 },
    { name: "5", deposits: 1000, withdrawals: 2500 },
    { name: "6", deposits: 1200, withdrawals: 1900 },
    { name: "7", deposits: 2000, withdrawals: 2200 },
    { name: "8", deposits: 2500, withdrawals: 1200 },
    { name: "9", deposits: 1800, withdrawals: 900 },
    { name: "10", deposits: 1200, withdrawals: 5000 },
    { name: "11", deposits: 1500, withdrawals: 2000 },
    { name: "12", deposits: 1000, withdrawals: 2500 },
  ],
  shinhan: [
    { name: "1", deposits: 1000, withdrawals: 800 },
    { name: "2", deposits: 800, withdrawals: 300 },
    { name: "3", deposits: 500, withdrawals: 3000 },
    { name: "4", deposits: 800, withdrawals: 1200 },
    { name: "5", deposits: 600, withdrawals: 1500 },
    { name: "6", deposits: 700, withdrawals: 1200 },
    { name: "7", deposits: 900, withdrawals: 1300 },
    { name: "8", deposits: 1000, withdrawals: 800 },
    { name: "9", deposits: 800, withdrawals: 300 },
    { name: "10", deposits: 500, withdrawals: 3000 },
    { name: "11", deposits: 800, withdrawals: 1200 },
    { name: "12", deposits: 600, withdrawals: 1500 },
  ],
  jeju: [
    { name: "1", deposits: 500, withdrawals: 400 },
    { name: "2", deposits: 400, withdrawals: 200 },
    { name: "3", deposits: 300, withdrawals: 1800 },
    { name: "4", deposits: 480, withdrawals: 700 },
    { name: "5", deposits: 290, withdrawals: 800 },
    { name: "6", deposits: 490, withdrawals: 700 },
    { name: "7", deposits: 590, withdrawals: 800 },
    { name: "8", deposits: 500, withdrawals: 400 },
    { name: "9", deposits: 400, withdrawals: 200 },
    { name: "10", deposits: 300, withdrawals: 1800 },
    { name: "11", deposits: 480, withdrawals: 700 },
    { name: "12", deposits: 290, withdrawals: 800 },
  ],
};

// 그룹별 시간대별 데이터
const hourlyDataByGroup = {
  all: [
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
  ],
  reseller: [
    { hour: "00", transactions: 80 },
    { hour: "02", transactions: 50 },
    { hour: "04", transactions: 25 },
    { hour: "06", transactions: 20 },
    { hour: "08", transactions: 100 },
    { hour: "10", transactions: 150 },
    { hour: "12", transactions: 180 },
    { hour: "14", transactions: 200 },
    { hour: "16", transactions: 220 },
    { hour: "18", transactions: 250 },
    { hour: "20", transactions: 230 },
    { hour: "22", transactions: 150 },
  ],
  shinhan: [
    { hour: "00", transactions: 30 },
    { hour: "02", transactions: 20 },
    { hour: "04", transactions: 10 },
    { hour: "06", transactions: 5 },
    { hour: "08", transactions: 35 },
    { hour: "10", transactions: 60 },
    { hour: "12", transactions: 70 },
    { hour: "14", transactions: 80 },
    { hour: "16", transactions: 90 },
    { hour: "18", transactions: 100 },
    { hour: "20", transactions: 95 },
    { hour: "22", transactions: 65 },
  ],
  jeju: [
    { hour: "00", transactions: 10 },
    { hour: "02", transactions: 10 },
    { hour: "04", transactions: 5 },
    { hour: "06", transactions: 5 },
    { hour: "08", transactions: 15 },
    { hour: "10", transactions: 20 },
    { hour: "12", transactions: 30 },
    { hour: "14", transactions: 40 },
    { hour: "16", transactions: 40 },
    { hour: "18", transactions: 60 },
    { hour: "20", transactions: 65 },
    { hour: "22", transactions: 35 },
  ],
};

// 그룹별 파이 트 데이터
const pieDataByGroup = {
  all: [
    { name: "Sticpay", value: 400 },
    { name: "Atglobal", value: 300 },
    { name: "Siliconsilk", value: 300 },
    { name: "Test03", value: 200 },
  ],
  reseller: [
    { name: "Sticpay", value: 250 },
    { name: "Atglobal", value: 200 },
    { name: "Siliconsilk", value: 150 },
    { name: "Test03", value: 100 },
  ],
  shinhan: [
    { name: "신협 가맹점1", value: 100 },
    { name: "신협 가맹점2", value: 80 },
    { name: "신협 가맹점3", value: 120 },
    { name: "신협 가맹점4", value: 50 },
  ],
  jeju: [
    { name: "제주 가맹점1", value: 50 },
    { name: "제주 가맹점2", value: 20 },
    { name: "제주 가맹점3", value: 30 },
    { name: "제주 가맹점4", value: 50 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// 그룹별 최근 거래 내역
const recentTransactionsByGroup = {
  all: [
    {
      id: 1,
      merchant: "Sticpay",
      type: "deposit",
      amount: "1,200,000원",
      time: "10분 전",
      timeEn: "10 mins ago",
      status: "completed",
    },
    {
      id: 2,
      merchant: "Atglobal",
      type: "withdrawal",
      amount: "800,000원",
      time: "25분 전",
      timeEn: "25 mins ago",
      status: "pending",
    },
    {
      id: 3,
      merchant: "Siliconsilk",
      type: "deposit",
      amount: "2,500,000원",
      time: "1시간 전",
      timeEn: "1 hour ago",
      status: "completed",
    },
    {
      id: 4,
      merchant: "Test03",
      type: "withdrawal",
      amount: "1,500,000원",
      time: "2시간 전",
      timeEn: "2 hours ago",
      status: "failed",
    },
  ],
  reseller: [
    {
      id: 1,
      merchant: "Sticpay",
      type: "deposit",
      amount: "800,000원",
      time: "15분 전",
      timeEn: "15 mins ago",
      status: "completed",
    },
    {
      id: 2,
      merchant: "Atglobal",
      type: "withdrawal",
      amount: "500,000원",
      time: "30분 전",
      timeEn: "30 mins ago",
      status: "pending",
    },
    {
      id: 3,
      merchant: "Siliconsilk",
      type: "deposit",
      amount: "1,500,000원",
      time: "1시간 30분 전",
      timeEn: "1 hour 30 mins ago",
      status: "completed",
    },
  ],
  shinhan: [
    {
      id: 1,
      merchant: "신협 가맹점1",
      merchantEn: "Shinhan Merchant 1",
      type: "deposit",
      amount: "300,000원",
      time: "20분 전",
      timeEn: "20 mins ago",
      status: "completed",
    },
    {
      id: 2,
      merchant: "신협 가맹점2",
      merchantEn: "Shinhan Merchant 2",
      type: "withdrawal",
      amount: "200,000원",
      time: "40분 전",
      timeEn: "40 mins ago",
      status: "pending",
    },
    {
      id: 3,
      merchant: "신협 가맹점3",
      merchantEn: "Shinhan Merchant 3",
      type: "deposit",
      amount: "450,000원",
      time: "1시간 10분 전",
      timeEn: "1 hour 10 mins ago",
      status: "completed",
    },
  ],
  jeju: [
    {
      id: 1,
      merchant: "제주 가맹점1",
      merchantEn: "Jeju Merchant 1",
      type: "deposit",
      amount: "100,000원",
      time: "25분 전",
      timeEn: "25 mins ago",
      status: "completed",
    },
    {
      id: 2,
      merchant: "제주 가맹점2",
      merchantEn: "Jeju Merchant 2",
      type: "withdrawal",
      amount: "100,000원",
      time: "50분 전",
      timeEn: "50 mins ago",
      status: "failed",
    },
    {
      id: 3,
      merchant: "제주 가맹점3",
      merchantEn: "Jeju Merchant 3",
      type: "deposit",
      amount: "150,000원",
      time: "1시간 20분 전",
      timeEn: "1 hour 20 mins ago",
      status: "completed",
    },
  ],
};

// 그룹별 알림 데이터
const alertsByGroup = {
  all: [
    {
      id: 1,
      type: "warning",
      message: "Sticpay 가맹점에서 비정상적인 출금 요청이 감지되었습니다.",
      messageEn: "Abnormal withdrawal request detected from Sticpay merchant.",
      time: "15분 전",
      timeEn: "15 mins ago",
    },
    {
      id: 2,
      type: "error",
      message: "API 서버 연결 오류가 발생했습니다. 기술팀이 조치 중입니다.",
      messageEn:
        "API server connection error occurred. Technical team is working on it.",
      time: "3시간 전",
      timeEn: "3 hours ago",
    },
  ],
  reseller: [
    {
      id: 1,
      type: "warning",
      message: "Sticpay 가맹점에서 비정상적인 출금 요청이 감지되었습니다.",
      messageEn: "Abnormal withdrawal request detected from Sticpay merchant.",
      time: "15분 전",
      timeEn: "15 mins ago",
    },
    {
      id: 2,
      type: "error",
      message: "테라시스 API 연동 오류가 발생했습니다. 기술팀이 조치 중입니다.",
      messageEn:
        "Terasis API integration error occurred. Technical team is working on it.",
      time: "2시간 전",
      timeEn: "2 hours ago",
    },
  ],
  shinhan: [
    {
      id: 1,
      type: "warning",
      message: "신협 가맹점1에서 비정상적인 출금 요청이 감지되었습니다.",
      messageEn:
        "Abnormal withdrawal request detected from Shinhan Merchant 1.",
      time: "30분 전",
      timeEn: "30 mins ago",
    },
    {
      id: 2,
      type: "error",
      message: "신협은행 API 연동 오류가 발생했습니다. 기술팀이 조치 중입니다.",
      messageEn:
        "Shinhan Bank API integration error occurred. Technical team is working on it.",
      time: "4시간 전",
      timeEn: "4 hours ago",
    },
  ],
  jeju: [
    {
      id: 1,
      type: "warning",
      message: "제주 가맹점2에서 비정상적인 출금 요청이 감지되었습니다.",
      messageEn: "Abnormal withdrawal request detected from Jeju Merchant 2.",
      time: "45분 전",
      timeEn: "45 mins ago",
    },
    {
      id: 2,
      type: "error",
      message: "제주은행 API 연동 오류가 발생했습니다. 기술팀이 조치 중입니다.",
      messageEn:
        "Jeju Bank API integration error occurred. Technical team is working on it.",
      time: "5시간 전",
      timeEn: "5 hours ago",
    },
  ],
};

// 그룹별 공지사항 데이터
const noticesByGroup = {
  all: [
    {
      id: 1,
      type: "info",
      message: "시스템 점검이 오늘 밤 02:00에 예정되어 있습니다.",
      messageEn: "System maintenance is scheduled for tonight at 02:00.",
      time: "1시간 전",
      timeEn: "1 hour ago",
    },
    {
      id: 2,
      type: "info",
      message: "새로운 가맹점 등록 정책이 다음 주부터 적용됩니다.",
      messageEn:
        "New merchant registration policy will be applied from next week.",
      time: "2시간 전",
      timeEn: "2 hours ago",
    },
  ],
  reseller: [
    {
      id: 1,
      type: "info",
      message: "테라시스 시스템 점검이 오늘 밤 03:00에 예정되어 있습니다.",
      messageEn:
        "Terasis system maintenance is scheduled for tonight at 03:00.",
      time: "1시간 30분 전",
      timeEn: "1 hour 30 mins ago",
    },
    {
      id: 2,
      type: "info",
      message: "테라시스 가맹점 수수료 정책이 다음 달부터 변경됩니다.",
      messageEn: "Terasis merchant fee policy will change from next month.",
      time: "3시간 전",
      timeEn: "3 hours ago",
    },
  ],
  shinhan: [
    {
      id: 1,
      type: "info",
      message: "신협은행 시스템 점검이 내일 새벽 01:00에 예정되어 있습니다.",
      messageEn:
        "Shinhan Bank system maintenance is scheduled for tomorrow at 01:00.",
      time: "2시간 전",
      timeEn: "2 hours ago",
    },
    {
      id: 2,
      type: "info",
      message: "신협은행 가맹점 정산 일정이 변경되었습니다.",
      messageEn: "Shinhan Bank merchant settlement schedule has been changed.",
      time: "4시간 전",
      timeEn: "4 hours ago",
    },
  ],
  jeju: [
    {
      id: 1,
      type: "info",
      message: "제주은행 시스템 점검이 내일 새벽 04:00에 예정되어 있습니다.",
      messageEn:
        "Jeju Bank system maintenance is scheduled for tomorrow at 04:00.",
      time: "3시간 전",
      timeEn: "3 hours ago",
    },
    {
      id: 2,
      type: "info",
      message: "제주은행 가맹점 입금 한도가 상향 조정되었습니다.",
      messageEn: "Jeju Bank merchant deposit limit has been increased.",
      time: "5시간 전",
      timeEn: "5 hours ago",
    },
  ],
};

// 그룹별 관리자 활동 데이터
const adminActivitiesByGroup = {
  all: [
    {
      id: 1,
      admin: "admin1",
      action: "가맹점 'newshop' 등록",
      actionEn: "Registered merchant 'newshop'",
      time: "30분 전",
      timeEn: "30 mins ago",
    },
    {
      id: 2,
      admin: "admin2",
      action: "출금 요청 #12345 승인",
      actionEn: "Approved withdrawal request #12345",
      time: "1시간 전",
      timeEn: "1 hour ago",
    },
    {
      id: 3,
      admin: "admin1",
      action: "시스템 설정 변경",
      actionEn: "Changed system settings",
      time: "2시간 전",
      timeEn: "2 hours ago",
    },
  ],
  reseller: [
    {
      id: 1,
      admin: "admin1",
      action: "테라시스 가맹점 'shop1' 등록",
      actionEn: "Registered Terasis merchant 'shop1'",
      time: "45분 전",
      timeEn: "45 mins ago",
    },
    {
      id: 2,
      admin: "admin2",
      action: "테라시스 출금 요청 #10001 승인",
      actionEn: "Approved Terasis withdrawal request #10001",
      time: "1시간 30분 전",
      timeEn: "1 hour 30 mins ago",
    },
  ],
  shinhan: [
    {
      id: 1,
      admin: "admin3",
      action: "신협 가맹점 '신협상점1' 등록",
      actionEn: "Registered Shinhan merchant 'Shinhan Store 1'",
      time: "1시간 전",
      timeEn: "1 hour ago",
    },
    {
      id: 2,
      admin: "admin2",
      action: "신협 출금 요청 #20001 승인",
      actionEn: "Approved Shinhan withdrawal request #20001",
      time: "2시간 전",
      timeEn: "2 hours ago",
    },
  ],
  jeju: [
    {
      id: 1,
      admin: "admin4",
      action: "제주 가맹점 '제주상점1' 등록",
      actionEn: "Registered Jeju merchant 'Jeju Store 1'",
      time: "2시간 전",
      timeEn: "2 hours ago",
    },
    {
      id: 2,
      admin: "admin2",
      action: "제주 출금 요청 #30001 승인",
      actionEn: "Approved Jeju withdrawal request #30001",
      time: "3시간 전",
      timeEn: "3 hours ago",
    },
  ],
};

// 기본 위젯 목록 (공지사항 위젯 추가)
const defaultWidgets: WidgetType[] = [
  { id: "stats", name: "통계 카드", visible: true, order: 1 },
  { id: "transactions", name: "거래 추이 차트", visible: true, order: 2 },
  { id: "hourlyStats", name: "시간대별 통계", visible: true, order: 3 },
  { id: "merchantPerformance", name: "가맹점 성과", visible: true, order: 4 },
  { id: "recentTransactions", name: "최근 거래 내역", visible: true, order: 5 },
  { id: "alerts", name: "알림", visible: true, order: 6 },
  { id: "notices", name: "공지사항", visible: true, order: 7 },
  { id: "adminActivities", name: "관리자 활동", visible: false, order: 8 },
];

// 기본 커스터마이징 설정
const defaultCustomization: DashboardCustomization = {
  widgets: defaultWidgets,
  colorScheme: "default",
  refreshInterval: 0,
  compactMode: true,
};

// 그룹별 데이터
const groupData = {
  all: {
    totalDeposits: 5000000,
    totalWithdrawals: 2800000,
    merchants: 12,
    balance: 1.2,
    withdrawableBalance: 0.8,
    settlementBalance: 0.6,
    title: "전체 대시보드",
    titleEn: "All Dashboard",
  },
  reseller: {
    totalDeposits: 3200000,
    totalWithdrawals: 1800000,
    merchants: 8,
    balance: 0.8,
    withdrawableBalance: 0.5,
    settlementBalance: 0.4,
    title: "재판매(테라시스) 대시보드",
    titleEn: "Reseller (Terasis) Dashboard",
  },
  shinhan: {
    totalDeposits: 1200000,
    totalWithdrawals: 600000,
    merchants: 3,
    balance: 0.3,
    withdrawableBalance: 0.2,
    settlementBalance: 0.15,
    title: "신협은행 대시보드",
    titleEn: "Shinhan Bank Dashboard",
  },
  jeju: {
    totalDeposits: 600000,
    totalWithdrawals: 400000,
    merchants: 1,
    balance: 0.1,
    withdrawableBalance: 0.08,
    settlementBalance: 0.05,
    title: "제주은행 대시보드",
    titleEn: "Jeju Bank Dashboard",
  },
};

export function EnhancedDashboard() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customization, setCustomization] =
    useState<DashboardCustomization>(defaultCustomization);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const { selectedGroup } = useNavigation();

  // 현재 선택된 그룹의 데이터
  const currentData = groupData[selectedGroup];

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
    if (refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }

    if (customization.refreshInterval > 0) {
      const timer = setInterval(() => {
        refreshDashboard();
      }, customization.refreshInterval * 1000);
      setRefreshTimer(timer);
    }

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [customization.refreshInterval]);

  // 커스터마이징 설정 저장
  const saveCustomization = (newCustomization: DashboardCustomization) => {
    setCustomization(newCustomization);
    localStorage.setItem(
      "dashboardCustomization",
      JSON.stringify(newCustomization),
    );
  };

  // 대시보드 새로고침
  const refreshDashboard = () => {
    // 실제로는 여기서 데이터를 다시 불러오는 API 호출을 수행할 수 있습니다.
    setLastRefreshed(new Date());
    toast({
      title: language === "ko" ? "대시보드 새로고침" : "Dashboard Refreshed",
      description:
        language === "ko"
          ? `대시보드가 ${lastRefreshed.toLocaleTimeString()}에 새로고침되었습니다.`
          : `Dashboard was refreshed at ${lastRefreshed.toLocaleTimeString()}.`,
    });
  };

  // 색상 스키마에 따른 스타일 적용
  const getColorSchemeStyles = () => {
    switch (customization.colorScheme) {
      case "green":
        return {
          primary: "bg-green-500 dark:bg-green-600",
          secondary: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-500 dark:text-green-400",
          chart: ["#10b981", "#ef4444"],
        };
      case "purple":
        return {
          primary: "bg-purple-500 dark:bg-purple-600",
          secondary: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-500 dark:text-purple-400",
          chart: ["#8b5cf6", "#ef4444"],
        };
      case "orange":
        return {
          primary: "bg-orange-500 dark:bg-orange-600",
          secondary: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-500 dark:text-orange-400",
          chart: ["#f97316", "#ef4444"],
        };
      case "red":
        return {
          primary: "bg-red-500 dark:bg-red-600",
          secondary: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-500 dark:text-red-400",
          chart: ["#ef4444", "#3b82f6"],
        };
      default:
        return {
          primary: "bg-blue-500 dark:bg-blue-600",
          secondary: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-500 dark:text-blue-400",
          chart: ["#3b82f6", "#ef4444"],
        };
    }
  };

  const colorStyles = getColorSchemeStyles();

  // 위젯 렌더링 함수
  const renderWidget = (widgetId: string) => {
    const widget = customization.widgets.find(
      (w: WidgetType) => w.id === widgetId,
    );
    if (!widget || !widget.visible) return null;

    switch (widgetId) {
      case "stats":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
            {/* 현재잔액(입금후잔액) */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko"
                      ? "현재잔액(입금후잔액)"
                      : "Current Balance (Payin-Fee)"}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {currentData.balance}
                    {t("won")}
                  </div>
                  <div className="text-xs text-green-500 mt-0.5">
                    {language === "ko" ? "실시간" : "Real-time"}
                  </div>
                </div>
                <div className={`${colorStyles.secondary} p-2 rounded-full`}>
                  <Wallet className={`h-4 w-4 ${colorStyles.text}`} />
                </div>
              </CardContent>
            </Card>

            {/* 출금가능금액 */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko" ? (
                      "출금가능금액"
                    ) : (
                      <>
                        Withdrawable
                        <br />
                        Amount
                      </>
                    )}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {currentData.withdrawableBalance}
                    {t("won")}
                  </div>
                  <div className="text-xs text-blue-500 mt-0.5">
                    {language === "ko" ? "실시간" : "Real-time"}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
                  <CreditCard className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            {/* 정산가능잔액 */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko"
                      ? "정산가능잔액"
                      : "Available Settlement Balance"}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {currentData.settlementBalance}
                    {t("won")}
                  </div>
                  <div className="text-xs text-purple-500 mt-0.5">
                    {language === "ko" ? "실시간" : "Real-time"}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            {/* 총 입금 */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko" ? (
                      "총 입금"
                    ) : (
                      <>
                        Total
                        <br />
                        Deposits
                      </>
                    )}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {currentData.totalDeposits.toLocaleString()}
                    {t("won")}
                  </div>
                  <div className="text-xs text-green-500 mt-0.5">+32%</div>
                </div>
                <div className={`${colorStyles.secondary} p-2 rounded-full`}>
                  <BarChart className={`h-4 w-4 ${colorStyles.text}`} />
                </div>
              </CardContent>
            </Card>

            {/* 총 출금 */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko" ? (
                      "총 출금"
                    ) : (
                      <>
                        Total
                        <br />
                        Withdrawals
                      </>
                    )}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {currentData.totalWithdrawals.toLocaleString()}
                    {t("won")}
                  </div>
                  <div className="text-xs text-red-500 mt-0.5">-12%</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-full">
                  <CreditCard className="h-4 w-4 text-red-500 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "transactions":
        return (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium">
                {language === "ko"
                  ? t("transactionTrends")
                  : "Transaction Trends"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={transactionDataByGroup[selectedGroup]}
                    margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorDeposits"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={colorStyles.chart[0]}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={colorStyles.chart[0]}
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorWithdrawals"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={colorStyles.chart[1]}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={colorStyles.chart[1]}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <Tooltip contentStyle={{ fontSize: "12px" }} />
                    <Area
                      type="monotone"
                      dataKey="deposits"
                      stroke={colorStyles.chart[0]}
                      fillOpacity={1}
                      fill="url(#colorDeposits)"
                      name={t("deposits")}
                    />
                    <Area
                      type="monotone"
                      dataKey="withdrawals"
                      stroke={colorStyles.chart[1]}
                      fillOpacity={1}
                      fill="url(#colorWithdrawals)"
                      name={t("withdrawals")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      case "hourlyStats":
        return (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium">
                {language === "ko" ? "시간대별 통계" : "Hourly Statistics"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={hourlyDataByGroup[selectedGroup]}
                    margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="transactions"
                      fill={colorStyles.chart[0]}
                      name={
                        language === "ko" ? "거래 건수" : "Transaction Count"
                      }
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );

      case "alerts":
        return (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                {language === "ko" ? "알림" : "Alerts"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {alertsByGroup[selectedGroup].map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-md text-sm ${
                      alert.type === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-900/30 border-l-3 border-yellow-500"
                        : alert.type === "error"
                          ? "bg-red-50 dark:bg-red-900/30 border-l-3 border-red-500"
                          : "bg-blue-50 dark:bg-blue-900/30 border-l-3 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 ${
                          alert.type === "warning"
                            ? "text-yellow-500"
                            : alert.type === "error"
                              ? "text-red-500"
                              : "text-blue-500"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {language === "ko" ? alert.message : alert.messageEn}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {language === "ko" ? alert.time : alert.timeEn}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case "notices":
        return (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium flex items-center">
                <Bell className="h-4 w-4 mr-2 text-blue-500" />
                {language === "ko" ? "공지사항" : "Notices"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {noticesByGroup[selectedGroup].map((notice) => (
                  <div
                    key={notice.id}
                    className="p-3 rounded-md text-sm bg-blue-50 dark:bg-blue-900/30 border-l-3 border-blue-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-blue-500">
                        <Info className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {language === "ko"
                            ? notice.message
                            : notice.messageEn}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {language === "ko" ? notice.time : notice.timeEn}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case "adminActivities":
        return (
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden h-full">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-medium">
                {language === "ko" ? "관리자 활동" : "Admin Activities"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {adminActivitiesByGroup[selectedGroup].map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium">{activity.admin}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {language === "ko" ? activity.time : activity.timeEn}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {language === "ko"
                          ? activity.action
                          : activity.actionEn}
                      </div>
                    </div>
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

  // 위젯 그룹화 및 렌더링
  const renderWidgetGroups = () => {
    // 보이는 위젯만 필터링하고 순서대로 정렬
    const visibleWidgets = customization.widgets
      .filter((widget: WidgetType) => widget.visible)
      .sort((a, b) => a.order - b.order);

    // 통계 카드는 항상 전체 너비를 차지하므로 별도 처리
    const statsWidget = visibleWidgets.find(
      (w: WidgetType) => w.id === "stats",
    );
    const otherWidgets = visibleWidgets.filter(
      (w: WidgetType) => w.id !== "stats",
    );

    // 위젯 쌍을 만들기 위한 배열
    const widgetPairs = [];

    // 2개씩 짝을 지어 배열에 추가
    for (let i = 0; i < otherWidgets.length; i += 2) {
      if (i + 1 < otherWidgets.length) {
        // 두 개의 위젯이 있는 경우 쌍으로 추가
        widgetPairs.push([otherWidgets[i], otherWidgets[i + 1]]);
      } else {
        // 마지막 위젯이 홀로 남은 경우 단독으로 추가
        widgetPairs.push([otherWidgets[i]]);
      }
    }

    return (
      <div className="space-y-5">
        {/* 통계 카드 */}
        {statsWidget && <div>{renderWidget(statsWidget.id)}</div>}

        {/* 나머지 위젯들을 쌍으로 렌더링 */}
        {widgetPairs.map((pair, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 첫 번째 위젯 */}
            <div>{renderWidget(pair[0].id)}</div>

            {/* 두 번째 위젯 (있는 경우) */}
            {pair.length > 1 ? (
              <div>{renderWidget(pair[1].id)}</div>
            ) : (
              // 홀수 개의 위젯이 남은 경우, 마지막 위젯은 모바일에서만 전체 너비 차지
              <div className="hidden md:block"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold mb-1 text-gray-800 dark:text-gray-200">
            {t("dashboard")}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <DatePicker
            defaultValue={new Date()}
            onChange={(date) => {
              if (date) {
                // 여기에 날짜 변경 시 처리할 로직 추가
                console.log("Selected date:", date);
                // 예: 선택한 날짜에 해당하는 데이터 필터링
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizeOpen(true)}
            className="hidden"
          >
            <Settings className="h-4 w-4 mr-2" />
            {t("customize")}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0 mb-4">
        <Tabs defaultValue="day" className="min-w-[480px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium">
              {language === "ko" ? currentData.title : currentData.titleEn}
            </h3>
            <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-8">
              <TabsTrigger value="day" className="text-xs px-3 h-6">
                {t("day")}
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-6">
                {t("week")}
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-6">
                {t("month")}
              </TabsTrigger>
              <TabsTrigger value="year" className="text-xs px-3 h-6">
                {t("year")}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* 위젯 그룹 렌더링 */}
      {renderWidgetGroups()}

      {/* 마지막 새로고침 정보 */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-3">
        {language === "ko"
          ? `마지막 새로고침: ${lastRefreshed.toLocaleTimeString()}`
          : `Last refreshed: ${lastRefreshed.toLocaleTimeString()}`}
      </div>

      {/* 커스터마이징 모달 */}
      <DashboardCustomizeModal
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        customization={customization}
        onSave={saveCustomization}
      />
    </div>
  );
}
