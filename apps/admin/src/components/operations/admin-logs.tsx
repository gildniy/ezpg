"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal,
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
import { TableStylesApplier } from "@ezpg/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";
import { Input } from "@ezpg/ui";

export function AdminLogsContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const handleDetailConditionClick = () => {
    setIsDetailConditionOpen(true);
  };

  // 컴포넌트가 마운트된 후 테이블 헤더에 직접 스타일 적용
  useEffect(() => {
    if (tableRef.current) {
      const headers = tableRef.current.querySelectorAll("th");
      headers.forEach((header) => {
        const element = header as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-height: 3rem !important;
          height: 3rem !important;
          display: table-cell !important;
          max-width: 200px !important;
          line-height: 1.25rem !important;
          vertical-align: middle !important;
          padding-top: 0.75rem !important;
          padding-bottom: 0.75rem !important;
        `;

        // 헤더 내부의 모든 요소에도 스타일 적용
        const children = element.querySelectorAll("*");
        children.forEach((child) => {
          (child as HTMLElement).style.cssText = `
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: inline !important;
          `;
        });
      });
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">관리자 로그</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="날짜" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">날짜</SelectItem>
              <SelectItem value="admin">관리자</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>

        <div className="flex items-center">
          <Select defaultValue="today">
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="당일" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">당일</SelectItem>
              <SelectItem value="yesterday">어제</SelectItem>
              <SelectItem value="week">1주일</SelectItem>
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
            <span className="mr-1">Excel</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <table
          ref={tableRef}
          className="w-full text-sm admin-logs-table"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium w-[10%]">
                번호
              </th>
              <th className="py-3 px-4 text-center font-medium w-[50%]">
                내용
              </th>
              <th className="py-3 px-4 text-center font-medium w-[20%]">
                작업자
              </th>
              <th className="py-3 px-4 text-center font-medium w-[20%]">
                날짜
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700 text-center">
              <td className="py-3 px-4">1</td>
              <td className="py-3 px-4">
                [출금 관리] 가맹점명: sticpay, 470,958원 가맹점 출금 승인 완료
              </td>
              <td className="py-3 px-4">sticpay</td>
              <td className="py-3 px-4">2025-04-01 12:01:39</td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700 text-center">
              <td className="py-3 px-4">2</td>
              <td className="py-3 px-4">
                [출금 관리] 가맹점명: sticpay, 832,626원 가맹점 출금 승인 완료
              </td>
              <td className="py-3 px-4">sticpay</td>
              <td className="py-3 px-4">2025-04-01 02:19:52</td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700 text-center">
              <td className="py-3 px-4">3</td>
              <td className="py-3 px-4">
                [출금 관리] 가맹점명: sticpay, 99,046원 가맹점 출금 승인 완료
              </td>
              <td className="py-3 px-4">sticpay</td>
              <td className="py-3 px-4">2025-04-01 02:18:36</td>
            </tr>
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

      <Dialog
        open={isDetailConditionOpen}
        onOpenChange={setIsDetailConditionOpen}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>상세조건</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label htmlFor="search-basis" className="text-sm font-medium">
                조회기준
              </label>
              <Select>
                <SelectTrigger id="search-basis" className="w-full">
                  <SelectValue placeholder="등록일" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registration">등록일</SelectItem>
                  <SelectItem value="modification">수정일</SelectItem>
                  <SelectItem value="action">작업일</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="date-range" className="text-sm font-medium">
                조회기간
              </label>
              <div className="flex items-center space-x-2">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  className="flex-1"
                />
                <span className="text-sm">~</span>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="admin" className="text-sm font-medium">
                작업자
              </label>
              <Select>
                <SelectTrigger id="admin" className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="admin1">관리자1</SelectItem>
                  <SelectItem value="admin2">관리자2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="keyword" className="text-sm font-medium">
                키워드
              </label>
              <Input id="keyword" placeholder="키워드를 입력하세요" />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="w-full sm:w-auto">
              초기화
            </Button>
            <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600">
              조회
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TableStylesApplier />
    </div>
  );
}
