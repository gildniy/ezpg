"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { DatePicker } from "@ezpg/ui";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";

export function SuspiciousTransactionsContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // 예시 데이터
  const suspiciousTransactions = [
    {
      id: 1,
      merchantId: "sticpay",
      content: "단시간 내 다수의 출금 요청 (10건 이상)",
      registrationDate: "2025/04/14 09:23:45",
      status: "조사중",
      amount: "5,000,000원",
      userId: "user123",
      handler: "admin01",
      handlingDate: "2025/04/14 10:15:22",
    },
    {
      id: 2,
      merchantId: "atglobal",
      content: "비정상적인 대량 입금 시도 감지 (500만원 이상)",
      registrationDate: "2025/04/13 15:42:18",
      status: "처리완료",
      amount: "7,500,000원",
      userId: "user456",
      handler: "admin02",
      handlingDate: "2025/04/13 16:30:45",
    },
    {
      id: 3,
      merchantId: "Siliconsilk",
      content: "동일 IP에서 다수의 계정 접속 시도",
      registrationDate: "2025/04/12 22:10:37",
      status: "정상처리",
      amount: "3,200,000원",
      userId: "user789",
      handler: "admin01",
      handlingDate: "2025/04/13 09:05:12",
    },
    {
      id: 4,
      merchantId: "sticpay",
      content: "해외 IP에서의 관리자 계정 접근 시도",
      registrationDate: "2025/04/11 03:15:22",
      status: "조사중",
      amount: "1,800,000원",
      userId: "admin_user",
      handler: "admin03",
      handlingDate: "2025/04/11 08:45:33",
    },
    {
      id: 5,
      merchantId: "atglobal",
      content: "API 호출 비율 임계값 초과 (분당 100회 이상)",
      registrationDate: "2025/04/10 18:33:09",
      status: "처리완료",
      amount: "4,200,000원",
      userId: "user234",
      handler: "admin02",
      handlingDate: "2025/04/10 19:20:15",
    },
    {
      id: 6,
      merchantId: "test03",
      content: "차단된 IP에서의 로그인 시도",
      registrationDate: "2025/04/09 11:27:54",
      status: "정상처리",
      amount: "950,000원",
      userId: "user567",
      handler: "admin01",
      handlingDate: "2025/04/09 12:15:40",
    },
    {
      id: 7,
      merchantId: "sticpay",
      content: "비정상적인 패턴의 거래 시도 (소액 다건 입금 후 대량 출금)",
      registrationDate: "2025/04/08 14:55:31",
      status: "조사중",
      amount: "8,500,000원",
      userId: "user890",
      handler: "admin03",
      handlingDate: "2025/04/08 15:40:22",
    },
    {
      id: 8,
      merchantId: "Siliconsilk",
      content: "다수의 실패한 결제 시도 (15회 이상)",
      registrationDate: "2025/04/07 09:12:45",
      status: "처리완료",
      amount: "2,300,000원",
      userId: "user321",
      handler: "admin02",
      handlingDate: "2025/04/07 10:30:18",
    },
    {
      id: 9,
      merchantId: "atglobal",
      content: "짧은 시간 내 다수의 계정 생성 시도",
      registrationDate: "2025/04/06 16:48:33",
      status: "정상처리",
      amount: "1,200,000원",
      userId: "user654",
      handler: "admin01",
      handlingDate: "2025/04/06 17:25:50",
    },
    {
      id: 10,
      merchantId: "test03",
      content: "의심스러운 IP 주소에서의 대량 거래",
      registrationDate: "2025/04/05 21:37:19",
      status: "조사중",
      amount: "6,700,000원",
      userId: "user987",
      handler: "admin03",
      handlingDate: "2025/04/06 09:10:45",
    },
    {
      id: 11,
      merchantId: "sticpay",
      content: "다수의 계정에서 동일한 출금 계좌로 송금 시도",
      registrationDate: "2025/04/04 13:22:58",
      status: "처리완료",
      amount: "9,800,000원",
      userId: "user432",
      handler: "admin02",
      handlingDate: "2025/04/04 14:15:30",
    },
    {
      id: 12,
      merchantId: "Siliconsilk",
      content: "비정상적인 로그인 패턴 감지",
      registrationDate: "2025/04/03 08:45:12",
      status: "정상처리",
      amount: "3,600,000원",
      userId: "user765",
      handler: "admin01",
      handlingDate: "2025/04/03 09:30:25",
    },
  ];

  // 팝업 창 열기
  const handleDetailPopup = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailPopup(true);
  };

  // 팝업 창 닫기
  const closeDetailPopup = () => {
    setShowDetailPopup(false);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          이상거래
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
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

        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>

        <Select>
          <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <SelectValue placeholder="업체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="siliconsilk">Siliconsilk</SelectItem>
            <SelectItem value="atglobal">atglobal</SelectItem>
            <SelectItem value="sticpay">sticpay</SelectItem>
            <SelectItem value="test03">test03</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <SelectValue placeholder="처리상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="investigating">조사중</SelectItem>
            <SelectItem value="completed">처리완료</SelectItem>
            <SelectItem value="normal">정상처리</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
        >
          <Search className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex gap-3"></div>
      </div>

      <div className="suspicious-transactions-container bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <table
          ref={tableRef}
          className="w-full text-sm suspicious-transactions-table"
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium">번호</th>
              <th className="py-3 px-4 text-center font-medium">거래일시</th>
              <th className="py-3 px-4 text-center font-medium">가맹점</th>
              <th className="py-3 px-4 text-center font-medium">회원ID</th>
              <th className="py-3 px-4 text-center font-medium">거래유형</th>
              <th className="py-3 px-4 text-center font-medium">금액</th>
              <th className="py-3 px-4 text-center font-medium">이상징후</th>
              <th className="py-3 px-4 text-center font-medium">처리상태</th>
              <th className="py-3 px-4 text-center font-medium">처리자</th>
              <th className="py-3 px-4 text-center font-medium">처리일시</th>
              <th className="py-3 px-4 text-center font-medium">상세</th>
            </tr>
          </thead>
          <tbody>
            {suspiciousTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-gray-200 dark:border-gray-700 text-center"
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.id}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.registrationDate}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.merchantId}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.userId}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.id % 2 === 0 ? "입금" : "출금"}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.amount}
                </td>
                <td className="py-3 px-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">
                  {transaction.content}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white ${
                      transaction.status === "조사중"
                        ? "bg-yellow-500"
                        : transaction.status === "처리완료"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.handler}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {transaction.handlingDate}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                    onClick={() => handleDetailPopup(transaction)}
                  >
                    상세
                  </Button>
                </td>
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

      {/* 상세보기 팝업 */}
      <Dialog open={showDetailPopup} onOpenChange={closeDetailPopup}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>상세보기</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>거래일시:</strong> {selectedTransaction?.registrationDate}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>가맹점:</strong> {selectedTransaction?.merchantId}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>회원 ID:</strong> {selectedTransaction?.userId}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>거래유형:</strong>{" "}
              {selectedTransaction?.id % 2 === 0 ? "입금" : "출금"}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>금액:</strong> {selectedTransaction?.amount}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>이상징후:</strong> {selectedTransaction?.content}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>처리상태:</strong> {selectedTransaction?.status}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>처리자:</strong> {selectedTransaction?.handler}
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis">
              <strong>처리일시:</strong> {selectedTransaction?.handlingDate}
            </p>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={closeDetailPopup}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
