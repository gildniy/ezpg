"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Calendar,
  Filter,
  User,
  Building,
  CreditCard,
  ListFilter,
} from "lucide-react";
import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { useLanguage } from "@ezpg/hooks";
import { TableContainer } from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";
import { Input } from "@ezpg/ui";
import { Dialog, DialogContent } from "@ezpg/ui";
import { useNavigation } from "@/contexts/navigation-context";
import { format } from "date-fns";
import { DatePicker } from "@ezpg/ui";
import { ko } from "date-fns/locale";

// 그룹별 입금내역 데이터 정의
const depositData = {
  all: [
    {
      id: 1,
      date: "2025/04/01 12:09:53",
      merchant: "atglobal",
      company: "atglobal",
      orderId: "4kay-JYWG",
      bank: "K-BANK",
      account: "7016800761066",
      userName: "최유나",
      userId: "choiyuna",
      depositor: "Choi You Na",
      amount: "90,000",
      settlementAmount: "85,545",
      companyFee: "4,455",
      agentFee: "4,454",
      note: "정상 처리",
      withdrawalBank: "우리은행",
      withdrawalAccount: "1002-123-456789",
      fee1: "1,200",
      fee2: "800",
      status: "성공", // 상태 추가
    },
    {
      id: 2,
      date: "2025/04/01 11:50:48",
      merchant: "sticpay",
      company: "sticpay",
      orderId: "149933",
      bank: "K-BANK",
      account: "7016800761033",
      userName: "이우주",
      userId: "woojoolee",
      depositor: "WOOJOO LEE",
      amount: "79,000",
      settlementAmount: "78,453",
      companyFee: "547",
      agentFee: "545",
      note: "정상 처리",
      withdrawalBank: "국민은행",
      withdrawalAccount: "123-45-6789012",
      fee1: "950",
      fee2: "650",
      status: "실패", // 상태 추가
    },
  ],
  reseller: [
    {
      id: 1,
      date: "2025/04/01 12:09:53",
      merchant: "테라시스A",
      company: "테라시스",
      orderId: "4kay-JYWG",
      bank: "K-BANK",
      account: "7016800761066",
      userName: "최유나",
      userId: "choiyuna",
      depositor: "Choi You Na",
      amount: "90,000",
      settlementAmount: "85,545",
      companyFee: "4,455",
      agentFee: "4,454",
      note: "정상 처리",
      withdrawalBank: "신한은행",
      withdrawalAccount: "110-123-456789",
      fee1: "1,100",
      fee2: "900",
      status: "타임아웃", // 상태 추가
    },
    {
      id: 2,
      date: "2025/04/01 11:50:48",
      merchant: "테라시스B",
      company: "테라시스",
      orderId: "149933",
      bank: "K-BANK",
      account: "7016800761033",
      userName: "이우주",
      userId: "woojoolee",
      depositor: "WOOJOO LEE",
      amount: "79,000",
      settlementAmount: "78,453",
      companyFee: "547",
      agentFee: "545",
      note: "정상 처리",
      withdrawalBank: "하나은행",
      withdrawalAccount: "123-456789-01-234",
      fee1: "850",
      fee2: "750",
      status: "성공", // 상태 추가
    },
  ],
  shinhan: [
    {
      id: 1,
      date: "2025/04/01 12:09:53",
      merchant: "신한가맹점A",
      company: "신한은행",
      orderId: "SH-1234",
      bank: "신한은행",
      account: "110-232-990123",
      userName: "김신한",
      userId: "kimshinhan",
      depositor: "김신한",
      amount: "150,000",
      settlementAmount: "142,500",
      companyFee: "7,500",
      agentFee: "7,500",
      note: "정상 처리",
      withdrawalBank: "신한은행",
      withdrawalAccount: "110-987-654321",
      fee1: "2,500",
      fee2: "1,500",
      status: "성공", // 상태 추가
    },
    {
      id: 2,
      date: "2025/04/01 11:50:48",
      merchant: "신한가맹점B",
      company: "신한은행",
      orderId: "SH-5678",
      bank: "신한은행",
      account: "110-345-678901",
      userName: "이신한",
      userId: "leeshinhan",
      depositor: "이신한",
      amount: "200,000",
      settlementAmount: "190,000",
      companyFee: "10,000",
      agentFee: "10,000",
      note: "정상 처리",
      withdrawalBank: "신한은행",
      withdrawalAccount: "110-456-789123",
      fee1: "3,000",
      fee2: "2,000",
      status: "실패", // 상태 추가
    },
  ],
  jeju: [
    {
      id: 1,
      date: "2025/04/01 12:09:53",
      merchant: "제주가맹점A",
      company: "제주은행",
      orderId: "JJ-9876",
      bank: "제주은행",
      account: "123-456-789012",
      userName: "김제주",
      userId: "kimjeju",
      depositor: "김제주",
      amount: "120,000",
      settlementAmount: "114,000",
      companyFee: "6,000",
      agentFee: "6,000",
      note: "정상 처리",
      withdrawalBank: "제주은행",
      withdrawalAccount: "123-456-789123",
      fee1: "1,800",
      fee2: "1,200",
      status: "타임아웃", // 상태 추가
    },
    {
      id: 2,
      date: "2025/04/01 11:50:48",
      merchant: "제주가맹점B",
      company: "제주은행",
      orderId: "JJ-5432",
      bank: "제주은행",
      account: "123-567-890123",
      userName: "이제주",
      userId: "leejeju",
      depositor: "이제주",
      amount: "180,000",
      settlementAmount: "171,000",
      companyFee: "9,000",
      agentFee: "9,000",
      note: "정상 처리",
      withdrawalBank: "제주은행",
      withdrawalAccount: "123-789-456123",
      fee1: "2,700",
      fee2: "1,800",
      status: "성공", // 상태 추가
    },
  ],
};

// 그룹별 통계 데이터
const statsData = {
  all: {
    count: "6건",
    amount: "2,858,258원",
    fee: "107,323원",
    integratedFee: "214,653원",
    settlementAmount: "2,643,605원",
  },
  reseller: {
    count: "4건",
    amount: "1,500,000원",
    fee: "75,000원",
    integratedFee: "150,000원",
    settlementAmount: "1,425,000원",
  },
  shinhan: {
    count: "5건",
    amount: "2,500,000원",
    fee: "125,000원",
    integratedFee: "250,000원",
    settlementAmount: "2,375,000원",
  },
  jeju: {
    count: "3건",
    amount: "1,800,000원",
    fee: "90,000원",
    integratedFee: "180,000원",
    settlementAmount: "1,710,000원",
  },
};

export function SalesManagementContent() {
  const { t, language } = useLanguage();
  const { selectedGroup } = useNavigation();
  const tableRef = useRef<HTMLTableElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date("2025-04-01"));
  const [endDate, setEndDate] = useState<Date>(new Date("2025-04-01"));

  // 선택된 그룹에 따라 데이터 필터링
  const filteredData = depositData[selectedGroup] || depositData.all;
  const stats = statsData[selectedGroup] || statsData.all;

  // 상태에 따른 배지 스타일 반환 함수
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "성공":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "실패":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "타임아웃":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // 상태에 따른 텍스트 반환 함수
  const getStatusText = (status: string) => {
    if (language === "ko") return status;

    switch (status) {
      case "성공":
        return "Success";
      case "실패":
        return "Failed";
      case "타임아웃":
        return "Timeout";
      default:
        return status;
    }
  };

  // 은행 이름 번역 함수
  const translateBankName = (bankName: string) => {
    if (language === "ko") return bankName;

    const bankTranslations: Record<string, string> = {
      우리은행: "Woori Bank",
      국민은행: "KB Bank",
      신한은행: "Shinhan Bank",
      하나은행: "Hana Bank",
      제주은행: "Jeju Bank",
      "K-BANK": "K-BANK",
    };

    return bankTranslations[bankName] || bankName;
  };

  // 회사/가맹점 이름 번역 함수
  const translateCompanyName = (name: string) => {
    if (language === "ko") return name;

    const companyTranslations: Record<string, string> = {
      테라시스: "Terasis",
      테라시스A: "Terasis A",
      테라시스B: "Terasis B",
      신한가맹점A: "Shinhan Merchant A",
      신한가맹점B: "Shinhan Merchant B",
      제주가맹점A: "Jeju Merchant A",
      제주가맹점B: "Jeju Merchant B",
      신한은행: "Shinhan Bank",
      제주은행: "Jeju Bank",
    };

    return companyTranslations[name] || name;
  };

  // 메모 번역 함수
  const translateNote = (note: string) => {
    if (language === "ko") return note;

    const noteTranslations: Record<string, string> = {
      "정상 처리": "Processed normally",
    };

    return noteTranslations[note] || note;
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
  }, [filteredData]);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">
          {language === "ko" ? "입금내역" : "Deposit History"}
        </h2>
      </div>

      <div className="flex items-center justify-between space-x-4 mb-4">
        <div className="flex items-center space-x-4">
          <DatePicker defaultValue={new Date("2025-04-01")} />
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
          <Button
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
            onClick={() => setSearchOpen(true)}
          >
            {language === "ko" ? "상세조건" : "Advanced Search"}
          </Button>

          <Button
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <span className="mr-1">{t("excel")}</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 통계 항목 - 보기와 테이블 사이로 이동 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {language === "ko" ? "입금 건수" : "Deposit Count"}
          </div>
          <div className="text-lg font-bold mt-1">
            {language === "ko"
              ? stats.count
              : stats.count.replace("건", " cases")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {language === "ko" ? "입금 금액" : "Deposit Amount"}
          </div>
          <div className="text-lg font-bold mt-1">
            {language === "ko"
              ? stats.amount
              : stats.amount.replace("원", " KRW")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {language === "ko" ? "수수료" : "Fee"}
          </div>
          <div className="text-lg font-bold mt-1">
            {language === "ko" ? stats.fee : stats.fee.replace("원", " KRW")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {language === "ko"
              ? "가맹점정산 금액"
              : "Merchant Settlement Amount"}
          </div>
          <div className="text-lg font-bold mt-1">
            {language === "ko"
              ? stats.settlementAmount
              : stats.settlementAmount.replace("원", " KRW")}
          </div>
        </div>
      </div>

      <TableContainer minWidth="1500px">
        <table ref={tableRef} className="w-full text-sm sales-management-table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium">
                {t("number")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {language === "ko" ? "주문번호" : "Order Number"}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {t("depositDate")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {t("merchant")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {t("company")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {t("depositBank")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {t("virtualAccount")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {language === "ko" ? "유저명" : "User Name"}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {language === "ko" ? "유저아이디" : "User ID"}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {t("depositor")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {language === "ko" ? "출금은행" : "Withdrawal Bank"}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {language === "ko" ? "출금계좌" : "Withdrawal Account"}
              </th>
              <th className="py-3 px-4 text-right font-medium">
                {t("depositAmount")}
              </th>
              <th className="py-3 px-4 text-right font-medium">
                {t("settlementAmount")}
              </th>
              <th className="py-3 px-4 text-center font-medium">
                {language === "ko" ? "상태보기" : "Status"}
              </th>
              <th className="py-3 px-4 text-left font-medium">{t("note")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="py-3 px-4 text-center">{item.id}</td>
                <td className="py-3 px-4 text-center">{item.orderId}</td>
                <td className="py-3 px-4 text-center">{item.date}</td>
                <td className="py-3 px-4 text-center">
                  {translateCompanyName(item.merchant)}
                </td>
                <td className="py-3 px-4 text-center">
                  {translateCompanyName(item.company)}
                </td>
                <td className="py-3 px-4 text-center">
                  {translateBankName(item.bank)}
                </td>
                <td className="py-3 px-4 text-center">{item.account}</td>
                <td className="py-3 px-4 text-center">
                  {language === "ko" ? item.userName : item.depositor}
                </td>
                <td className="py-3 px-4 text-center">{item.userId}</td>
                <td className="py-3 px-4 text-center">{item.depositor}</td>
                <td className="py-3 px-4 text-center">
                  {translateBankName(item.withdrawalBank)}
                </td>
                <td className="py-3 px-4 text-center">
                  {item.withdrawalAccount}
                </td>
                <td className="py-3 px-4 text-center">{item.amount}</td>
                <td className="py-3 px-4 text-center">
                  {item.settlementAmount}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(item.status)}`}
                  >
                    {getStatusText(item.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-left"></td>
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
      </TableContainer>

      {/* 상세조건 모달 - 버튼 클릭 시 바로 열림 */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-lg p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {language === "ko" ? "상세조건" : "Advanced Search"}
                </span>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* 조회기준 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <ListFilter className="h-4 w-4 inline mr-2" />
                  {language === "ko" ? "조회기준" : "Search Criteria"}
                </div>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700">
                      <SelectValue
                        placeholder={
                          language === "ko" ? "입금일자" : "Deposit Date"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="depositDate">
                        {language === "ko" ? "입금일자" : "Deposit Date"}
                      </SelectItem>
                      <SelectItem value="cancelDate">
                        {language === "ko" ? "취소일자" : "Cancel Date"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 조회기간 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  {language === "ko" ? "조회기간" : "Search Period"}
                </div>
                <div className="col-span-3 flex items-center space-x-2">
                  <div className="relative flex-1">
                    <DatePicker
                      value={startDate}
                      onChange={(date) => date && setStartDate(date)}
                    />
                  </div>
                  <span className="text-gray-500">~</span>
                  <div className="relative flex-1">
                    <DatePicker
                      value={endDate}
                      onChange={(date) => date && setEndDate(date)}
                    />
                  </div>
                </div>
              </div>

              {/* 입금자명 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4 inline mr-2" />
                  {language === "ko" ? "입금자명" : "Depositor Name"}
                </div>
                <div className="col-span-3">
                  <Input
                    type="text"
                    placeholder={
                      language === "ko"
                        ? "입금자명을 입력하세요."
                        : "Enter depositor name."
                    }
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* 입금금액 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  {language === "ko" ? "입금금액" : "Deposit Amount"}
                </div>
                <div className="col-span-3">
                  <Input
                    type="text"
                    placeholder={
                      language === "ko"
                        ? "입금금액을 입력하세요."
                        : "Enter deposit amount."
                    }
                    className="w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* 가맹점명 선택 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Building className="h-4 w-4 inline mr-2" />
                  {language === "ko" ? "가맹점명" : "Merchant Name"}
                </div>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700">
                      <SelectValue
                        placeholder={language === "ko" ? "전체" : "All"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "ko" ? "전체" : "All"}
                      </SelectItem>
                      <SelectItem value="test01">test01</SelectItem>
                      <SelectItem value="test02">test02</SelectItem>
                      <SelectItem value="test03">test03</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 상태 선택 추가 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <ListFilter className="h-4 w-4 inline mr-2" />
                  {language === "ko" ? "상태" : "Status"}
                </div>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all dark:border-gray-600 dark:bg-gray-700">
                      <SelectValue
                        placeholder={language === "ko" ? "전체" : "All"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === "ko" ? "전체" : "All"}
                      </SelectItem>
                      <SelectItem value="success">
                        {language === "ko" ? "성공" : "Success"}
                      </SelectItem>
                      <SelectItem value="failed">
                        {language === "ko" ? "실패" : "Failed"}
                      </SelectItem>
                      <SelectItem value="timeout">
                        {language === "ko" ? "타임아웃" : "Timeout"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 p-4 text-center text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                {language === "ko" ? "초기화" : "Reset"}
              </button>
              <button
                className="flex-1 p-4 text-center text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                onClick={() => setSearchOpen(false)}
              >
                {language === "ko" ? "조회" : "Search"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
