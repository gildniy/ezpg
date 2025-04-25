"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
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
import { TableContainer } from "@ezpg/ui";
import { DatePicker } from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";
import { Input } from "@ezpg/ui";
import { Dialog, DialogContent } from "@ezpg/ui";
import { Switch } from "@ezpg/ui";

export function SalesManagementContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);
  const [depositStatus, setDepositStatus] = useState<{
    [key: number]: boolean;
  }>({
    1: true,
    2: true,
  });

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
      text-align: center !important;
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
      text-align: center !important;
    `;
      });

      // 테이블 레이아웃을 auto로 변경
      tableRef.current.style.tableLayout = "auto";
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium dark:text-white">{"매출 관리"}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <SelectValue placeholder={"가맹점"} />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white">
                {"가맹점"}
              </SelectItem>
              <SelectItem value="sticpay" className="dark:text-white">
                sticpay
              </SelectItem>
              <SelectItem value="atglobal" className="dark:text-white">
                atglobal
              </SelectItem>
            </SelectContent>
          </Select>

          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <SelectValue placeholder={`${"보기"}`} />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="10" className="dark:text-white">
                10
              </SelectItem>
              <SelectItem value="25" className="dark:text-white">
                25
              </SelectItem>
              <SelectItem value="50" className="dark:text-white">
                50
              </SelectItem>
              <SelectItem value="100" className="dark:text-white">
                100
              </SelectItem>
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
            <span className="mr-1">{"Excel"}</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {"입금액"}
          </div>
          <div className="text-lg font-bold mt-1 dark:text-white">
            2,858,258{"원"}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {"총 입금 건수"}
          </div>
          <div className="text-lg font-bold mt-1 dark:text-white">6{"건"}</div>
        </div>
        {/* 본사 수수료와 에이전트 수수료의 위치 변경 */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {"본사 수수료"}
          </div>
          <div className="text-lg font-bold mt-1 dark:text-white">
            107,330{"원"}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {"에이전트수수료"}
          </div>
          <div className="text-lg font-bold mt-1 dark:text-white">
            107,323{"원"}
          </div>
        </div>
      </div>

      <TableContainer minWidth="1500px">
        <table ref={tableRef} className="w-full text-sm sales-management-table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"번호"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"입금일시"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"가맹점"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"업체명"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"아이디"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"입금은행"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"가상계좌"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"형식"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"상태"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"입금자명"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"입금액"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                정산금액
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"에이전트수수료"}
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                {"본사 수수료"}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700 text-center text-xs dark:text-gray-200">
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                1
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                2025-02-17 14:30:24
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  sticpay
                </span>
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                sticpay business
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                user1234
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                신한은행
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                7732525551
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                <div className="flex items-center justify-center">
                  <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-1 rounded text-xs">
                    {"고정식"}
                  </div>
                </div>
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{depositStatus[1] ? "입금" : "취소"}</span>
                  <Switch
                    checked={depositStatus[1]}
                    onCheckedChange={(checked) =>
                      setDepositStatus((prev) => ({ ...prev, 1: checked }))
                    }
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                홍길동
              </td>
              <td
                className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                1,230,000원
              </td>
              <td
                className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                1,113,700원
              </td>
              <td
                className="py-3 px-4 font-bold text-red-600 dark:text-red-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                36,900원
              </td>
              <td
                className="py-3 px-4 font-bold text-red-600 dark:text-red-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                36,900원
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700 text-center text-xs dark:text-gray-200">
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                2
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                2025-02-17 14:30:24
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  sticpay
                </span>
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                sticpay business
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                user1234
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                신한은행
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                7732525551
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                <div className="flex items-center justify-center">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded text-xs">
                    {"회전식"}
                  </div>
                </div>
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{depositStatus[2] ? "입금" : "취소"}</span>
                  <Switch
                    checked={depositStatus[2]}
                    onCheckedChange={(checked) =>
                      setDepositStatus((prev) => ({ ...prev, 2: checked }))
                    }
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>
              </td>
              <td
                className="py-3 px-4"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                김영희
              </td>
              <td
                className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                1,628,258원
              </td>
              <td
                className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                1,479,827원
              </td>
              <td
                className="py-3 px-4 font-bold text-red-600 dark:text-red-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                48,847원
              </td>
              <td
                className="py-3 px-4 font-bold text-red-600 dark:text-red-400"
                style={{ textAlign: "center", whiteSpace: "nowrap" }}
              >
                48,847원
              </td>
            </tr>
          </tbody>
        </table>
      </TableContainer>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">총 2건</div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">1</span>
          <Button
            variant="outline"
            size="sm"
            className="dark:border-gray-700 dark:text-gray-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Condition Modal */}
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
  const [startDate, setStartDate] = useState<Date>(new Date("2025-04-01"));
  const [endDate, setEndDate] = useState<Date>(new Date("2025-04-01"));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold dark:text-white">상세조건</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="dark:text-gray-400 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                시작일
              </label>
              <Input
                type="date"
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                종료일
              </label>
              <Input
                type="date"
                value={endDate.toISOString().split("T")[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              가맹점
            </label>
            <Select>
              <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="가맹점 선택" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all" className="dark:text-white">
                  전체
                </SelectItem>
                <SelectItem value="sticpay" className="dark:text-white">
                  sticpay
                </SelectItem>
                <SelectItem value="atglobal" className="dark:text-white">
                  atglobal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              상태
            </label>
            <Select>
              <SelectTrigger className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all" className="dark:text-white">
                  전체
                </SelectItem>
                <SelectItem value="active" className="dark:text-white">
                  활성
                </SelectItem>
                <SelectItem value="inactive" className="dark:text-white">
                  비활성
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="dark:border-gray-700 dark:text-gray-200"
          >
            취소
          </Button>
          <Button onClick={onClose}>적용</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
