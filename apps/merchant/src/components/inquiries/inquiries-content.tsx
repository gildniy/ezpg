"use client";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  PlusCircle,
  Upload,
  Download,
  X,
} from "lucide-react";
import { DialogFooter } from "@ezpg/ui";

import type React from "react";

import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { Textarea } from "@ezpg/ui";
import { DatePicker } from "@ezpg/ui";
import { Checkbox } from "@ezpg/ui";
// Import useLanguage hook
import { useLanguage } from "@ezpg/hooks";
// Import useNavigation hook
import {
  useNavigation,
  groupNames,
  type MerchantGroup,
} from "@/contexts/navigation-context";

// Define types for inquiry status in both languages
type KoreanInquiryStatus = "답변 완료" | "답변 대기";
type EnglishInquiryStatus = "Answered" | "Pending";
type InquiryStatus = KoreanInquiryStatus | EnglishInquiryStatus;

// Define interface for inquiry data
interface Inquiry {
  id: number;
  userId: string;
  title: string;
  date: string;
  status: InquiryStatus;
}

// Function to translate inquiry status
function translateStatus(
  status: InquiryStatus,
  language: string,
): InquiryStatus {
  if (language === "en") {
    if (status === "답변 완료") return "Answered";
    if (status === "답변 대기") return "Pending";
    return status;
  } else {
    if (status === "Answered") return "답변 완료";
    if (status === "Pending") return "답변 대기";
    return status;
  }
}

// Function to translate inquiry title
function translateTitle(title: string, language: string): string {
  if (language === "en") {
    // Translate Korean titles to English
    const translations: Record<string, string> = {
      "가입 문의": "Registration Inquiry",
      "출금 문의": "Withdrawal Inquiry",
      "서비스 이용 문의": "Service Usage Inquiry",
      "결제 오류 문의": "Payment Error Inquiry",
      "재판매 계약 문의": "Reseller Contract Inquiry",
      "수수료 문의": "Fee Inquiry",
      "신협 계좌 연동 문의": "Shinhan Account Integration Inquiry",
      "입금 지연 문의": "Deposit Delay Inquiry",
      "출금 한도 문의": "Withdrawal Limit Inquiry",
      "제주은행 계좌 문의": "Jeju Bank Account Inquiry",
      "정산 일정 문의": "Settlement Schedule Inquiry",
    };
    return translations[title] || title;
  }
  return title;
}

// Function to translate group name
function translateGroupName(groupName: string, language: string): string {
  if (language === "en") {
    const translations: Record<string, string> = {
      신협: "Shinhan Credit Union",
      제주: "Jeju",
      재판매인: "Reseller",
    };
    return translations[groupName] || groupName;
  }
  return groupName;
}

// Function to get status badge style
function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "답변 완료":
    case "Answered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "답변 대기":
    case "Pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

export function InquiriesContent() {
  const { language } = useLanguage();
  const { selectedGroup } = useNavigation();

  // Define inquiry data by group
  const inquiriesByGroup: Record<MerchantGroup, Inquiry[]> = {
    all: [
      {
        id: 1,
        userId: "user123",
        title: "가입 문의",
        date: "2025-04-01 10:00:00",
        status: "답변 완료",
      },
      {
        id: 2,
        userId: "customer456",
        title: "출금 문의",
        date: "2025-04-01 11:00:00",
        status: "답변 대기",
      },
      {
        id: 3,
        userId: "merchant789",
        title: "서비스 이용 문의",
        date: "2025-04-01 12:30:00",
        status: "답변 대기",
      },
      {
        id: 4,
        userId: "shop101",
        title: "결제 오류 문의",
        date: "2025-04-01 14:15:00",
        status: "답변 완료",
      },
    ],
    reseller: [
      {
        id: 1,
        userId: "reseller001",
        title: "재판매 계약 문의",
        date: "2025-04-01 09:20:00",
        status: "답변 대기",
      },
      {
        id: 2,
        userId: "partner123",
        title: "수수료 문의",
        date: "2025-04-01 11:45:00",
        status: "답변 완료",
      },
    ],
    shinhan: [
      {
        id: 1,
        userId: "shinhan_user",
        title: "신협 계좌 연동 문의",
        date: "2025-04-01 10:10:00",
        status: "답변 대기",
      },
      {
        id: 2,
        userId: "shin_merchant",
        title: "입금 지연 문의",
        date: "2025-04-01 13:25:00",
        status: "답변 완료",
      },
      {
        id: 3,
        userId: "shin_shop",
        title: "출금 한도 문의",
        date: "2025-04-01 15:40:00",
        status: "답변 대기",
      },
    ],
    jeju: [
      {
        id: 1,
        userId: "jeju_store",
        title: "제주은행 계좌 문의",
        date: "2025-04-01 09:50:00",
        status: "답변 완료",
      },
      {
        id: 2,
        userId: "jeju_merchant",
        title: "정산 일정 문의",
        date: "2025-04-01 14:30:00",
        status: "답변 대기",
      },
    ],
  };

  const tableRef = useRef<HTMLTableElement>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>(
    inquiriesByGroup[selectedGroup],
  );
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [answerStatus, setAnswerStatus] = useState("all");
  const [inquiryCategory, setInquiryCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [newInquiryCategory, setNewInquiryCategory] = useState("account");
  const [receiveNotification, setReceiveNotification] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Update inquiries when selected group changes
  useEffect(() => {
    setInquiries(inquiriesByGroup[selectedGroup]);
  }, [selectedGroup]);

  const handleDetailClick = (id: number) => {
    console.log(
      `${language === "en" ? "View details" : "상세보기"}: ${id}${language === "en" ? " inquiry" : "번 문의"}`,
    );
  };

  const handleReplyClick = (id: number) => {
    console.log(
      `${language === "en" ? "Reply to" : "답변하기"}: ${id}${language === "en" ? " inquiry" : "번 문의"}`,
    );
  };

  const handleInquiryClick = () => {
    setIsInquiryModalOpen(true);
  };

  const handleAdvancedFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(language === "en" ? "Inquiry submitted" : "문의 제출");
    setIsInquiryModalOpen(false);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(language === "en" ? "Filter applied" : "필터 적용");
    setIsFilterModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    if (tableRef.current) {
      const headers = tableRef.current.querySelectorAll("th");
      const cells = tableRef.current.querySelectorAll("td");

      headers.forEach((header) => {
        const element = header as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        `;
      });

      cells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        `;
      });

      // 테이블 레이아웃을 auto로 변경
      tableRef.current.style.tableLayout = "auto";
    }
  }, [inquiries]);

  // Translations for UI elements
  const t = {
    pageTitle: language === "en" ? "1:1 Inquiry Management" : "1:1 문의 관리",
    groupBanner:
      language === "en"
        ? `Currently showing inquiries from the ${translateGroupName(groupNames[selectedGroup], language)} group only.`
        : `현재 ${groupNames[selectedGroup]} 그룹의 문의만 표시하고 있습니다.`,
    viewAllInquiries:
      language === "en" ? "View All Inquiries" : "모든 문의 보기",
    showItems: (count: number) =>
      language === "en" ? `Show ${count}` : `${count}개 보기`,
    newInquiry: language === "en" ? "New Inquiry" : "문의하기",
    advanced: language === "en" ? "Advanced" : "상세조건",
    excel: language === "en" ? "Excel" : "엑셀",
    search: language === "en" ? "Search" : "검색",

    // Table headers
    no: language === "en" ? "No." : "번호",
    id: language === "en" ? "ID" : "아이디",
    title: language === "en" ? "Title" : "제목",
    registrationDate: language === "en" ? "Registration Date" : "등록일시",
    status: language === "en" ? "Status" : "상태",
    note: language === "en" ? "Note" : "비고",

    // Modal titles and descriptions
    newInquiryTitle: language === "en" ? "New Inquiry" : "문의하기",
    newInquiryDesc:
      language === "en"
        ? "Write a new inquiry. Click submit when you're done."
        : "새로운 문의를 작성하세요. 작성 후 제출 버튼을 클릭하세요.",
    advancedSearchTitle:
      language === "en" ? "Advanced Search" : "상세조건 검색",
    advancedSearchDesc:
      language === "en"
        ? "Set your desired search conditions."
        : "원하는 검색 조건을 설정하세요.",

    // Form labels
    inquiryType: language === "en" ? "Inquiry Type" : "문의유형",
    content: language === "en" ? "Content" : "내용",
    email: language === "en" ? "Email" : "이메일",
    attachment: language === "en" ? "Attachment" : "첨부파일",
    browse: language === "en" ? "Browse" : "찾기",
    receiveNotification:
      language === "en"
        ? "Receive email notification when answered"
        : "답변 완료 시 이메일로 알림 받기",

    // Button labels
    cancel: language === "en" ? "Cancel" : "취소",
    submit: language === "en" ? "Submit" : "제출",
    reset: language === "en" ? "Reset" : "초기화",
    apply: language === "en" ? "Apply" : "적용",

    // Select options
    accountInquiry: language === "en" ? "Account Inquiry" : "계정 문의",
    paymentInquiry: language === "en" ? "Payment Inquiry" : "결제 문의",
    serviceInquiry: language === "en" ? "Service Inquiry" : "서비스 문의",
    technicalInquiry: language === "en" ? "Technical Inquiry" : "기술 문의",
    other: language === "en" ? "Other" : "기타",

    // Advanced search form
    searchCriteria: language === "en" ? "Search Criteria" : "조회기준",
    questionDate: language === "en" ? "Question Date" : "질문일자",
    answerDate: language === "en" ? "Answer Date" : "답변일자",
    updateDate: language === "en" ? "Update Date" : "수정일자",
    startDate: language === "en" ? "Start Date" : "시작일",
    endDate: language === "en" ? "End Date" : "종료일",
    answerStatus: language === "en" ? "Answer Status" : "답변여부",
    all: language === "en" ? "All" : "전체",
    needed: language === "en" ? "Waiting" : "대기",
    completed: language === "en" ? "Completed" : "완료",
    sortOrder: language === "en" ? "Sort Order" : "정렬순서",
    latest: language === "en" ? "Latest" : "최신순",
    oldest: language === "en" ? "Oldest" : "오래된순",
    answeredFirst: language === "en" ? "Answered First" : "답변완료순",
    unansweredFirst: language === "en" ? "Unanswered First" : "미답변순",
    inquirerId: language === "en" ? "Inquirer ID" : "질문자 아이디",

    // Placeholders
    titlePlaceholder: language === "en" ? "Inquiry title" : "문의 제목",
    contentPlaceholder:
      language === "en" ? "Enter inquiry content" : "문의 내용을 입력하세요",
    emailPlaceholder:
      language === "en" ? "Email to receive reply" : "답변 받을 이메일",
    filePlaceholder: language === "en" ? "Select a file" : "파일을 선택하세요",
    userIdPlaceholder:
      language === "en" ? "Enter inquirer ID" : "질문자 아이디 입력",
    titleSearchPlaceholder: language === "en" ? "Enter title" : "제목 입력",
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">{t.pageTitle}</h2>
      </div>

      {/* Group filtering banner */}
      {selectedGroup !== "all" && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md flex items-center">
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t.groupBanner}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            onClick={() => window.location.reload()}
          >
            {t.viewAllInquiries}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center space-x-4">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue
                placeholder={
                  language === "ko" ? "등록일자" : "Registration Date"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="registrationDate">
                {language === "ko" ? "등록일자" : "Registration Date"}
              </SelectItem>
              <SelectItem value="answerDate">
                {language === "ko" ? "답변일자" : "Answer Date"}
              </SelectItem>
            </SelectContent>
          </Select>

          <DatePicker defaultValue={new Date("2025-04-01")} />

          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue
                placeholder={language === "ko" ? "상태" : "Status"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === "ko" ? "전체" : "All"}
              </SelectItem>
              <SelectItem value="answered">
                {language === "ko" ? "답변 완료" : "Answered"}
              </SelectItem>
              <SelectItem value="pending">
                {language === "ko" ? "답변 대기" : "Pending"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
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
          {/* 문의하기 버튼 */}
          <Button
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
            onClick={handleInquiryClick}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            {t.newInquiry}
          </Button>

          {/* 상세조건 버튼 */}
          <Button
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
            onClick={handleAdvancedFilterClick}
          >
            <Filter className="h-4 w-4 mr-1.5" />
            {t.advanced}
          </Button>

          {/* 엑셀 버튼 */}
          <Button
            variant="outline"
            className="ml-2 dark:border-gray-700 dark:text-gray-200"
          >
            <span className="mr-1">{t.excel}</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <table
        ref={tableRef}
        className="w-full text-sm sales-management-table"
        style={{ minWidth: "1100px", tableLayout: "auto" }}
      >
        <colgroup>
          <col style={{ width: "60px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "300px" }} />
          <col style={{ width: "180px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "180px" }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-3 px-4 text-left font-medium text-center">
              {t.no}
            </th>
            <th className="py-3 px-4 text-left font-medium text-center">
              {t.id}
            </th>
            <th className="py-3 px-4 text-left font-medium text-center">
              {t.title}
            </th>
            <th className="py-3 px-4 text-left font-medium text-center">
              {t.registrationDate}
            </th>
            <th className="py-3 px-4 text-left font-medium text-center">
              {t.status}
            </th>
            <th className="py-3 px-4 text-left font-medium text-center">
              {t.note}
            </th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr
              key={inquiry.id}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
              onClick={() => handleDetailClick(inquiry.id)}
            >
              <td className="py-3 px-4 text-center">{inquiry.id}</td>
              <td className="py-3 px-4 text-center">{inquiry.userId}</td>
              <td className="py-3 px-4 font-medium text-center text-blue-600 dark:text-blue-400">
                {language === "en"
                  ? translateTitle(inquiry.title, language)
                  : inquiry.title}
              </td>
              <td className="py-3 px-4 text-center">{inquiry.date}</td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(inquiry.status)}`}
                >
                  {language === "en"
                    ? translateStatus(inquiry.status, language)
                    : inquiry.status}
                </span>
              </td>
              <td className="py-3 px-4 text-center"></td>
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

      {/* New Inquiry Modal */}
      <Dialog open={isInquiryModalOpen} onOpenChange={setIsInquiryModalOpen}>
        <DialogContent className="sm:max-w-[520px] dark:bg-gray-800 dark:text-gray-100">
          <DialogHeader className="pb-2">
            <DialogTitle>{t.newInquiryTitle}</DialogTitle>
            <DialogDescription className="text-sm dark:text-gray-300">
              {t.newInquiryDesc}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInquirySubmit}>
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="title"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.title}
                </Label>
                <Input
                  id="title"
                  placeholder={t.titlePlaceholder}
                  className="col-span-4 h-9"
                />
              </div>

              <div className="grid grid-cols-5 items-start gap-3">
                <Label
                  htmlFor="content"
                  className="text-right text-sm col-span-1 pt-2 dark:text-gray-300"
                >
                  {t.content}
                </Label>
                <Textarea
                  id="content"
                  placeholder={t.contentPlaceholder}
                  className="col-span-4"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="email"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  className="col-span-4 h-9"
                />
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="file"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.attachment}
                </Label>
                <div className="col-span-4 flex items-center">
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                  />
                  <div className="flex-1 mr-2">
                    <Input
                      readOnly
                      value={selectedFile ? selectedFile.name : ""}
                      placeholder={t.filePlaceholder}
                      className="h-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9"
                    onClick={() => document.getElementById("file")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1.5" />
                    {t.browse}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <div className="col-span-1"></div>
                <div className="col-span-4 flex items-center space-x-2">
                  <Checkbox
                    id="notification"
                    checked={receiveNotification}
                    onCheckedChange={(checked) =>
                      setReceiveNotification(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="notification"
                    className="text-sm font-normal dark:text-gray-300"
                  >
                    {t.receiveNotification}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInquiryModalOpen(false)}
                className="h-9 w-24"
              >
                {t.cancel}
              </Button>
              <Button type="submit" className="h-9 w-24">
                {t.submit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Advanced Search Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="sm:max-w-[520px] dark:bg-gray-800 dark:text-gray-100">
          <DialogHeader className="pb-2 relative">
            <DialogTitle>{t.advancedSearchTitle}</DialogTitle>
            <DialogDescription className="text-sm dark:text-gray-300">
              {t.advancedSearchDesc}
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-8 w-8 rounded-full"
              onClick={() => setIsFilterModalOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          <form onSubmit={handleFilterSubmit}>
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="searchCriteria"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.searchCriteria}
                </Label>
                <Select defaultValue="questionDate">
                  <SelectTrigger id="searchCriteria" className="col-span-4 h-9">
                    <SelectValue placeholder={t.searchCriteria} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="questionDate">
                      {t.questionDate}
                    </SelectItem>
                    <SelectItem value="answerDate">{t.answerDate}</SelectItem>
                    <SelectItem value="updateDate">{t.updateDate}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label className="text-right text-sm col-span-1 dark:text-gray-300">
                  {t.startDate}
                </Label>
                <div className="col-span-4">
                  <DatePicker
                    defaultValue={startDate}
                    onChange={setStartDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label className="text-right text-sm col-span-1 dark:text-gray-300">
                  {t.endDate}
                </Label>
                <div className="col-span-4">
                  <DatePicker defaultValue={endDate} onChange={setEndDate} />
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="answerStatus"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.answerStatus}
                </Label>
                <Select value={answerStatus} onValueChange={setAnswerStatus}>
                  <SelectTrigger id="answerStatus" className="col-span-4 h-9">
                    <SelectValue placeholder={t.answerStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="completed">{t.completed}</SelectItem>
                    <SelectItem value="needed">{t.needed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="sortOrder"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.sortOrder}
                </Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sortOrder" className="col-span-4 h-9">
                    <SelectValue placeholder={t.sortOrder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">{t.latest}</SelectItem>
                    <SelectItem value="oldest">{t.oldest}</SelectItem>
                    <SelectItem value="answered">{t.answeredFirst}</SelectItem>
                    <SelectItem value="unanswered">
                      {t.unansweredFirst}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="userId"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.inquirerId}
                </Label>
                <Input
                  id="userId"
                  placeholder={t.userIdPlaceholder}
                  className="col-span-4 h-9"
                />
              </div>

              <div className="grid grid-cols-5 items-center gap-3">
                <Label
                  htmlFor="inquiryTitle"
                  className="text-right text-sm col-span-1 dark:text-gray-300"
                >
                  {t.title}
                </Label>
                <Input
                  id="inquiryTitle"
                  placeholder={t.titleSearchPlaceholder}
                  className="col-span-4 h-9"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFilterModalOpen(false)}
                className="h-9 w-24"
              >
                {t.reset}
              </Button>
              <Button type="submit" className="h-9 w-24">
                {t.apply}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
