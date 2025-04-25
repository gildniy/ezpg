"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
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
import { useEffect, useRef, useState } from "react";
import { Badge } from "@ezpg/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";

export function ComplaintsContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  // 예시 데이터
  const complaints = [
    {
      id: 1,
      complaintDate: "2025-04-10",
      merchantDate: "2025-04-08",
      category: "입금",
      merchant: "sticpay",
      memberName: "김철수",
      accountNumber: "3333022954291",
      adjustmentType: "차감",
      deductionAmount: "-50,000",
      complaintAmount: "50,000",
      status: "처리완료",
      note: "입금 오류로 인한 환불 처리",
    },
    {
      id: 2,
      complaintDate: "2025-04-09",
      merchantDate: "2025-04-07",
      category: "출금",
      merchant: "atglobal",
      memberName: "이영희",
      accountNumber: "7016800761066",
      adjustmentType: "차감",
      deductionAmount: "-75,000",
      complaintAmount: "75,000",
      status: "처리중",
      note: "출금 지연에 대한 민원",
    },
    {
      id: 3,
      complaintDate: "2025-04-08",
      merchantDate: "2025-04-05",
      category: "계정",
      merchant: "Siliconsilk",
      memberName: "박지민",
      accountNumber: "110333445566",
      adjustmentType: "추가",
      deductionAmount: "-100,000",
      complaintAmount: "100,000",
      status: "처리완료",
      note: "중복 결제 환불 처리",
    },
  ];

  const [newComplaint, setNewComplaint] = useState({
    complaintDate: undefined as Date | undefined,
    merchantDate: undefined as Date | undefined,
    category: "",
    merchant: "",
    memberName: "",
    accountNumber: "",
    adjustmentType: "",
    deductionAmount: "",
    complaintAmount: "",
    status: "",
    note: "",
  });

  const handleRegisterSubmit = () => {
    // 입력된 내용 출력 (실제 등록 처리 로직 구현 가능)
    console.log("새 민원 등록 내용:", newComplaint);
    setShowRegisterPopup(false); // 팝업창 닫기
  };

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    // 전역 스타일 적용을 방지하기 위한 스타일 태그 추가
    const styleTag = document.createElement("style");
    styleTag.innerHTML = ` 
    .complaints-table th, .complaints-table td {
      white-space: nowrap !important;
      overflow: visible !important;
      text-overflow: clip !important;
      height: 3rem !important;
      line-height: 3rem !important;
      padding: 0.75rem 1rem !important;
    }
    
    .complaints-table {
      table-layout: auto !important;
      width: 100% !important;
    }
    
    .complaints-table-container {
      overflow-x: auto !important;
    }
  `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">민원 관리</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="민원 분류" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="deposit">입금</SelectItem>
              <SelectItem value="withdraw">출금</SelectItem>
              <SelectItem value="account">계정</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>

        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="담당" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">담당</SelectItem>
              <SelectItem value="team1">팀1</SelectItem>
              <SelectItem value="team2">팀2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="보기" />
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
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <span className="mr-1">Excel</span>
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="dark:border-gray-700 dark:text-gray-200"
            onClick={() => setShowRegisterPopup(true)}
          >
            <span className="mr-1">등록</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="complaints-table-container bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <table
          ref={tableRef}
          className="w-full text-sm complaints-table"
          style={{ tableLayout: "auto" }}
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium">번호</th>
              <th className="py-3 px-4 text-center font-medium">민원 날짜</th>
              <th className="py-3 px-4 text-center font-medium">가맹 날짜</th>
              <th className="py-3 px-4 text-center font-medium">카테고리</th>
              <th className="py-3 px-4 text-center font-medium">가맹점</th>
              <th className="py-3 px-4 text-center font-medium">회원명</th>
              <th className="py-3 px-4 text-center font-medium">계좌번호</th>
              <th className="py-3 px-4 text-center font-medium">차감/추가</th>
              <th className="py-3 px-4 text-center font-medium">
                차감/추가 금액
              </th>
              <th className="py-3 px-4 text-center font-medium">민원 금액</th>
              <th className="py-3 px-4 text-center font-medium">상태</th>
              <th className="py-3 px-4 text-center font-medium">비고</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr
                key={complaint.id}
                className="border-t border-gray-200 dark:border-gray-700 text-center"
              >
                <td className="py-3 px-4">{complaint.id}</td>
                <td className="py-3 px-4">{complaint.complaintDate}</td>
                <td className="py-3 px-4">{complaint.merchantDate}</td>
                <td className="py-3 px-4">
                  <Badge
                    className={
                      complaint.category === "입금"
                        ? "bg-blue-500"
                        : complaint.category === "출금"
                          ? "bg-purple-500"
                          : "bg-orange-500"
                    }
                  >
                    {complaint.category}
                  </Badge>
                </td>
                <td className="py-3 px-4">{complaint.merchant}</td>
                <td className="py-3 px-4">{complaint.memberName}</td>
                <td className="py-3 px-4">{complaint.accountNumber}</td>
                <td className="py-3 px-4">
                  <Badge
                    className={
                      complaint.adjustmentType === "차감"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }
                  >
                    {complaint.adjustmentType}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-red-500">
                  {complaint.deductionAmount}
                </td>
                <td className="py-3 px-4">{complaint.complaintAmount}</td>
                <td className="py-3 px-4">
                  <Badge
                    className={
                      complaint.status === "처리완료"
                        ? "bg-green-500"
                        : complaint.status === "처리중"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }
                  >
                    {complaint.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">{complaint.note}</td>
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
      </div>

      {/* 등록 팝업 */}
      <Dialog open={showRegisterPopup} onOpenChange={setShowRegisterPopup}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>민원 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label htmlFor="complaintDate" className="text-sm font-medium">
                민원 날짜
              </label>
              <DatePicker
                value={newComplaint.complaintDate}
                onChange={(date) =>
                  setNewComplaint({ ...newComplaint, complaintDate: date })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="merchantDate" className="text-sm font-medium">
                가맹 날짜
              </label>
              <DatePicker
                value={newComplaint.merchantDate}
                onChange={(date) =>
                  setNewComplaint({ ...newComplaint, merchantDate: date })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium">
                카테고리
              </label>
              <Select
                onValueChange={(value) =>
                  setNewComplaint({ ...newComplaint, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="입금">입금</SelectItem>
                  <SelectItem value="출금">출금</SelectItem>
                  <SelectItem value="계정">계정</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Other form fields here */}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowRegisterPopup(false)}
              className="w-[calc(50%-4px)]"
            >
              취소
            </Button>
            <Button
              onClick={handleRegisterSubmit}
              className="w-[calc(50%-4px)] bg-blue-500 hover:bg-blue-600"
            >
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
