"use client";

import type React from "react";

import { ChevronLeft, ChevronRight, Filter, AlertCircle } from "lucide-react";
import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@ezpg/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { DateRangePicker } from "@ezpg/ui";
import { addDays } from "date-fns";
import { useNavigation } from "@/contexts/navigation-context";
import { useLanguage } from "@ezpg/hooks";

type Notice = {
  id: number;
  category: string;
  title: string;
  noticeDate: string;
  status: "게시중" | "미게시";
  createdAt: string;
  author: string;
  content: string;
  // 영어 버전 필드 추가
  categoryEn?: string;
  titleEn?: string;
  contentEn?: string;
};

// 그룹별 공지사항 데이터 (영어 버전 추가)
const noticesByGroup = {
  all: [
    {
      id: 1,
      category: "시스템",
      categoryEn: "System",
      title: "시스템 점검 안내 (2024-04-15)",
      titleEn: "System Maintenance Notice (2024-04-15)",
      noticeDate: "2024-04-10 09:30:00",
      status: "게시중",
      createdAt: "2024-04-10 09:30:00",
      author: "admin",
      content:
        "안녕하세요. 시스템 점검 안내드립니다.\n\n일시: 2024년 4월 15일 02:00 ~ 06:00 (4시간)\n\n점검 내용: 서버 안정화 및 보안 업데이트\n\n점검 시간 동안에는 서비스 이용이 제한됩니다. 이용에 참고 부탁드립니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a system maintenance notice.\n\nDate: April 15, 2024, 02:00 ~ 06:00 (4 hours)\n\nMaintenance details: Server stabilization and security updates\n\nDuring the maintenance period, service usage will be restricted. Please take note of this.\n\nThank you.",
    },
    {
      id: 2,
      category: "공지",
      categoryEn: "Notice",
      title: "신규 가맹점 추가 안내",
      titleEn: "New Merchant Addition Notice",
      noticeDate: "2024-04-05 14:20:00",
      status: "게시중",
      createdAt: "2024-04-05 14:20:00",
      author: "admin",
      content:
        "안녕하세요. 신규 가맹점 추가 안내드립니다.\n\n4월부터 다음 가맹점들이 추가되었습니다:\n\n- 가맹점A\n- 가맹점B\n- 가맹점C\n\n자세한 내용은 가맹점 관리 페이지에서 확인하실 수 있습니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about new merchant additions.\n\nThe following merchants have been added from April:\n\n- Merchant A\n- Merchant B\n\n- Merchant C\n\nFor more details, please check the merchant management page.\n\nThank you.",
    },
    {
      id: 3,
      category: "업데이트",
      categoryEn: "Update",
      title: "시스템 업데이트 완료 안내",
      titleEn: "System Update Completion Notice",
      noticeDate: "2024-03-28 10:15:00",
      status: "게시중",
      createdAt: "2024-03-28 10:15:00",
      author: "admin",
      content:
        "안녕하세요. 시스템 업데이트 완료 안내드립니다.\n\n업데이트 내용:\n\n1. 관리자 대시보드 기능 개선\n2. 보안 취약점 패치\n3. 성능 최적화\n\n업데이트와 관련하여 문의사항이 있으시면 관리자에게 문의해주세요.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about the completion of system updates.\n\nUpdate details:\n\n1. Improved administrator dashboard functionality\n2. Security vulnerability patches\n3. Performance optimization\n\nIf you have any questions regarding the update, please contact the administrator.\n\nThank you.",
    },
  ],
  reseller: [
    {
      id: 1,
      category: "시스템",
      categoryEn: "System",
      title: "테라시스 시스템 점검 안내 (2024-04-15)",
      titleEn: "Terasis System Maintenance Notice (2024-04-15)",
      noticeDate: "2024-04-10 10:30:00",
      status: "게시중",
      createdAt: "2024-04-10 10:30:00",
      author: "admin",
      content:
        "안녕하세요. 테라시스 시스템 점검 안내드립니다.\n\n일시: 2024년 4월 15일 03:00 ~ 07:00 (4시간)\n\n점검 내용: 테라시스 서버 안정화 및 보안 업데이트\n\n점검 시간 동안에는 테라시스 서비스 이용이 제한됩니다. 이용에 참고 부탁드립니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a Terasis system maintenance notice.\n\nDate: April 15, 2024, 03:00 ~ 07:00 (4 hours)\n\nMaintenance details: Terasis server stabilization and security updates\n\nDuring the maintenance period, Terasis service usage will be restricted. Please take note of this.\n\nThank you.",
    },
    {
      id: 2,
      category: "공지",
      categoryEn: "Notice",
      title: "테라시스 가맹점 수수료 정책 변경 안내",
      titleEn: "Terasis Merchant Fee Policy Change Notice",
      noticeDate: "2024-04-05 15:20:00",
      status: "게시중",
      createdAt: "2024-04-05 15:20:00",
      author: "admin",
      content:
        "안녕하세요. 테라시스 가맹점 수수료 정책 변경 안내드립니다.\n\n다음 달부터 테라시스 가맹점 수수료 정책이 다음과 같이 변경됩니다:\n\n- 기존: 3.5%\n- 변경: 3.2%\n\n자세한 내용은 가맹점 관리 페이지에서 확인하실 수 있습니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about changes to the Terasis merchant fee policy.\n\nFrom next month, the Terasis merchant fee policy will change as follows:\n\n- Current: 3.5%\n- Changed: 3.2%\n\nFor more details, please check the merchant management page.\n\nThank you.",
    },
    {
      id: 3,
      category: "업데이트",
      categoryEn: "Update",
      title: "테라시스 시스템 업데이트 완료 안내",
      titleEn: "Terasis System Update Completion Notice",
      noticeDate: "2024-03-28 11:15:00",
      status: "게시중",
      createdAt: "2024-03-28 11:15:00",
      author: "admin",
      content:
        "안녕하세요. 테라시스 시스템 업데이트 완료 안내드립니다.\n\n업데이트 내용:\n\n1. 테라시스 관리자 대시보드 기능 개선\n2. 테라시스 보안 취약점 패치\n3. 테라시스 성능 최적화\n\n업데이트와 관련하여 문의사항이 있으시면 관리자에게 문의해주세요.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about the completion of Terasis system updates.\n\nUpdate details:\n\n1. Improved Terasis administrator dashboard functionality\n2. Terasis security vulnerability patches\n3. Terasis performance optimization\n\nIf you have any questions regarding the update, please contact the administrator.\n\nThank you.",
    },
  ],
  shinhan: [
    {
      id: 1,
      category: "시스템",
      categoryEn: "System",
      title: "신협은행 시스템 점검 안내 (2024-04-16)",
      titleEn: "Shinhan Credit Union System Maintenance Notice (2024-04-16)",
      noticeDate: "2024-04-11 08:30:00",
      status: "게시중",
      createdAt: "2024-04-11 08:30:00",
      author: "admin",
      content:
        "안녕하세요. 신협은행 시스템 점검 안내드립니다.\n\n일시: 2024년 4월 16일 01:00 ~ 05:00 (4시간)\n\n점검 내용: 신협은행 서버 안정화 및 보안 업데이트\n\n점검 시간 동안에는 신협은행 서비스 이용이 제한됩니다. 이용에 참고 부탁드립니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a Shinhan Credit Union system maintenance notice.\n\nDate: April 16, 2024, 01:00 ~ 05:00 (4 hours)\n\nMaintenance details: Shinhan Credit Union server stabilization and security updates\n\nDuring the maintenance period, Shinhan Credit Union service usage will be restricted. Please take note of this.\n\nThank you.",
    },
    {
      id: 2,
      category: "공지",
      categoryEn: "Notice",
      title: "신협은행 가맹점 정산 일정 변경 안내",
      titleEn:
        "Shinhan Credit Union Merchant Settlement Schedule Change Notice",
      noticeDate: "2024-04-06 13:20:00",
      status: "게시중",
      createdAt: "2024-04-06 13:20:00",
      author: "admin",
      content:
        "안녕하세요. 신협은행 가맹점 정산 일정 변경 안내드립니다.\n\n다음 달부터 신협은행 가맹점 정산 일정이 다음과 같이 변경됩니다:\n\n- 기존: 매주 금요일\n- 변경: 매주 목요일\n\n자세한 내용은 가맹점 관리 페이지에서 확인하실 수 있습니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about changes to the Shinhan Credit Union merchant settlement schedule.\n\nFrom next month, the Shinhan Credit Union merchant settlement schedule will change as follows:\n\n- Current: Every Friday\n- Changed: Every Thursday\n\nFor more details, please check the merchant management page.\n\nThank you.",
    },
    {
      id: 3,
      category: "업데이트",
      categoryEn: "Update",
      title: "신협은행 시스템 업데이트 완료 안내",
      titleEn: "Shinhan Credit Union System Update Completion Notice",
      noticeDate: "2024-03-29 09:15:00",
      status: "게시중",
      createdAt: "2024-03-29 09:15:00",
      author: "admin",
      content:
        "안녕하세요. 신협은행 시스템 업데이트 완료 안내드립니다.\n\n업데이트 내용:\n\n1. 신협은행 관리자 대시보드 기능 개선\n2. 신협은행 보안 취약점 패치\n3. 신협은행 성능 최적화\n\n업데이트와 관련하여 문의사항이 있으시면 관리자에게 문의해주세요.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about the completion of Shinhan Credit Union system updates.\n\nUpdate details:\n\n1. Improved Shinhan Credit Union administrator dashboard functionality\n2. Shinhan Credit Union security vulnerability patches\n3. Shinhan Credit Union performance optimization\n\nIf you have any questions regarding the update, please contact the administrator.\n\nThank you.",
    },
  ],
  jeju: [
    {
      id: 1,
      category: "시스템",
      categoryEn: "System",
      title: "제주은행 시스템 점검 안내 (2024-04-17)",
      titleEn: "Jeju Bank System Maintenance Notice (2024-04-17)",
      noticeDate: "2024-04-12 07:30:00",
      status: "게시중",
      createdAt: "2024-04-12 07:30:00",
      author: "admin",
      content:
        "안녕하세요. 제주은행 시스템 점검 안내드립니다.\n\n일시: 2024년 4월 17일 04:00 ~ 08:00 (4시간)\n\n점검 내용: 제주은행 서버 안정화 및 보안 업데이트\n\n점검 시간 동안에는 제주은행 서비스 이용이 제한됩니다. 이용에 참고 부탁드립니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a Jeju Bank system maintenance notice.\n\nDate: April 17, 2024, 04:00 ~ 08:00 (4 hours)\n\nMaintenance details: Jeju Bank server stabilization and security updates\n\nDuring the maintenance period, Jeju Bank service usage will be restricted. Please take note of this.\n\nThank you.",
    },
    {
      id: 2,
      category: "공지",
      categoryEn: "Notice",
      title: "제주은행 가맹점 입금 한도 상향 안내",
      titleEn: "Jeju Bank Merchant Deposit Limit Increase Notice",
      noticeDate: "2024-04-07 12:20:00",
      status: "게시중",
      createdAt: "2024-04-07 12:20:00",
      author: "admin",
      content:
        "안녕하세요. 제주은행 가맹점 입금 한도 상향 안내드립니다.\n\n다음 달부터 제주은행 가맹점 입금 한도가 다음과 같이 상향됩니다:\n\n- 기존: 500만원\n- 변경: 1,000만원\n\n자세한 내용은 가맹점 관리 페이지에서 확인하실 수 있습니다.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about the increase in Jeju Bank merchant deposit limits.\n\nFrom next month, the Jeju Bank merchant deposit limit will increase as follows:\n\n- Current: 5 million KRW\n- Changed: 10 million KRW\n\nFor more details, please check the merchant management page.\n\nThank you.",
    },
    {
      id: 3,
      category: "업데이트",
      categoryEn: "Update",
      title: "제주은행 시스템 업데이트 완료 안내",
      titleEn: "Jeju Bank System Update Completion Notice",
      noticeDate: "2024-03-30 08:15:00",
      status: "게시중",
      createdAt: "2024-03-30 08:15:00",
      author: "admin",
      content:
        "안녕하세요. 제주은행 시스템 업데이트 완료 안내드립니다.\n\n업데이트 내용:\n\n1. 제주은행 관리자 대시보드 기능 개선\n2. 제주은행 보안 취약점 패치\n3. 제주은행 성능 최적화\n\n업데이트와 관련하여 문의사항이 있으시면 관리자에게 문의해주세요.\n\n감사합니다.",
      contentEn:
        "Hello. This is a notice about the completion of Jeju Bank system updates.\n\nUpdate details:\n\n1. Improved Jeju Bank administrator dashboard functionality\n2. Jeju Bank security vulnerability patches\n3. Jeju Bank performance optimization\n\nIf you have any questions regarding the update, please contact the administrator.\n\nThank you.",
    },
  ],
};

export function NoticesContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [noticeStatus, setNoticeStatus] = useState("all");
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const { selectedGroup } = useNavigation();
  const { language } = useLanguage();

  // 현재 선택된 그룹의 공지사항 데이터
  const currentNotices = noticesByGroup[
    selectedGroup as keyof typeof noticesByGroup
  ] as Notice[];

  // 번역 함수
  const translateStatus = (status: string) => {
    if (language === "en") {
      return status === "게시중" ? "Published" : "Unpublished";
    }
    return status;
  };

  const translateGroupName = (groupName: string) => {
    if (language === "en") {
      const groupTranslations: Record<string, string> = {
        reseller: "Reseller (Terasis)",
        shinhan: "Shinhan Credit Union",
        jeju: "Jeju Bank",
      };
      return (groupTranslations as any)[groupName] || groupName;
    }
    return groupName;
  };

  // 번역 객체
  const t = {
    pageTitle: language === "en" ? "Notice Management" : "공지사항 관리",
    groupFilterMessage:
      language === "en"
        ? `Currently showing notices from the ${selectedGroup !== "all" ? translateGroupName(selectedGroup) : ""} group only.`
        : `현재 ${selectedGroup !== "all" ? `${selectedGroup === "reseller" ? "재판매(테라시스)" : selectedGroup === "shinhan" ? "신협은행" : "제주은행"}` : ""} 그룹의 공지사항만 표시하고 있습니다.`,
    tableHeaders: {
      no: language === "en" ? "No." : "번호",
      category: language === "en" ? "Category" : "분류",
      title: language === "en" ? "Title" : "제목",
      noticeDate: language === "en" ? "Notice Date" : "공지일시",
      status: language === "en" ? "Status" : "상태",
      registrationDate: language === "en" ? "Registration Date" : "등록일시",
      author: language === "en" ? "Author" : "작성자",
    },
    buttons: {
      show50: language === "en" ? "Show 50" : "50개 보기",
      show10: language === "en" ? "Show 10" : "10개 보기",
      show25: language === "en" ? "Show 25" : "25개 보기",
      show100: language === "en" ? "Show 100" : "100개 보기",
      advanced: language === "en" ? "Advanced" : "상세조건",
      close: language === "en" ? "Close" : "닫기",
      reset: language === "en" ? "Reset" : "초기화",
      search: language === "en" ? "Search" : "조회",
    },
    modal: {
      detailTitle: language === "en" ? "Notice Details" : "공지사항 상세",
      category: language === "en" ? "Category" : "분류",
      noticeDate: language === "en" ? "Notice Date" : "공지일시",
      status: language === "en" ? "Status" : "상태",
      registrationDate: language === "en" ? "Registration Date" : "등록일시",
      author: language === "en" ? "Author" : "작성자",
      content: language === "en" ? "Content" : "내용",
      advancedSearchTitle:
        language === "en" ? "Advanced Search" : "상세조건 검색",
      advancedSearchDesc:
        language === "en"
          ? "Set detailed conditions for notice search."
          : "공지사항 검색을 위한 상세 조건을 설정하세요.",
      searchCriteria: language === "en" ? "Search Criteria" : "조회기준",
      modificationDate: language === "en" ? "Modification Date" : "수정일자",
      searchPeriod: language === "en" ? "Search Period" : "조회기간",
      all: language === "en" ? "All" : "전체",
      notice: language === "en" ? "Notice" : "공지",
      info: language === "en" ? "Information" : "안내",
      update: language === "en" ? "Update" : "업데이트",
      maintenance: language === "en" ? "Maintenance" : "점검",
      published: language === "en" ? "Published" : "게시중",
      unpublished: language === "en" ? "Unpublished" : "미게시",
      recipient: language === "en" ? "Recipient" : "수신자",
      merchant: language === "en" ? "Merchant" : "가맹점",
      title: language === "en" ? "Title" : "제목",
      titlePlaceholder: language === "en" ? "Enter title" : "제목 입력",
    },
  };

  const handleViewDetail = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowDetailPopup(true);
  };

  const handleAdvancedFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("필터 적용");
    console.log("상태:", noticeStatus);
    console.log("기간:", dateRange);
    setIsFilterModalOpen(false);
    // 필터 적용 로직 추가
  };

  useEffect(() => {
    if (tableRef.current) {
      const thElements = tableRef.current.querySelectorAll("th");
      const tdElements = tableRef.current.querySelectorAll("td");

      thElements.forEach((th) => {
        th.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        `;
      });

      tdElements.forEach((td) => {
        td.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        `;
      });
    }
  }, []);

  // 그룹 필터링 알림 배너
  const renderGroupFilterBanner = () => {
    if (selectedGroup === "all") return null;

    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mb-4 rounded-md flex items-center">
        <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
        <div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t.groupFilterMessage}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">{t.pageTitle}</h2>
      </div>

      {/* 그룹 필터링 알림 배너 */}
      {renderGroupFilterBanner()}

      <div className="flex flex-wrap gap-3 mb-4 justify-end">
        <Select>
          <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <SelectValue placeholder={language === "ko" ? `보기` : `View`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
          onClick={handleAdvancedFilterClick}
        >
          <Filter className="h-4 w-4 mr-1.5" />
          {t.buttons.advanced}
        </Button>
      </div>

      <table
        ref={tableRef}
        className="w-full text-sm"
        style={{ minWidth: "1100px", tableLayout: "fixed" }}
      >
        <colgroup>
          <col style={{ width: "60px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "300px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-center font-medium">
              {t.tableHeaders.no}
            </th>
            <th className="py-3 px-4 text-center font-medium">
              {t.tableHeaders.category}
            </th>
            <th className="py-3 px-4 text-center font-medium">
              {t.tableHeaders.title}
            </th>
            <th className="py-3 px-4 text-center font-medium">
              {t.tableHeaders.noticeDate}
            </th>
            <th className="py-3 px-4 text-center font-medium">
              {t.tableHeaders.status}
            </th>
            <th className="py-3 px-4 text-center font-medium">
              {t.tableHeaders.registrationDate}
            </th>
            <th className="py-3 px-4 text-center font-medium">
              {t.tableHeaders.author}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentNotices.map((notice) => (
            <tr
              key={notice.id}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
              onClick={() => handleViewDetail(notice as Notice)}
            >
              <td className="py-3 px-4 text-center">{notice.id}</td>
              <td className="py-3 px-4 text-center">
                {language === "en" ? notice.categoryEn : notice.category}
              </td>
              <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400 text-center">
                {language === "en" ? notice.titleEn : notice.title}
              </td>
              <td className="py-3 px-4 text-center">{notice.noticeDate}</td>
              <td className="py-3 px-4 text-center">
                <Badge
                  className={
                    notice.status === "게시중" ? "bg-green-500" : "bg-gray-500"
                  }
                >
                  {translateStatus(notice.status)}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center">{notice.createdAt}</td>
              <td className="py-3 px-4 text-center">{notice.author}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center p-4">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 dark:border-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 bg-blue-500 border-blue-500 text-white hover:bg-blue-600"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 dark:border-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 공지사항 상세보기 모달 */}
      <Dialog open={showDetailPopup} onOpenChange={setShowDetailPopup}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedNotice && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {language === "en"
                    ? selectedNotice.titleEn
                    : selectedNotice.title}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.modal.category}
                  </p>
                  <p className="font-medium">
                    {language === "en"
                      ? selectedNotice.categoryEn
                      : selectedNotice.category}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.modal.noticeDate}
                  </p>
                  <p className="font-medium">{selectedNotice.noticeDate}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.modal.status}
                  </p>
                  <Badge
                    className={
                      selectedNotice.status === "게시중"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }
                  >
                    {translateStatus(selectedNotice.status)}
                  </Badge>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.modal.registrationDate}
                  </p>
                  <p className="font-medium">{selectedNotice.createdAt}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.modal.author}
                  </p>
                  <p className="font-medium">{selectedNotice.author}</p>
                </div>
              </div>

              <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <h3 className="font-medium mb-2">{t.modal.content}</h3>
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 text-sm">
                  {language === "en"
                    ? selectedNotice.contentEn
                    : selectedNotice.content}
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setShowDetailPopup(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {t.buttons.close}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 상세조건 모달 */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>{t.modal.advancedSearchTitle}</DialogTitle>
            <DialogDescription className="text-sm dark:text-gray-300">
              {t.modal.advancedSearchDesc}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFilterSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="searchCriteria"
                  className="text-right text-sm dark:text-gray-300"
                >
                  {t.modal.searchCriteria}
                </Label>
                <Select defaultValue="noticeDate">
                  <SelectTrigger
                    id="searchCriteria"
                    className="col-span-4 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <SelectValue placeholder={t.modal.searchCriteria} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noticeDate">
                      {t.modal.noticeDate}
                    </SelectItem>
                    <SelectItem value="createDate">
                      {t.modal.registrationDate}
                    </SelectItem>
                    <SelectItem value="updateDate">
                      {t.modal.modificationDate}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label className="text-right text-sm dark:text-gray-300">
                  {t.modal.searchPeriod}
                </Label>
                <div className="col-span-4">
                  <DateRangePicker
                    defaultValue={dateRange}
                    onChange={setDateRange}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="category"
                  className="text-right text-sm dark:text-gray-300"
                >
                  {t.modal.category}
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger
                    id="category"
                    className="col-span-4 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <SelectValue placeholder={t.modal.category} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.modal.all}</SelectItem>
                    <SelectItem value="notice">{t.modal.notice}</SelectItem>
                    <SelectItem value="info">{t.modal.info}</SelectItem>
                    <SelectItem value="update">{t.modal.update}</SelectItem>
                    <SelectItem value="maintenance">
                      {t.modal.maintenance}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="status"
                  className="text-right text-sm dark:text-gray-300"
                >
                  {t.modal.status}
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger
                    id="status"
                    className="col-span-4 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <SelectValue placeholder={t.modal.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.modal.all}</SelectItem>
                    <SelectItem value="active">{t.modal.published}</SelectItem>
                    <SelectItem value="inactive">
                      {t.modal.unpublished}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="recipient"
                  className="text-right text-sm dark:text-gray-300"
                >
                  {t.modal.recipient}
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger
                    id="recipient"
                    className="col-span-4 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <SelectValue placeholder={t.modal.recipient} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.modal.all}</SelectItem>
                    <SelectItem value="merchant">{t.modal.merchant}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="title"
                  className="text-right text-sm dark:text-gray-300"
                >
                  {t.modal.title}
                </Label>
                <Input
                  id="title"
                  placeholder={t.modal.titlePlaceholder}
                  className="col-span-4 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsFilterModalOpen(false)}
              >
                {t.buttons.reset}
              </Button>
              <Button type="submit" className="w-full">
                {t.buttons.search}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
