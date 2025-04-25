"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import type React from "react";

import { useNavigation, groupNames } from "@/contexts/navigation-context";
import { useLanguage } from "@ezpg/hooks";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Building,
  User,
  Filter,
  ArrowDownCircle,
  CreditCard,
  Wallet,
  ChevronsRight,
  FileText,
  Globe,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { DatePicker } from "@ezpg/ui";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@ezpg/ui";
import { Checkbox } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ezpg/ui";
import { Switch } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { Textarea } from "@ezpg/ui";
import { RadioGroup, RadioGroupItem } from "@ezpg/ui";
import { Card, CardContent } from "@ezpg/ui";
import { TableContainer } from "@ezpg/ui";
import { format } from "date-fns";

// 그룹 이름 번역 함수
const translateGroupName = (name: string, lang: string) => {
  if (lang === "ko") return name;

  switch (name) {
    case "전체보기":
      return "All Groups";
    case "신협은행":
      return "Shinhan Bank";
    case "재판매(테라시스)":
      return "Reseller (Terasis)";
    case "제주은행":
      return "Jeju Bank";
    default:
      return name;
  }
};

// 한국 은행 목록
const koreanBanks = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "NH농협은행",
  "IBK기업은행",
  "SC제일은행",
  "씨티은행",
  "KDB산업은행",
  "케이뱅크",
  "카카오뱅크",
  "토스뱅크",
  "SBI저축은행",
  "새마을금고",
  "신협",
  "우체국",
  "수협은행",
  "대구은행",
  "부산은행",
  "경남은행",
  "광주은행",
  "전북은행",
  "제주은행",
];

// 영문 은행 이름
const englishBanks = [
  "KB Kookmin Bank",
  "Shinhan Bank",
  "Woori Bank",
  "Hana Bank",
  "NH Nonghyup Bank",
  "IBK Industrial Bank of Korea",
  "SC First Bank",
  "Citibank Korea",
  "KDB Korea Development Bank",
  "K Bank",
  "Kakao Bank",
  "Toss Bank",
  "SBI Savings Bank",
  "MG Community Credit Cooperatives",
  "Credit Union",
  "Korea Post",
  "Suhyup Bank",
  "Daegu Bank",
  "Busan Bank",
  "Kyongnam Bank",
  "Gwangju Bank",
  "Jeonbuk Bank",
  "Jeju Bank",
];

// 그룹별 더미 데이터 생성 함수
const generateDummyDataByGroup = (group: string) => {
  const banks = [
    "KAKAO BANK",
    "KOOKMIN BANK",
    "SHINHAN BANK",
    "WOORI BANK",
    "HANA BANK",
    "NATIONAL AGRICULTURAL",
    "IBK BANK",
    "TOSS BANK",
  ];
  const statuses = ["성공", "실패", "타임아웃"];
  const withdrawalStatuses = ["성공", "실패", "타임아웃"];
  const withdrawalMethods = ["원화출금", "외화출금"];
  const notes = ["", "", "", "", "", ""];

  // 그룹별 이름 데이터
  const namesByGroup: Record<string, string[]> = {
    전체보기: [
      "김민준",
      "이지우",
      "박서준",
      "최예준",
      "정도윤",
      "강지호",
      "조민재",
      "윤건우",
      "장현우",
      "임지훈",
      "한승우",
      "오동현",
      "서지환",
      "신준서",
      "함동오",
      "이승은",
      "최호원",
    ],
    신협은행: [
      "김신협",
      "이신협",
      "박신협",
      "최신협",
      "정신협",
      "강신협",
      "조신협",
      "윤신협",
      "장신협",
      "임신협",
      "한신협",
    ],
    "재판매(테라시스)": [
      "김테라",
      "이테라",
      "박테라",
      "최테라",
      "정테라",
      "강테라",
      "조테라",
      "윤테라",
      "장테라",
      "임테라",
      "한테라",
    ],
    제주은행: [
      "김제주",
      "이제주",
      "박제주",
      "최제주",
      "정제주",
      "강제주",
      "조제주",
      "윤제주",
      "장제주",
      "임제주",
      "한제주",
    ],
  };

  const data = [];

  // 그룹별 기본 데이터 추가
  if (group === "신협은행" || group === "전체보기") {
    data.push({
      number: 1,
      requestDate: "2023/01/15 14:30:22",
      merchantName: "신협상점",
      accountHolder: "김신협",
      accountNumber: "110-123-456789",
      ipAddress: "192.168.1.101",
      amount: 1500000,
      withdrawalStatus: "성공",
      withdrawalDate: "2023/01/16 10:15:33",
      withdrawalMethod: "원화출금",
      id: "신협001",
      name: "김신협",
      phone: "010-1234-5678",
      withdrawBank: "KAKAO BANK",
      withdrawAccount: "3333022954291",
      depositBank: "SHINHAN BANK",
      depositAccount: "110-123-456789",
      joinDate: "2023/01/15",
      status: "성공",
      note: "",
      group: "신협은행",
    });
  }

  if (group === "재판매(테라시스)" || group === "전체보기") {
    data.push({
      number: 2,
      requestDate: "2023/02/20 09:45:11",
      merchantName: "테라시스상점",
      accountHolder: "최테라",
      accountNumber: "123-45-6789012",
      ipAddress: "192.168.1.102",
      amount: 2300000,
      withdrawalStatus: "실패",
      withdrawalDate: "",
      withdrawalMethod: "원화출금",
      id: "테라002",
      name: "최테라",
      phone: "010-9876-5432",
      withdrawBank: "NATIONAL AGRICULTURAL",
      withdrawAccount: "3511063044233",
      depositBank: "KOOKMIN BANK",
      depositAccount: "123-45-6789012",
      joinDate: "2023/02/20",
      status: "실패",
      note: "",
      group: "재판매(테라시스)",
    });
  }

  if (group === "제주은행" || group === "전체보기") {
    data.push({
      number: 3,
      requestDate: "2023/03/05 16:20:45",
      merchantName: "제주상점",
      accountHolder: "이제주",
      accountNumber: "1002-456-789123",
      ipAddress: "192.168.1.103",
      amount: 3500000,
      withdrawalStatus: "타임아웃",
      withdrawalDate: "",
      withdrawalMethod: "외화출금",
      id: "제주003",
      name: "이제주",
      phone: "010-2345-6789",
      withdrawBank: "KOOKMIN BANK",
      withdrawAccount: "01250204238622",
      depositBank: "WOORI BANK",
      depositAccount: "1002-456-789123",
      joinDate: "2023/03/05",
      status: "타임아웃",
      note: "",
      group: "제주은행",
    });
  }

  // 추가 데이터 생성 (그룹별로 다른 데이터)
  const count = group === "전체보기" ? 35 : 15;

  // 그룹별로 다른 이름 사용
  const names = namesByGroup[group] || namesByGroup["전체보기"];

  for (let i = 4; i <= count; i++) {
    const withdrawalStatus =
      withdrawalStatuses[Math.floor(Math.random() * withdrawalStatuses.length)];
    const status = withdrawalStatus; // status를 withdrawalStatus와 동일하게 설정
    const withdrawalMethod =
      withdrawalMethods[Math.floor(Math.random() * withdrawalMethods.length)];
    const withdrawBank = banks[Math.floor(Math.random() * banks.length)];
    const depositBank = banks[Math.floor(Math.random() * banks.length)];
    const note = notes[Math.floor(Math.random() * notes.length)];
    const name = names[Math.floor(Math.random() * names.length)];

    // 가입 날짜 생성 (2022년 1월 ~ 2023년 12월 사이)
    const year = Math.random() < 0.7 ? 2023 : 2022;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const joinDate = `${year}/${month.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;

    // 신청일시 생성
    const requestHour = Math.floor(Math.random() * 24);
    const requestMinute = Math.floor(Math.random() * 60);
    const requestSecond = Math.floor(Math.random() * 60);
    const requestDate = `${joinDate} ${requestHour.toString().padStart(2, "0")}:${requestMinute.toString().padStart(2, "0")}:${requestSecond.toString().padStart(2, "0")}`;

    // 출금일시 생성 (성공 상태인 경우만)
    let withdrawalDate = "";
    if (withdrawalStatus === "성공") {
      const withdrawalDay = Math.min(
        day + Math.floor(Math.random() * 3) + 1,
        28,
      );
      const withdrawalHour = Math.floor(Math.random() * 24);
      const withdrawalMinute = Math.floor(Math.random() * 60);
      const withdrawalSecond = Math.floor(Math.random() * 60);
      withdrawalDate = `${year}/${month.toString().padStart(2, "0")}/${withdrawalDay.toString().padStart(2, "0")} ${withdrawalHour.toString().padStart(2, "0")}:${withdrawalMinute.toString().padStart(2, "0")}:${withdrawalSecond.toString().padStart(2, "0")}`;
    }

    // 전화번호 생성
    const middleNum = Math.floor(Math.random() * 9000) + 1000;
    const lastNum = Math.floor(Math.random() * 9000) + 1000;
    const phone = `010-${middleNum}-${lastNum}`;

    // 계좌번호 생성
    const withdrawAccount = Math.floor(
      Math.random() * 10000000000000,
    ).toString();
    const depositAccount = Math.floor(
      Math.random() * 10000000000000,
    ).toString();
    const accountNumber =
      Math.random() < 0.5
        ? `${Math.floor(Math.random() * 1000)}-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10000000)}`
        : `${Math.floor(Math.random() * 10000000000000)}`;

    // IP 주소 생성
    const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    // 금액 생성 (100만원 ~ 1000만원)
    const amount = Math.floor(Math.random() * 9000000) + 1000000;

    // 그룹별 ID 접두사 설정
    let idPrefix = "user";
    let merchantPrefix = "상점";
    if (group === "신협은행") {
      idPrefix = "신협";
      merchantPrefix = "신협상점";
    } else if (group === "재판매(테라시스)") {
      idPrefix = "테라";
      merchantPrefix = "테라시스상점";
    } else if (group === "제주은행") {
      idPrefix = "제주";
      merchantPrefix = "제주상점";
    }

    data.push({
      number: i,
      requestDate: requestDate,
      merchantName: `${merchantPrefix}${i}`,
      accountHolder: name,
      accountNumber: accountNumber,
      ipAddress: ipAddress,
      amount: amount,
      withdrawalStatus: withdrawalStatus,
      withdrawalDate: withdrawalDate,
      withdrawalMethod: withdrawalMethod,
      id: `${idPrefix}${i.toString().padStart(3, "0")}`,
      name: name,
      phone: phone,
      withdrawBank: withdrawBank,
      withdrawAccount: withdrawAccount,
      depositBank: depositBank,
      depositAccount: depositAccount,
      joinDate: joinDate,
      status: status,
      note: note,
      group: group,
    });
  }

  return data;
};

// 그룹별 통계 데이터
const getStatsByGroup = (group: string) => {
  // 그룹별로 다른 통계 데이터 반환
  switch (group) {
    case "신협은행":
      return {
        currentBalance: 8500000,
        availableWithdrawalAmount: 6200000,
        settlementBalance: 5100000,
        foreignCurrencyAmount: 4500,
      };
    case "재판매(테라시스)":
      return {
        currentBalance: 6300000,
        availableWithdrawalAmount: 4800000,
        settlementBalance: 3700000,
        foreignCurrencyAmount: 2800,
      };
    case "제주은행":
      return {
        currentBalance: 9200000,
        availableWithdrawalAmount: 7500000,
        settlementBalance: 6300000,
        foreignCurrencyAmount: 5200,
      };
    case "전체보기":
    default:
      return {
        currentBalance: 7500000,
        availableWithdrawalAmount: 5000000,
        settlementBalance: 4200000,
        foreignCurrencyAmount: 3000,
      };
  }
};

// 은행 목록 - 테이블 데이터에서 추출
const getBankListFromData = (data: any[]) => {
  // 데이터에서 고유한 은행 이름 추출
  const uniqueBanks = new Set<string>();

  // depositBank 필드에서 은행 이름 추출
  data.forEach((item) => {
    if (item.depositBank) {
      uniqueBanks.add(item.depositBank);
    }
  });

  // Set을 배열로 변환하고 정렬
  return Array.from(uniqueBanks).sort();
};

// 지정 계좌 정보 (그룹별로 다른 정보)
const getDesignatedAccountInfo = (group: string) => {
  switch (group) {
    case "신협은행":
      return {
        bank: "SHINHAN BANK",
        accountNumber: "110-123-456789",
        accountHolder: "신협정산계좌",
      };
    case "재판매(테라시스)":
      return {
        bank: "KOOKMIN BANK",
        accountNumber: "123-45-6789012",
        accountHolder: "테라시스정산계좌",
      };
    case "제주은행":
      return {
        bank: "WOORI BANK",
        accountNumber: "1002-456-789123",
        accountHolder: "제주은행정산계좌",
      };
    case "전체보기":
    default:
      return {
        bank: "KAKAO BANK",
        accountNumber: "3333-02-2954291",
        accountHolder: "기본정산계좌",
      };
  }
};

// 출금 상태 번역 함수
const translateStatus = (status: string, lang: string) => {
  if (lang === "ko") return status;

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

// 출금 방식 번역 함수
const translateWithdrawalMethod = (method: string, lang: string) => {
  if (lang === "ko") return method;

  switch (method) {
    case "원화출금":
      return "KRW Withdrawal";
    case "외화출금":
      return "Foreign Currency Withdrawal";
    case "정산":
      return "Settlement";
    default:
      return method;
  }
};

// 가맹점 이름 번역 함수
const translateMerchantName = (name: string, lang: string) => {
  if (lang === "ko") return name;

  if (name.includes("신협상점")) {
    return name.replace("신협상점", "Shinhan Merchant");
  } else if (name.includes("테라시스상점")) {
    return name.replace("테라시스상점", "Terasis Merchant");
  } else if (name.includes("제주상점")) {
    return name.replace("제주상점", "Jeju Merchant");
  }
  return name;
};

// 이름 번역 함수
const translateName = (name: string, lang: string) => {
  if (lang === "ko") return name;

  // 간단한 이름 번역 예시
  if (name.includes("김")) {
    return name.replace("김", "Kim ");
  } else if (name.includes("이")) {
    return name.replace("이", "Lee ");
  } else if (name.includes("박")) {
    return name.replace("박", "Park ");
  } else if (name.includes("최")) {
    return name.replace("최", "Choi ");
  } else if (name.includes("정")) {
    return name.replace("정", "Jung ");
  }
  return name;
};

// 비고 번역 함수
const translateNote = (note: string, lang: string) => {
  if (lang === "ko") return note;

  switch (note) {
    case "VIP 고객":
      return "VIP Customer";
    case "신규 가입자":
      return "New Member";
    case "휴면 계정":
      return "Dormant Account";
    case "특이사항 없음":
      return "No Special Notes";
    case "요주의 고객":
      return "Customer Requiring Attention";
    default:
      return note;
  }
};

export function MerchantWithdrawalContent() {
  const router = useRouter();
  const tableRef = useRef<HTMLTableElement>(null);
  const [showStats, setShowStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("statistics");
  const [withdrawalMethod, setWithdrawalMethod] = useState("원화출금");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [foreignWithdrawalAmount, setForeignWithdrawalAmount] = useState("");
  const [withdrawalNote, setWithdrawalNote] = useState("");
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [detailFilterOpen, setDetailFilterOpen] = useState(false);

  const { selectedGroup } = useNavigation();
  const { language } = useLanguage();

  // 상세조건 필터 상태
  const [searchCriteria, setSearchCriteria] = useState("requestDate");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchCategory, setSearchCategory] = useState("merchantName");
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // 선택된 그룹에 따른 더미 데이터 생성
  const allData = useMemo(
    () => generateDummyDataByGroup(groupNames[selectedGroup]),
    [selectedGroup],
  );

  // 현재 페이지 데이터
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allData.slice(startIndex, startIndex + itemsPerPage);
  }, [allData, currentPage, itemsPerPage]);

  // 선택된 그룹에 따른 통계 데이터
  const stats = useMemo(() => {
    const groupStats = getStatsByGroup(groupNames[selectedGroup]);

    const totalCount = allData.length;
    const successCount = allData.filter(
      (item) => item.status === "성공",
    ).length;
    const failedCount = allData.filter((item) => item.status === "실패").length;
    const timeoutCount = allData.filter(
      (item) => item.status === "타임아웃",
    ).length;

    // 최근 30일 이내 가입자 수 계산
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newMembersCount = allData.filter((item) => {
      const joinDate = new Date(item.joinDate);
      return joinDate >= thirtyDaysAgo;
    }).length;

    return {
      ...groupStats,
      totalCount,
      successCount,
      failedCount,
      timeoutCount,
      newMembersCount,
    };
  }, [allData, selectedGroup]);

  // 언어에 따른 은행 목록 선택
  const bankList = useMemo(() => koreanBanks, []);

  // 지정 계좌 정보
  const designatedAccount = useMemo(
    () => getDesignatedAccountInfo(groupNames[selectedGroup]),
    [selectedGroup],
  );

  // tableColumns 배열에서 승인여부 컬럼 제거
  const [tableColumns, setTableColumns] = useState([
    { id: 1, label: language === "ko" ? "번호" : "No.", checked: true },
    {
      id: 2,
      label: language === "ko" ? "신청일시" : "Request Date",
      checked: true,
    },
    { id: 3, label: language === "ko" ? "가맹점" : "Merchant", checked: true },
    {
      id: 4,
      label: language === "ko" ? "예금주" : "Account Holder",
      checked: true,
    },
    { id: 5, label: language === "ko" ? "은행" : "Bank", checked: true },
    {
      id: 6,
      label: language === "ko" ? "계좌번호" : "Account Number",
      checked: true,
    },
    { id: 7, label: language === "ko" ? "금액" : "Amount", checked: true },
    { id: 8, label: language === "ko" ? "상태" : "Status", checked: false },
    {
      id: 9,
      label: language === "ko" ? "출금일시" : "Withdrawal Date",
      checked: true,
    },
    {
      id: 10,
      label: language === "ko" ? "출금방식" : "Withdrawal Method",
      checked: true,
    },
    { id: 11, label: language === "ko" ? "아이디" : "ID", checked: false },
    { id: 12, label: language === "ko" ? "실명" : "Name", checked: false },
    { id: 13, label: language === "ko" ? "휴대폰" : "Phone", checked: false },
    {
      id: 14,
      label: language === "ko" ? "출금은행" : "Withdrawal Bank",
      checked: false,
    },
    {
      id: 15,
      label: language === "ko" ? "출금계좌번호" : "Withdrawal Account",
      checked: false,
    },
    {
      id: 16,
      label: language === "ko" ? "입금은행" : "Deposit Bank",
      checked: false,
    },
    {
      id: 17,
      label: language === "ko" ? "입금계좌번호" : "Deposit Account",
      checked: false,
    },
    {
      id: 18,
      label: language === "ko" ? "가입날짜" : "Join Date",
      checked: false,
    },
    { id: 19, label: language === "ko" ? "상태" : "Status", checked: true },
    { id: 20, label: language === "ko" ? "비고" : "Note", checked: true },
  ]);

  // 페이지 수 계산
  const totalPages = Math.ceil(allData.length / itemsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 표시 개수 변경 핸들러
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // 페이지 개수가 변경되면 첫 페이지로 이동
  };

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
  }, [currentData]);

  const toggleTableColumn = (id: number) => {
    setTableColumns(
      tableColumns.map((column) =>
        column.id === id ? { ...column, checked: !column.checked } : column,
      ),
    );
  };

  // 모든 테이블 컬럼 토글
  const toggleAllTableColumns = (checked: boolean) => {
    setTableColumns(tableColumns.map((column) => ({ ...column, checked })));
  };

  // 설정 초기화
  const resetSettings = () => {
    setShowStats(true);
    setTableColumns([
      { id: 1, label: language === "ko" ? "번호" : "No.", checked: true },
      {
        id: 2,
        label: language === "ko" ? "신청일시" : "Request Date",
        checked: true,
      },
      {
        id: 3,
        label: language === "ko" ? "가맹점" : "Merchant",
        checked: true,
      },
      {
        id: 4,
        label: language === "ko" ? "예금주" : "Account Holder",
        checked: true,
      },
      { id: 5, label: language === "ko" ? "은행" : "Bank", checked: true },
      {
        id: 6,
        label: language === "ko" ? "계좌번호" : "Account Number",
        checked: true,
      },
      { id: 7, label: language === "ko" ? "금액" : "Amount", checked: true },
      { id: 8, label: language === "ko" ? "상태" : "Status", checked: false },
      {
        id: 9,
        label: language === "ko" ? "출금일시" : "Withdrawal Date",
        checked: true,
      },
      {
        id: 10,
        label: language === "ko" ? "출금방식" : "Withdrawal Method",
        checked: true,
      },
      { id: 11, label: language === "ko" ? "아이디" : "ID", checked: false },
      { id: 12, label: language === "ko" ? "실명" : "Name", checked: false },
      { id: 13, label: language === "ko" ? "휴대폰" : "Phone", checked: false },
      {
        id: 14,
        label: language === "ko" ? "출금은행" : "Withdrawal Bank",
        checked: false,
      },
      {
        id: 15,
        label: language === "ko" ? "출금계좌번호" : "Withdrawal Account",
        checked: false,
      },
      {
        id: 16,
        label: language === "ko" ? "입금은행" : "Deposit Bank",
        checked: false,
      },
      {
        id: 17,
        label: language === "ko" ? "입금계좌번호" : "Deposit Account",
        checked: false,
      },
      {
        id: 18,
        label: language === "ko" ? "가입날짜" : "Join Date",
        checked: false,
      },
      { id: 19, label: language === "ko" ? "상태" : "Status", checked: true },
      { id: 20, label: language === "ko" ? "비고" : "Note", checked: true },
    ]);
  };

  // 출금 신청 처리
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 출금 신청 처리 로직 추가
    const currency =
      withdrawalMethod === "원화출금"
        ? language === "ko"
          ? "원"
          : "KRW"
        : "$";
    const amount = Number(withdrawalAmount).toLocaleString();
    const foreignAmount =
      withdrawalMethod === "외화출금"
        ? Number(foreignWithdrawalAmount).toLocaleString()
        : "";

    let message =
      language === "ko"
        ? `출금 신청이 완료되었습니다.\n출금방식: ${withdrawalMethod}\n출금금액: ${amount}원`
        : `Withdrawal request completed.\nWithdrawal method: ${translateWithdrawalMethod(withdrawalMethod, language)}\nWithdrawal amount: ${amount} KRW`;

    if (withdrawalMethod === "외화출금" && foreignAmount) {
      message +=
        language === "ko"
          ? `\n외화송금예정금액: ${foreignAmount}원`
          : `\nExpected foreign currency transfer amount: ${foreignAmount} KRW`;
    }

    if (withdrawalNote) {
      message +=
        language === "ko"
          ? `\n비고: ${withdrawalNote}`
          : `\nNote: ${withdrawalNote}`;
    }

    alert(message);

    setWithdrawalDialogOpen(false);
    // 폼 초기화
    setWithdrawalMethod("원화출금");
    setSelectedBank("");
    setAccountNumber("");
    setAccountHolder("");
    setWithdrawalAmount("");
    setForeignWithdrawalAmount("");
    setWithdrawalNote("");
  };

  // 상세조건 필터 적용
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("필터 적용:", {
      searchCriteria,
      searchCategory,
      searchKeyword,
      withdrawalStatusFilter,
      startDate,
      endDate,
    });
    // 필터 적용 로직만 남기고 alert 제거
    setDetailFilterOpen(false);
  };

  // 상세조건 필터 초기화
  const resetFilters = () => {
    setSearchCriteria("requestDate");
    setSearchKeyword("");
    setSearchCategory("merchantName");
    setWithdrawalStatusFilter("all");
    setStartDate(new Date());
    setEndDate(new Date());
  };

  // 상태에 따른 배지 색상 반환
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "성공":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "실패":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "타임아웃":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  // 출금 상태에 따른 배지 색상 반환
  const getWithdrawalStatusBadgeColor = (status: string) => {
    switch (status) {
      case "성공":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "실패":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "타임아웃":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // 페이지네이션 버튼 생성
  const renderPaginationButtons = () => {
    const buttons = [];

    // 이전 페이지 버튼
    buttons.push(
      <Button
        key="prev"
        variant="outline"
        size="icon"
        className="h-8 w-8 dark:border-gray-700"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>,
    );

    // 페이지 번호 버튼
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant="outline"
          className={`h-8 w-8 ${currentPage === i ? "bg-blue-500 border-blue-500 text-white hover:bg-blue-600" : "dark:border-gray-700"}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    // 다음 페이지 버튼
    buttons.push(
      <Button
        key="next"
        variant="outline"
        size="icon"
        className="h-8 w-8 dark:border-gray-700"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>,
    );

    return buttons;
  };

  // 출금 방식 변경 시 계좌 정보 초기화 또는 설정
  useEffect(() => {
    if (withdrawalMethod === "정산") {
      // 정산 선택 시 지정 계좌 정보로 설정
      setSelectedBank(designatedAccount.bank);
      setAccountNumber(designatedAccount.accountNumber);
      setAccountHolder(designatedAccount.accountHolder);
    } else {
      // 다른 출금 방식 선택 시 초기화
      setSelectedBank("");
      setAccountNumber("");
      setAccountHolder("");
    }
  }, [withdrawalMethod, designatedAccount]);

  // 그룹 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGroup]);

  // 출금금액 입력 핸들러 수정
  const handleWithdrawalAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setWithdrawalAmount(value);

    if (value) {
      const amount = Number.parseFloat(value);

      // 외화출금 방식일 때 외화송금예정금액 자동 계산 (수수료 3% 가정)
      if (withdrawalMethod === "외화출금") {
        const fee = amount * 0.03; // 3% 수수료
        const foreignAmount = amount - fee; // 수수료를 제외한 원화 금액
        setForeignWithdrawalAmount(foreignAmount.toFixed(0));
      }

      // 정산 방식일 때 정산예정금액 자동 계산 (수수료 2% 가정)
      else if (withdrawalMethod === "정산") {
        const fee = amount * 0.02; // 2% 수수료
        const settlementAmount = amount - fee; // 수수료를 제외한 정산 금액
        setForeignWithdrawalAmount(settlementAmount.toFixed(0));
      } else {
        setForeignWithdrawalAmount("");
      }
    } else {
      setForeignWithdrawalAmount("");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {translateGroupName(groupNames[selectedGroup], language)}{" "}
          {language === "ko" ? "가맹점 출금" : "Merchant Withdrawal"}
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 hidden"
            >
              <Settings className="h-4 w-4" />
              <span>{language === "ko" ? "커스터마이징" : "Customize"}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-100">
            <DialogHeader className="relative">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2 dark:text-gray-100">
                <ArrowDownCircle className="h-5 w-5 text-blue-500" />
                {language === "ko" ? "출금 신청" : "Withdrawal Request"}
              </DialogTitle>
              <button
                onClick={() => setWithdrawalDialogOpen(false)}
                className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="statistics" className="text-sm">
                  통계 항목 설정
                </TabsTrigger>
                <TabsTrigger value="columns" className="text-sm">
                  테이블 컬럼 설정
                </TabsTrigger>
              </TabsList>

              <TabsContent value="statistics" className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-stats"
                      checked={showStats}
                      onCheckedChange={setShowStats}
                    />
                    <Label
                      htmlFor="show-stats"
                      className="font-medium dark:text-gray-300"
                    >
                      통계 정보 표시
                    </Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="columns" className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <Label className="font-medium dark:text-gray-300">
                    테이블 컬럼 표시 설정
                  </Label>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllTableColumns(true)}
                      className="text-xs h-8"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      전체 선택
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllTableColumns(false)}
                      className="text-xs h-8"
                    >
                      <EyeOff className="h-3.5 w-3.5 mr-1" />
                      전체 해제
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {tableColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center p-3 rounded-md border border-gray-200 dark:border-gray-700"
                    >
                      <Checkbox
                        id={`column-${column.id}`}
                        checked={column.checked}
                        onCheckedChange={() => toggleTableColumn(column.id)}
                        className="mr-3"
                      />
                      <Label
                        htmlFor={`column-${column.id}`}
                        className="font-medium cursor-pointer dark:text-gray-300"
                      >
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={resetSettings}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                초기화
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                설정 저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {showStats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {/* 현재잔액(입금후잔액) */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center dark:text-gray-100">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko"
                      ? "현재잔액(입금후잔액)"
                      : "Current Balance (Payin-Fee)"}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {stats.currentBalance.toLocaleString()}
                    {language === "ko" ? "원" : " KRW"}
                  </div>
                  <div className="text-xs text-green-500 mt-0.5">
                    {language === "ko" ? "실시간" : "Real-time"}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
                  <Wallet className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            {/* 출금가능금액 */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-md overflow-hidden">
              <CardContent className="p-4 flex justify-between items-center dark:text-gray-100">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko"
                      ? "출금가능금액"
                      : "Available Withdrawal Amount"}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {stats.availableWithdrawalAmount.toLocaleString()}
                    {language === "ko" ? "원" : " KRW"}
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
              <CardContent className="p-4 flex justify-between items-center dark:text-gray-100">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {language === "ko"
                      ? "정산가능잔액"
                      : "Available Settlement Balance"}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {stats.settlementBalance.toLocaleString()}
                    {language === "ko" ? "원" : " KRW"}
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
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2023-01-01")} />
        </div>

        <div className="ml-auto flex items-center gap-2">
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

          {/* 출금하기 버튼 및 모달 */}
          <Dialog
            open={withdrawalDialogOpen}
            onOpenChange={setWithdrawalDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 border-gray-200 dark:border-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Opening withdrawal dialog");
                  setWithdrawalDialogOpen(true);
                }}
              >
                <ArrowDownCircle className="h-4 w-4" />
                <span>{language === "ko" ? "출금하기" : "Withdraw"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-100 z-[9999]">
              <DialogHeader className="relative">
                <DialogTitle className="text-xl font-semibold flex items-center gap-2 dark:text-gray-100">
                  <ArrowDownCircle className="h-5 w-5 text-blue-500" />
                  {language === "ko" ? "출금 신청" : "Withdrawal Request"}
                </DialogTitle>
                <button
                  onClick={() => setWithdrawalDialogOpen(false)}
                  className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogHeader>

              <form
                onSubmit={handleWithdrawalSubmit}
                className="space-y-6 mt-4"
              >
                {/* 출금 정보 요약 */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="dark:bg-gray-700">
                    <CardContent className="p-4 flex flex-col items-center dark:text-gray-100">
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        {language === "ko"
                          ? "출금가능금액"
                          : "Available Withdrawal Amount"}
                      </div>
                      <div className="font-semibold text-blue-600">
                        {stats.availableWithdrawalAmount?.toLocaleString() ||
                          "0"}
                        {language === "ko" ? "원" : " KRW"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-700">
                    <CardContent className="p-4 flex flex-col items-center dark:text-gray-100">
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {language === "ko"
                          ? "정산가능금액"
                          : "Available Settlement Amount"}
                      </div>
                      <div className="font-semibold text-purple-600">
                        {stats.settlementBalance?.toLocaleString() || "0"}
                        {language === "ko" ? "원" : " KRW"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="dark:bg-gray-700">
                    <CardContent className="p-4 flex flex-col items-center dark:text-gray-100">
                      <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Wallet className="h-4 w-4" />
                        {language === "ko" ? (
                          "외화출금가능금액"
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <div>Available</div>
                            <div>Foreign</div>
                            <div>Currency</div>
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-blue-600">
                        {(
                          stats.foreignCurrencyAmount * 1350
                        )?.toLocaleString() || "0"}
                        {language === "ko" ? "원" : " KRW"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 출금방식 선택 */}
                <div className="space-y-2">
                  <Label className="text-base font-medium dark:text-gray-300">
                    {language === "ko" ? "출금방식" : "Withdrawal Method"}
                  </Label>
                  <RadioGroup
                    value={withdrawalMethod}
                    onValueChange={setWithdrawalMethod}
                    className="grid grid-cols-3 gap-3 mt-2"
                  >
                    <div>
                      <RadioGroupItem
                        value="원화출금"
                        id="method-krw"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="method-krw"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      >
                        <Wallet className="h-5 w-5 mb-2" />
                        <span>
                          {language === "ko" ? "원화출금" : "KRW Withdrawal"}
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="정산"
                        id="method-settlement"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="method-settlement"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500 cursor-pointer dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      >
                        <FileText className="h-5 w-5 mb-2" />
                        <span>{language === "ko" ? "정산" : "Settlement"}</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="외화출금"
                        id="method-foreign"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="method-foreign"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                      >
                        <Wallet className="h-5 w-5 mb-2" />
                        <span>
                          {language === "ko"
                            ? "외화출금"
                            : "Foreign Currency Withdrawal"}
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 출금정보 - 원화출금일 때만 표시 */}
                {withdrawalMethod === "원화출금" && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium dark:text-gray-300">
                      {language === "ko"
                        ? "출금정보"
                        : "Withdrawal Information"}
                    </Label>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="bank"
                          className="flex items-center gap-1 dark:text-gray-300"
                        >
                          <Building className="h-4 w-4" />
                          {language === "ko"
                            ? "출금할 은행 선택"
                            : "Select Bank for Withdrawal"}
                        </Label>
                        <Select
                          value={selectedBank}
                          onValueChange={setSelectedBank}
                        >
                          <SelectTrigger
                            id="bank"
                            className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                          >
                            <SelectValue
                              placeholder={
                                language === "ko"
                                  ? "은행을 선택하세요"
                                  : "Select a bank"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent
                            className="max-h-[300px] overflow-y-auto"
                            onMouseLeave={() => document.body.click()}
                          >
                            {koreanBanks.map((bank) => (
                              <SelectItem
                                key={bank}
                                value={bank}
                                className="cursor-pointer"
                              >
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="account-number"
                          className="flex items-center gap-1 dark:text-gray-300"
                        >
                          <CreditCard className="h-4 w-4" />
                          {language === "ko"
                            ? "출금할 계좌번호 입력"
                            : "Enter Account Number for Withdrawal"}
                        </Label>
                        <Input
                          id="account-number"
                          placeholder={
                            language === "ko"
                              ? "계좌번호를 입력하세요"
                              : "Enter account number"
                          }
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="account-holder"
                          className="flex items-center gap-1 dark:text-gray-300"
                        >
                          <User className="h-4 w-4" />
                          {language === "ko"
                            ? "출금할 계좌 예금주"
                            : "Account Holder for Withdrawal"}
                        </Label>
                        <Input
                          id="account-holder"
                          placeholder={
                            language === "ko"
                              ? "예금주를 입력하세요"
                              : "Enter account holder name"
                          }
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 출금금액 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="withdrawal-amount"
                    className="text-base font-medium flex items-center gap-1 dark:text-gray-300"
                  >
                    <Wallet className="h items-center gap-1 dark:text-gray-300">
                      {withdrawalMethod === "원화출금"
                        ? language === "ko"
                          ? "출금금액"
                          : "Withdrawal Amount"
                        : withdrawalMethod === "정산"
                          ? language === "ko"
                            ? "정산금액"
                            : "Settlement Amount"
                          : language === "ko"
                            ? "외화출금금액"
                            : "Foreign Currency Withdrawal Amount"}
                    </Wallet>
                  </Label>
                  <div className="relative">
                    <Input
                      id="withdrawal-amount"
                      type="number"
                      placeholder={
                        withdrawalMethod === "원화출금"
                          ? language === "ko"
                            ? "출금금액을 입력하세요"
                            : "Enter withdrawal amount"
                          : withdrawalMethod === "정산"
                            ? language === "ko"
                              ? "정산금액을 입력하세요"
                              : "Enter settlement amount"
                            : language === "ko"
                              ? "외화출금금액을 입력하세요"
                              : "Enter foreign currency withdrawal amount"
                      }
                      value={withdrawalAmount}
                      onChange={handleWithdrawalAmountChange}
                      className="pr-12 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      {language === "ko" ? "원" : "KRW"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <ChevronsRight className="h-4 w-4" />
                    {withdrawalMethod === "원화출금"
                      ? language === "ko"
                        ? `최대 출금가능금액: ${stats.availableWithdrawalAmount?.toLocaleString() || "0"}원`
                        : `Maximum available withdrawal amount: ${stats.availableWithdrawalAmount?.toLocaleString() || "0"} KRW`
                      : withdrawalMethod === "정산"
                        ? language === "ko"
                          ? `최대 정산가능금액: ${stats.settlementBalance?.toLocaleString() || "0"}원`
                          : `Maximum available settlement amount: ${stats.settlementBalance?.toLocaleString() || "0"} KRW`
                        : language === "ko"
                          ? `최대 외화출금가능금액: ${(stats.foreignCurrencyAmount * 1350)?.toLocaleString() || "0"}원`
                          : `Maximum available foreign currency amount: ${(stats.foreignCurrencyAmount * 1350)?.toLocaleString() || "0"} KRW`}
                  </div>
                </div>

                {/* 정산예정금액 - 정산일 때만 표시 */}
                {withdrawalMethod === "정산" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="settlement-amount"
                      className="text-base font-medium flex items-center gap-1 dark:text-gray-300"
                    >
                      <FileText className="h-4 w-4" />
                      {language === "ko"
                        ? "정산예정금액"
                        : "Expected Settlement Amount"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="settlement-amount"
                        type="text"
                        value={foreignWithdrawalAmount}
                        readOnly
                        className="pr-12 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        {language === "ko" ? "원" : "KRW"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <ChevronsRight className="h-4 w-4" />
                      {language === "ko"
                        ? "실제 정산 예정 금액입니다."
                        : "This is the actual expected settlement amount."}
                    </div>
                  </div>
                )}

                {/* 외화송금예정금액 - 외화출금일 때만 표시 */}
                {withdrawalMethod === "외화출금" && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="foreign-withdrawal-amount"
                      className="text-base font-medium flex items-center gap-1 dark:text-gray-300"
                    >
                      <Globe className="h-4 w-4" />
                      {language === "ko"
                        ? "외화송금예정금액"
                        : "Expected Foreign Currency Transfer Amount"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="foreign-withdrawal-amount"
                        type="text"
                        value={foreignWithdrawalAmount}
                        readOnly
                        className="pr-12 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        {language === "ko" ? "원" : "KRW"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <ChevronsRight className="h-4 w-4" />
                      {language === "ko"
                        ? "실제 송금 예정 금액입니다."
                        : "This is the actual expected transfer amount."}
                    </div>
                  </div>
                )}

                {/* 비고 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="withdrawal-note"
                    className="text-base font-medium flex items-center gap-1 dark:text-gray-300"
                  >
                    <FileText className="h-4 w-4" />
                    {language === "ko" ? "비고" : "Note"}
                  </Label>
                  <Textarea
                    id="withdrawal-note"
                    placeholder={
                      language === "ko"
                        ? "필요한 메모나 참고사항을 입력하세요"
                        : "Enter any necessary notes or references"
                    }
                    value={withdrawalNote}
                    onChange={(e) => setWithdrawalNote(e.target.value)}
                    className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    rows={3}
                  />
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white w-full py-6 text-lg"
                    disabled={
                      withdrawalMethod === "원화출금"
                        ? !selectedBank ||
                          !accountNumber ||
                          !accountHolder ||
                          !withdrawalAmount
                        : withdrawalMethod === "정산"
                          ? !withdrawalAmount
                          : !withdrawalAmount
                    }
                  >
                    {withdrawalMethod === "정산"
                      ? language === "ko"
                        ? "정산신청"
                        : "Request Settlement"
                      : language === "ko"
                        ? "출금신청"
                        : "Request Withdrawal"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* 상세조건 버튼 및 모달 */}
          <Dialog open={detailFilterOpen} onOpenChange={setDetailFilterOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 border-gray-200 dark:border-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Opening detail filter dialog");
                  setDetailFilterOpen(true);
                }}
              >
                <Filter className="h-4 w-4" />
                <span>
                  {language === "ko" ? "상세조건" : "Advanced Search"}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] dark:bg-gray-800 dark:text-gray-100 z-[9999]">
              <DialogHeader className="relative">
                <DialogTitle className="dark:text-gray-100">
                  {language === "ko"
                    ? "상세조건 설정"
                    : "Advanced Search Settings"}
                </DialogTitle>
                <button
                  onClick={() => setDetailFilterOpen(false)}
                  className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogHeader>

              <form onSubmit={handleFilterSubmit}>
                {/* 조회기준 */}
                <div className="mb-4">
                  <Label className="dark:text-gray-300 block mb-2">
                    {language === "ko" ? "조회기준" : "Search Criteria"}
                  </Label>
                  <Select
                    value={searchCriteria}
                    onValueChange={(value) => setSearchCriteria(value)}
                  >
                    <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 h-10">
                      <SelectValue
                        placeholder={
                          language === "ko"
                            ? "조회기준 선택"
                            : "Select search criteria"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="w-full min-w-[200px] z-[9999]"
                      onMouseLeave={() => document.body.click()}
                    >
                      <SelectItem value="requestDate">
                        {language === "ko" ? "신청일시" : "Request Date"}
                      </SelectItem>
                      <SelectItem value="withdrawalDate">
                        {language === "ko" ? "출금일시" : "Withdrawal Date"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 조회기간 */}
                <div className="mb-4">
                  <Label className="dark:text-gray-300 block mb-2">
                    {language === "ko" ? "조회기간" : "Search Period"}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="z-[9999] relative flex items-center">
                      <Input
                        type="date"
                        value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                        onChange={(e) =>
                          setStartDate(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                    <span>~</span>
                    <div className="z-[9999] relative flex items-center">
                      <Input
                        type="date"
                        value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                        onChange={(e) =>
                          setEndDate(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          )
                        }
                        className="w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* 분류 및 키워드 */}
                <div className="mb-4">
                  <Label className="dark:text-gray-300 block mb-2">
                    {language === "ko" ? "분류" : "Category"}
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={searchCategory}
                      onValueChange={(value) => setSearchCategory(value)}
                    >
                      <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 h-10">
                        <SelectValue
                          placeholder={
                            language === "ko" ? "분류 선택" : "Select category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="min-w-[140px] z-[9999]"
                        onMouseLeave={() => document.body.click()}
                      >
                        <SelectItem value="merchantName">
                          {language === "ko" ? "가맹점" : "Merchant"}
                        </SelectItem>
                        <SelectItem value="accountHolder">
                          {language === "ko" ? "예금주" : "Account Holder"}
                        </SelectItem>
                        <SelectItem value="accountNumber">
                          {language === "ko" ? "계좌번호" : "Account Number"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={
                        language === "ko"
                          ? "키워드를 입력하세요"
                          : "Enter keyword"
                      }
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 h-10"
                    />
                  </div>
                </div>

                {/* 상태 */}
                <div className="mb-4">
                  <Label className="dark:text-gray-300 block mb-2">
                    {language === "ko" ? "상태" : "Status"}
                  </Label>
                  <Select
                    value={withdrawalStatusFilter}
                    onValueChange={(value) => setWithdrawalStatusFilter(value)}
                  >
                    <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 h-10">
                      <SelectValue
                        placeholder={
                          language === "ko" ? "상태 선택" : "Select status"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      className="w-full min-w-[200px] z-[9999]"
                      onMouseLeave={() => document.body.click()}
                    >
                      <SelectItem value="all">
                        {language === "ko" ? "모든 상태" : "All Statuses"}
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

                <DialogFooter className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    type="button"
                  >
                    {language === "ko" ? "초기화" : "Reset"}
                  </Button>
                  <Button type="submit">
                    {language === "ko" ? "조회" : "Search"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <span className="mr-1">{language === "ko" ? "엑셀" : "Excel"}</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TableContainer minWidth="1500px">
        <table
          ref={tableRef}
          className="w-full text-sm merchant-withdrawal-table"
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {tableColumns[0].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "번호" : "No."}
                </th>
              )}
              {tableColumns[1].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "신청일시" : "Request Date"}
                </th>
              )}
              {tableColumns[2].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "가맹점" : "Merchant"}
                </th>
              )}
              {tableColumns[3].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "예금주" : "Account Holder"}
                </th>
              )}
              {tableColumns[4].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "은행" : "Bank"}
                </th>
              )}
              {tableColumns[5].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "계좌번호" : "Account Number"}
                </th>
              )}
              {tableColumns[6].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "금액" : "Amount"}
                </th>
              )}
              {tableColumns[7].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "상태" : "Status"}
                </th>
              )}
              {tableColumns[8].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "출금일시" : "Withdrawal Date"}
                </th>
              )}
              {tableColumns[9].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "출금방식" : "Withdrawal Method"}
                </th>
              )}
              {tableColumns[10].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "아이디" : "ID"}
                </th>
              )}
              {tableColumns[11].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "실명" : "Name"}
                </th>
              )}
              {tableColumns[12].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "휴대폰" : "Phone"}
                </th>
              )}
              {tableColumns[13].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "출금은행" : "Withdrawal Bank"}
                </th>
              )}
              {tableColumns[14].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "출금계좌번호" : "Withdrawal Account"}
                </th>
              )}
              {tableColumns[15].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "입금은행" : "Deposit Bank"}
                </th>
              )}
              {tableColumns[16].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "입금계좌번호" : "Deposit Account"}
                </th>
              )}
              {tableColumns[17].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "가입날짜" : "Join Date"}
                </th>
              )}
              {tableColumns[18].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "상태" : "Status"}
                </th>
              )}
              {tableColumns[19].checked && (
                <th className="py-3 px-4 text-center font-medium">
                  {language === "ko" ? "비고" : "Note"}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                {tableColumns[0].checked && (
                  <td className="py-3 px-4 text-center">{item.number}</td>
                )}
                {tableColumns[1].checked && (
                  <td className="py-3 px-4 text-center">{item.requestDate}</td>
                )}
                {tableColumns[2].checked && (
                  <td className="py-3 px-4 text-center">
                    {translateMerchantName(item.merchantName, language)}
                  </td>
                )}
                {tableColumns[3].checked && (
                  <td className="py-3 px-4 text-center">
                    {translateName(item.accountHolder, language)}
                  </td>
                )}
                {tableColumns[4].checked && (
                  <td className="py-3 px-4 text-center">{item.depositBank}</td>
                )}
                {tableColumns[5].checked && (
                  <td className="py-3 px-4 text-center">
                    {item.accountNumber}
                  </td>
                )}
                {tableColumns[6].checked && (
                  <td className="py-3 px-4 text-center">
                    {item.amount.toLocaleString()}
                    {language === "ko" ? "원" : " KRW"}
                  </td>
                )}
                {tableColumns[7].checked && (
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getWithdrawalStatusBadgeColor(item.withdrawalStatus)}`}
                    >
                      {translateStatus(item.withdrawalStatus, language)}
                    </span>
                  </td>
                )}
                {tableColumns[8].checked && (
                  <td className="py-3 px-4 text-center">
                    {item.withdrawalDate}
                  </td>
                )}
                {tableColumns[9].checked && (
                  <td className="py-3 px-4 text-center">
                    {translateWithdrawalMethod(item.withdrawalMethod, language)}
                  </td>
                )}
                {tableColumns[10].checked && (
                  <td className="py-3 px-4 text-center">{item.id}</td>
                )}
                {tableColumns[11].checked && (
                  <td className="py-3 px-4 text-center">
                    {translateName(item.name, language)}
                  </td>
                )}
                {tableColumns[12].checked && (
                  <td className="py-3 px-4 text-center">{item.phone}</td>
                )}
                {tableColumns[13].checked && (
                  <td className="py-3 px-4 text-center">{item.withdrawBank}</td>
                )}
                {tableColumns[14].checked && (
                  <td className="py-3 px-4 text-center">
                    {item.withdrawAccount}
                  </td>
                )}
                {tableColumns[15].checked && (
                  <td className="py-3 px-4 text-center">{item.depositBank}</td>
                )}
                {tableColumns[16].checked && (
                  <td className="py-3 px-4 text-center">
                    {item.depositAccount}
                  </td>
                )}
                {tableColumns[17].checked && (
                  <td className="py-3 px-4 text-center">{item.joinDate}</td>
                )}
                {tableColumns[18].checked && (
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}
                    >
                      {translateStatus(item.status, language)}
                    </span>
                  </td>
                )}
                {tableColumns[19].checked && (
                  <td className="py-3 px-4 text-center"></td>
                )}
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
    </div>
  );
}
