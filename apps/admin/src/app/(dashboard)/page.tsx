"use client";

import React, { useEffect, useState } from "react";

import {
  BarChart,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  LineChart,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import { Button } from "@ezpg/ui";
import { useMediaQuery } from "@ezpg/hooks";
import { useTheme } from "@ezpg/ui";
import { useAuth } from "@ezpg/auth";
import {
  NavigationProvider,
  useNavigation,
} from "@/contexts/navigation-context";
import { AllMerchantsContent } from "@/components/merchants/all-merchants";
import { DeletedMerchantsContent } from "@/components/merchants/deleted-merchants";
import { RegisterMerchantContent } from "@/components/merchants/register-merchant";
import { MerchantBalanceLogContent } from "@/components/merchants/merchant-balance-log";
import { AllAgentsContent } from "@/components/agents/all-agents";
import { DeletedAgentsContent } from "@/components/agents/deleted-agents";
import { RegisterAgentContent } from "@/components/agents/register-agent";
import { AgentBalanceLogContent } from "@/components/agents/agent-balance-log";
import { MerchantWithdrawalContent } from "@/components/withdrawals/merchant-withdrawal";
import { AgentWithdrawalContent } from "@/components/withdrawals/agent-withdrawal";
import { SalesManagementContent } from "@/components/sales/sales-management";
import { NoticesContent } from "@/components/notices/notices-content";
import { VirtualAccountInfoContent } from "@/components/virtual-accounts/virtual-account-info";
import { SettlementReportContent } from "@/components/settlements/settlement-report";
import { InquiriesContent } from "@/components/inquiries/inquiries-content";
import { AllMembersContent } from "@/components/members/all-members";
import { DeletedMembersContent } from "@/components/members/deleted-members";
import { BlacklistContent } from "@/components/operations/blacklist";
import { AdminLogsContent } from "@/components/operations/admin-logs";
import { SystemMaintenanceContent } from "@/components/operations/system-maintenance";
import { ComplaintsContent } from "@/components/operations/complaints";
import { AdminAccountsContent } from "@/components/operations/admin-accounts";
import MyPage from "@/components/operations/my-page";
import { User as MyPageUserType } from "@/hooks/use-user";
import { RoleName } from "@ezpg/database";
import { SuspiciousTransactionsContent } from "@/components/operations/suspicious-transactions";
import { GroupsContent } from "@/components/operations/groups";
import { Dashboard as DashboardComp } from "@/components/dashboard/dashboard";

function DashboardApp() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const [activeMenus, setActiveMenus] = React.useState<Record<string, boolean>>(
    {},
  );
  const { activePage, navigateTo } = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const { logout, user: authUser } = useAuth();

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleMenu = (menuName: string) => {
    setActiveMenus((prev) => {
      const newState: Record<string, boolean> = {};

      Object.keys(prev).forEach((key) => {
        newState[key] = key === menuName ? !prev[key] : false;
      });

      newState[menuName] = !prev[menuName];

      return newState;
    });
  };

  const menuItems = [
    {
      name: "대시보드",
      icon: <BarChart className="h-4 w-4" />,
      path: "dashboard",
      onClick: () => navigateTo("dashboard"),
    },
    {
      name: "매출 관리",
      icon: <LineChart className="h-4 w-4" />,
      path: "deposits",
      onClick: () => navigateTo("deposits"),
    },
    {
      name: "출금 관리",
      icon: <CreditCard className="h-4 w-4" />,
      subMenus: [
        {
          name: "가맹점 출금",
          path: "withdrawals/merchants",
          onClick: () => navigateTo("withdrawals-merchants"),
        },
        {
          name: "에이전트 출금",
          path: "withdrawals/agents",
          onClick: () => navigateTo("withdrawals-agents"),
        },
      ],
    },
    {
      name: "가맹점 관리",
      icon: <Building2 className="h-4 w-4" />,
      subMenus: [
        {
          name: "전체 가맹점",
          path: "merchants/all",
          onClick: () => navigateTo("merchants-all"),
        },
        {
          name: "가맹점 등록",
          path: "merchants/register",
          onClick: () => navigateTo("merchants-register"),
        },
        {
          name: "가맹점 잔액 로그",
          path: "merchants/balance-log",
          onClick: () => navigateTo("merchants-balance-log"),
        },
        {
          name: "삭제된 가맹점",
          path: "merchants/deleted",
          onClick: () => navigateTo("merchants-deleted"),
        },
      ],
    },
    {
      name: "에이전트 관리",
      icon: <Users className="h-4 w-4" />,
      subMenus: [
        {
          name: "전체 에이전트",
          path: "agents/all",
          onClick: () => navigateTo("agents-all"),
        },
        {
          name: "에이전트 등록",
          path: "agents/register",
          onClick: () => navigateTo("agents-register"),
        },
        {
          name: "에이전트 잔액 로그",
          path: "agents/balance-log",
          onClick: () => navigateTo("agents-balance-log"),
        },
        {
          name: "삭제된 에이전트",
          path: "agents/deleted",
          onClick: () => navigateTo("agents-deleted"),
        },
      ],
    },
    {
      name: "회원 관리",
      icon: <User className="h-4 w-4" />,
      subMenus: [
        {
          name: "전체 회원",
          path: "members/all",
          onClick: () => navigateTo("members-all"),
        },
        {
          name: "삭제된 회원",
          path: "members/deleted",
          onClick: () => navigateTo("members-deleted"),
        },
      ],
    },
    {
      name: "가상계좌 정보",
      icon: <CreditCard className="h-4 w-4" />,
      path: "virtual-accounts",
      onClick: () => navigateTo("virtual-accounts"),
    },
    {
      name: "정산 관리",
      icon: <FileText className="h-4 w-4" />,
      path: "settlements",
      onClick: () => navigateTo("settlements"),
    },
    {
      name: "공지사항",
      icon: <FileText className="h-4 w-4" />,
      path: "notices",
      onClick: () => navigateTo("notices"),
    },
    {
      name: "문의사항",
      icon: <MessageSquare className="h-4 w-4" />,
      path: "inquiries",
      onClick: () => navigateTo("inquiries"),
    },
    {
      name: "운영 관리",
      icon: <Settings className="h-4 w-4" />,
      subMenus: [
        {
          name: "민원",
          path: "operations/complaints",
          onClick: () => navigateTo("operations-complaints"),
        },
        {
          name: "블랙리스트",
          path: "operations/blacklist",
          onClick: () => navigateTo("operations-blacklist"),
        },
        {
          name: "관리자 로그",
          path: "operations/admin-logs",
          onClick: () => navigateTo("operations-admin-logs"),
        },
        {
          name: "시스템 점검",
          path: "operations/system-maintenance",
          onClick: () => navigateTo("operations-system-maintenance"),
        },
        {
          name: "관리자 계정",
          path: "operations/admin-accounts",
          onClick: () => navigateTo("operations-admin-accounts"),
        },
        {
          name: "그룹",
          path: "operations/groups",
          onClick: () => navigateTo("operations-groups"),
        },
        {
          name: "의심거래",
          path: "operations/suspicious-transactions",
          onClick: () => navigateTo("operations-suspicious-transactions"),
        },
        {
          name: "마이페이지",
          path: "operations/my-page",
          onClick: () => navigateTo("operations-my-page"),
        },
      ],
    },
  ];

  React.useEffect(() => {
    menuItemsRef.current.forEach((item) => {
      if (item.subMenus) {
        const hasActiveSubMenu = item.subMenus.some(
          (subItem) => subItem.path === activePage,
        );
        if (hasActiveSubMenu) {
          setActiveMenus((prev) => ({
            ...prev,
            [item.name]: true,
          }));
        }
      }
    });
  }, [activePage]);

  const Overlay = () => (
    <div
      className={`fixed inset-0 bg-black/50 z-20 md:hidden ${sidebarOpen ? "block" : "hidden"}`}
      onClick={() => setSidebarOpen(false)}
    />
  );

  const menuItemsRef = React.useRef(menuItems);

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardComp />;
      case "deposits":
        return <SalesManagementContent />;
      case "withdrawals-merchants":
        return <MerchantWithdrawalContent />;
      case "withdrawals-agents":
        return <AgentWithdrawalContent />;
      case "merchants-all":
        return <AllMerchantsContent />;
      case "merchants-deleted":
        return <DeletedMerchantsContent />;
      case "merchants-register":
        return <RegisterMerchantContent />;
      case "merchants-balance-log":
        return <MerchantBalanceLogContent />;
      case "agents-all":
        return <AllAgentsContent />;
      case "agents-deleted":
        return <DeletedAgentsContent />;
      case "agents-register":
        return <RegisterAgentContent />;
      case "agents-balance-log":
        return <AgentBalanceLogContent />;
      case "members-all":
        return <AllMembersContent />;
      case "members-deleted":
        return <DeletedMembersContent />;
      case "virtual-accounts":
        return <VirtualAccountInfoContent />;
      case "settlements":
        return <SettlementReportContent />;
      case "notices":
        return <NoticesContent />;
      case "inquiries":
        return <InquiriesContent />;
      case "operations-complaints":
        return <ComplaintsContent />;
      case "operations-blacklist":
        return <BlacklistContent />;
      case "operations-admin-logs":
        return <AdminLogsContent />;
      case "operations-system-maintenance":
        return <SystemMaintenanceContent />;
      case "operations-admin-accounts":
        return <AdminAccountsContent />;
      case "operations-groups":
        return <GroupsContent />;
      case "operations-suspicious-transactions":
        return <SuspiciousTransactionsContent />;
      case "operations-my-page":
        if (!authUser) return <MyPage user={null} />;

        let numericRoleId: number;
        switch (authUser.role) {
          case RoleName.ADMIN:
            numericRoleId = 1;
            break;
          case RoleName.MERCHANT:
            numericRoleId = 2;
            break;
          case RoleName.AGENT:
            numericRoleId = 3;
            break;
          default:
            console.warn(`Unknown role: ${authUser.role}`);
            numericRoleId = 0;
        }

        const myPageUser: MyPageUserType = {
          userId: authUser.userId,
          username: authUser.username,
          roleId: numericRoleId,
          roleName: authUser.role,
          tfaEnabled: authUser.tfaEnabled,
          firstLogin: authUser.firstLogin,
          isActive: authUser.isActive,
          createdAt: authUser.createdAt
            ? new Date(authUser.createdAt).toISOString()
            : "",
          updatedAt: authUser.updatedAt
            ? new Date(authUser.updatedAt).toISOString()
            : "",
        };
        return <MyPage user={myPageUser} />;

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div
      className={`flex min-h-screen relative ${theme === "dark" ? "dark" : ""}`}
    >
      <Overlay />

      <div
        className={`${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0 md:w-0"
        } fixed md:relative z-30 h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-200 dark:border-gray-700`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-xl text-blue-500 dark:text-blue-400">
            EZPG
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 dark:text-gray-400 md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="bg-purple-600 dark:bg-purple-700 p-4 text-white">
          <div className="text-sm">환영합니다.</div>
          <div className="text-sm font-bold">관리자</div>
          <div className="text-xs mt-1">관리자</div>
        </div>

        <div className="overflow-y-auto flex-1 pt-3">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <div
                className={`px-4 py-3 text-sm flex items-center justify-between cursor-pointer ${
                  activePage === item.path
                    ? "bg-blue-500 text-white dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800"
                    : item.subMenus && activeMenus[item.name]
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      : "hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                }`}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  if (item.subMenus) toggleMenu(item.name);
                }}
              >
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <span
                      className={`${activePage === item.path ? "text-white" : ""}`}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span>{item.name}</span>
                </div>
                {item.subMenus &&
                  (activeMenus[item.name] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ))}
              </div>

              {item.subMenus && (
                <div
                  className={`bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${
                    activeMenus[item.name] ? "block" : "hidden"
                  }`}
                >
                  {item.subMenus.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className={`px-8 py-2 text-xs cursor-pointer ${
                        activePage === subItem.path
                          ? "bg-blue-500 text-white dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800"
                          : "hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      }`}
                      onClick={subItem.onClick}
                    >
                      {subItem.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-auto p-4 bg-red-500 dark:bg-red-600 text-white text-center cursor-pointer hover:bg-red-600 dark:hover:bg-red-700 transition-colors w-full border-none"
        >
          <div className="text-sm font-medium">로그아웃</div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="mr-2 text-gray-500 dark:text-gray-400"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-medium truncate">EZPG 관리자</h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              관리자
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-auto">
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="p-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p>© 2024 EZPG. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NavigationProvider>
      <DashboardApp />
    </NavigationProvider>
  );
}
