"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Trash,
  CreditCard,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { TableStylesApplier } from "@ezpg/ui";
import { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ezpg/ui";
import { Input } from "@ezpg/ui";

export function VirtualAccountInfoContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  const handleDetailConditionClick = () => {
    setIsDetailConditionOpen(true);
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
          text-align: center !important;
        `;
      });

      tdElements.forEach((td) => {
        td.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          text-align: center !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <TableStylesApplier />
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {"가상계좌 정보"}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 justify-end">
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
          onClick={handleDetailConditionClick}
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
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

      {/* 테이블 컨테이너에 overflow-x-auto 추가하여 좌우 스크롤 가능하게 함 */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <table
          ref={tableRef}
          className="w-full text-sm"
          style={{ minWidth: "1000px", tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>
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
                가맹점
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                은행
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                가상계좌
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
                형식
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                날짜
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                1
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                Siliconsilk
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                신한은행
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                140-012-912345
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                김한울
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                  고정
                </div>
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                2025-02-17 14:30:24
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                >
                  사용중
                </Button>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                2
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                ATGlobal
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                국민은행
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                123-01-0567891
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                홍길동
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                  회전
                </div>
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                2025-02-17 14:30:25
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                >
                  사용중지
                </Button>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                3
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                Sticpay
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                우리은행
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                1002-234-567890
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                이영희
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                  고정
                </div>
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                2025-02-17 14:30:26
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                >
                  사용중
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          총 3건의 가상계좌
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>상세조건</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">가맹점</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="가맹점 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="siliconsilk">Siliconsilk</SelectItem>
                <SelectItem value="atglobal">ATGlobal</SelectItem>
                <SelectItem value="sticpay">Sticpay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">은행</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="은행 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="shinhan">신한은행</SelectItem>
                <SelectItem value="kookmin">국민은행</SelectItem>
                <SelectItem value="woori">우리은행</SelectItem>
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
                <SelectItem value="active">사용중</SelectItem>
                <SelectItem value="inactive">사용중지</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">형식</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="형식 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="fixed">고정</SelectItem>
                <SelectItem value="rotation">회전</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onClose}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
