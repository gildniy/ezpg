"use client";
import { Download, Search } from "lucide-react";
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
import { TableContainer } from "@ezpg/ui";
import { TableStylesApplier } from "@ezpg/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";
import { DateRangePicker } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { X } from "lucide-react";

export function SettlementReportContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [searchType, setSearchType] = useState<string>("amount");
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value);
  };

  const handleDetailConditionClick = () => {
    setIsDetailConditionOpen(true);
  };

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    if (tableRef.current) {
      // 헤더에 스타일 적용
      const headers = tableRef.current.querySelectorAll("th");
      headers.forEach((header) => {
        const element = header as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
        `;
      });

      // 셀에 스타일 적용
      const cells = tableRef.current.querySelectorAll("td");
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
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">송금 관리</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="일자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">일자</SelectItem>
              <SelectItem value="month">월별</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
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
            <span className="mr-1">엑셀</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <TableContainer minWidth="1600px">
          <table
            ref={tableRef}
            className="w-full text-sm"
            style={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "60px" }} /> {/* 번호 */}
              <col style={{ width: "120px" }} /> {/* 일자 */}
              <col style={{ width: "120px" }} /> {/* 입금액 */}
              <col style={{ width: "120px" }} /> {/* PG사 수수료 */}
              <col style={{ width: "120px" }} /> {/* 본사 수수료 */}
              <col style={{ width: "120px" }} /> {/* 에이전트정산 */}
              <col style={{ width: "120px" }} /> {/* 가맹점정산 */}
              <col style={{ width: "150px" }} /> {/* 출금수수료 수익 */}
              <col style={{ width: "150px" }} /> {/* 에이전트출금액 */}
              <col style={{ width: "120px" }} /> {/* 회원출금액 */}
              <col style={{ width: "150px" }} /> {/* 가맹점 출금 금액 */}
              <col style={{ width: "150px" }} /> {/* 에이전트 잔액 */}
              <col style={{ width: "150px" }} /> {/* 가맹점 잔액 */}
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-center font-medium">번호</th>
                <th className="py-3 px-4 text-center font-medium">일자</th>
                <th className="py-3 px-4 text-center font-medium">입금액</th>
                <th className="py-3 px-4 text-center font-medium">
                  PG사 수수료
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  본사 수수료
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  에이전트정산
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  가맹점정산
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  출금수수료 수익
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  에이전트출금액
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  회원출금액
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  가맹점 출금 금액
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  에이전트 잔액
                </th>
                <th className="py-3 px-4 text-center font-medium">
                  가맹점 잔액
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 dark:border-gray-700 text-center">
                <td className="py-3 px-4">1</td>
                <td className="py-3 px-4">2025-04-01</td>
                <td className="py-3 px-4">3,058,258원</td>
                <td className="py-3 px-4">9,037원</td>
                <td className="py-3 px-4">99,063원</td>
                <td className="py-3 px-4">108,092원</td>
                <td className="py-3 px-4">2,950,158원</td>
                <td className="py-3 px-4">-990원</td>
                <td className="py-3 px-4">0원</td>
                <td className="py-3 px-4">0원</td>
                <td className="py-3 px-4">1,402,630원</td>
                <td className="py-3 px-4">390,709원</td>
                <td className="py-3 px-4">29,586,264원</td>
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700 text-center">
                <td className="py-3 px-4">2</td>
                <td className="py-3 px-4">2025-04-02</td>
                <td className="py-3 px-4">4,125,780원</td>
                <td className="py-3 px-4">12,377원</td>
                <td className="py-3 px-4">123,773원</td>
                <td className="py-3 px-4">144,402원</td>
                <td className="py-3 px-4">3,845,228원</td>
                <td className="py-3 px-4">-1,250원</td>
                <td className="py-3 px-4">250,000원</td>
                <td className="py-3 px-4">125,000원</td>
                <td className="py-3 px-4">1,850,500원</td>
                <td className="py-3 px-4">285,111원</td>
                <td className="py-3 px-4">31,580,992원</td>
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700 text-center">
                <td className="py-3 px-4">3</td>
                <td className="py-3 px-4">2025-04-03</td>
                <td className="py-3 px-4">3,587,920원</td>
                <td className="py-3 px-4">10,764원</td>
                <td className="py-3 px-4">107,638원</td>
                <td className="py-3 px-4">125,577원</td>
                <td className="py-3 px-4">3,343,941원</td>
                <td className="py-3 px-4">-1,100원</td>
                <td className="py-3 px-4">0원</td>
                <td className="py-3 px-4">75,000원</td>
                <td className="py-3 px-4">1,625,800원</td>
                <td className="py-3 px-4">410,688원</td>
                <td className="py-3 px-4">33,299,133원</td>
              </tr>
            </tbody>
          </table>
        </TableContainer>
      </div>

      <TableStylesApplier />

      {/* 상세조건 모달 */}
      <Dialog
        open={isDetailConditionOpen}
        onOpenChange={setIsDetailConditionOpen}
      >
        <DialogContent className="sm:max-w-[450px] w-full">
          <button
            onClick={() => setIsDetailConditionOpen(false)}
            className="absolute right-2 top-2 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </button>
          <DialogHeader className="border-b pb-3">
            <DialogTitle>상세조건</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1.5">
              <label
                htmlFor="date-range"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                조회기간
              </label>
              <DateRangePicker />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="keyword"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                키워드
              </label>
              <Input
                id="keyword"
                placeholder="키워드를 입력하세요"
                className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
          <DialogFooter className="border-t pt-3">
            <Button
              variant="outline"
              onClick={() => setIsDetailConditionOpen(false)}
              className="w-[calc(50%-4px)]"
            >
              초기화
            </Button>
            <Button
              onClick={() => setIsDetailConditionOpen(false)}
              className="w-[calc(50%-4px)] bg-blue-500 hover:bg-blue-600 text-white"
            >
              조회
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
