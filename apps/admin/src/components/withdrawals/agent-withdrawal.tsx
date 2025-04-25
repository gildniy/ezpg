"use client";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { TableContainer } from "@ezpg/ui";
import { DatePicker } from "@ezpg/ui";
import { useEffect, useState } from "react";
import { toast } from "@ezpg/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ezpg/ui";
import { Input } from "@ezpg/ui";

export function AgentWithdrawalContent() {
  const [withdrawals, setWithdrawals] = useState([
    {
      id: 1,
      date: "2025/04/01 14:25:38",
      agent: "robert",
      accountHolder: "Robert Kim",
      bank: "KAKAO BANK",
      accountNumber: "3333022954291",
      ipAddress: "192.168.1.101",
      amount: "100,000",
      status: "완료",
      withdrawalDate: "2025/04/01 14:30:12",
      approval: "승인",
    },
    {
      id: 2,
      date: "2025/04/01 13:10:50",
      agent: "youknow327",
      accountHolder: "YH Park",
      bank: "SHINHAN BANK",
      accountNumber: "110333445566",
      ipAddress: "192.168.1.102",
      amount: "150,000",
      status: "완료",
      withdrawalDate: "2025/04/01 13:15:22",
      approval: "승인",
    },
    {
      id: 3,
      date: "2025/04/01 11:45:35",
      agent: "testag01",
      accountHolder: "Test Agent",
      bank: "WOORI BANK",
      accountNumber: "1234567890",
      ipAddress: "192.168.1.103",
      amount: "75,000",
      status: "실패",
      withdrawalDate: "2025/04/01 11:50:36",
      approval: "반려",
    },
  ]);

  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  // 승인 상태 변경 처리 함수
  const handleApprovalChange = (id: number, value: string) => {
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              approval: value,
              status: value === "승인" ? "완료" : "실패",
            }
          : item,
      ),
    );

    toast({
      title: "승인 상태 변경",
      description: `ID ${id}의 승인 상태가 ${value}(으)로 변경되었습니다.`,
      duration: 3000,
    });
  };

  // 컴포넌트가 마운트된 후 테이블 헤더에 직접 스타일 적용
  useEffect(() => {
    // 테이블 헤더에 강력한 스타일 적용
    const headers = document.querySelectorAll(".agent-withdrawal-table th");
    headers.forEach((header) => {
      const element = header as HTMLElement;
      element.style.cssText = `
        white-space: nowrap !important;
        height: 3rem !important;
        line-height: 3rem !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        text-align: center !important;
      `;
    });

    // 테이블 셀에도 동일한 스타일 적용
    const cells = document.querySelectorAll(".agent-withdrawal-table td");
    cells.forEach((cell) => {
      const element = cell as HTMLElement;
      element.style.cssText = `
        white-space: nowrap !important;
        text-align: center;
      `;
    });

    // 테이블 자체에 스타일 적용
    const table = document.querySelector(
      ".agent-withdrawal-table",
    ) as HTMLElement;
    if (table) {
      table.style.minWidth = "100%";
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">{"에이전트 출금 관리"}</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="신청일시" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">신청일시</SelectItem>
              <SelectItem value="name">에이전트</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 text-sm mr-2">
            총: <span className="font-medium">3건</span>, 회원 출금액:{" "}
            <span className="font-medium">250,000원</span>
          </div>

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
            onClick={() => setIsDetailConditionOpen(true)}
          >
            상세조건
          </Button>

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
            <span className="mr-1">엑셀</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TableContainer className="overflow-x-auto">
        <table
          className="w-full text-sm agent-withdrawal-table"
          style={{ minWidth: "1200px" }}
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                번호
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                신청일시
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                에이전트
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                예금주
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                출금은행
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                출금계좌
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                접속IP
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                출금액
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                상태
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                처리일시
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                승인/반려
              </th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal) => (
              <tr
                key={withdrawal.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.id}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.date}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.agent}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.accountHolder}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.bank}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.accountNumber}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.ipAddress}
                </td>
                <td
                  className="py-3 px-4 text-center font-semibold text-red-600"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.amount}원
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      withdrawal.status === "완료"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {withdrawal.status}
                  </span>
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {withdrawal.withdrawalDate}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  <Select
                    onValueChange={(value) =>
                      handleApprovalChange(withdrawal.id, value)
                    }
                    defaultValue={withdrawal.approval}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs border-gray-200 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="승인">승인</SelectItem>
                      <SelectItem value="반려">반려</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          총 {withdrawals.length}건
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">1</span>
          <Button
            variant="outline"
            size="sm"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 상세조건 팝업 */}
      <DetailConditionModal
        isOpen={isDetailConditionOpen}
        onClose={() => setIsDetailConditionOpen(false)}
      />
    </div>
  );
}

interface DetailConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function DetailConditionModal({ isOpen, onClose }: DetailConditionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>상세조건</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">시작일</label>
              <Input type="date" defaultValue="2025-04-01" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">종료일</label>
              <Input type="date" defaultValue="2025-04-01" className="w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">에이전트</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="에이전트 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="robert">robert</SelectItem>
                <SelectItem value="youknow327">youknow327</SelectItem>
                <SelectItem value="testag01">testag01</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">상태</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">승인상태</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="승인상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="approved">승인</SelectItem>
                <SelectItem value="rejected">반려</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onClose}>적용</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
