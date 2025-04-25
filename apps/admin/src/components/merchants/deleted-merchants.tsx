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
import { useEffect, useRef } from "react";
import { TableContainer } from "@ezpg/ui";

export function DeletedMerchantsContent() {
  const tableRef = useRef<HTMLTableElement>(null);

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
          maxWidth: 200px !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">삭제된 가맹점</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center ml-auto">
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

          <Select>
            <SelectTrigger className="w-32 mx-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="검색 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merchant">가맹점</SelectItem>
              <SelectItem value="company">업체명</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="ml-2 dark:border-gray-700 dark:text-gray-200"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[2500px]">
          <TableContainer>
            <table ref={tableRef} className="w-full text-sm mx-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    번호
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    가맹점그룹
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    가맹점
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    업체명
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    회원가입수
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    본사
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    에이전트1
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    에이전트2
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    에이전트3
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    에이전트4
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    에이전트5
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    가상계좌사용
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    가상계좌제한
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    총입금
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    입금수수료
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    총출금금액
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    출금수수료
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    민원금액
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    유보금액
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    잔액
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    상태
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    등록일시
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    수정일시
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    작업자
                  </th>
                  <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">글로벌 파트너</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      test01
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">Test Company</td>
                  <td className="py-3 px-4 text-center">1,245</td>
                  <td className="py-3 px-4 text-center">35%</td>
                  <td className="py-3 px-4 text-center">15%</td>
                  <td className="py-3 px-4 text-center">10%</td>
                  <td className="py-3 px-4 text-center">5%</td>
                  <td className="py-3 px-4 text-center">3%</td>
                  <td className="py-3 px-4 text-center">2%</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs">
                      사용
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">없음</td>
                  <td className="py-3 px-4 text-center">1,500,000</td>
                  <td className="py-3 px-4 text-center">4,950</td>
                  <td className="py-3 px-4 text-center">1,200,000</td>
                  <td className="py-3 px-4 text-center">1,320</td>
                  <td className="py-3 px-4 text-center">0</td>
                  <td className="py-3 px-4 text-center">30,000</td>
                  <td className="py-3 px-4 text-center">273,730</td>
                  <td className="py-3 px-4 text-center">삭제됨</td>
                  <td className="py-3 px-4 text-center">2025-04-01 10:00:00</td>
                  <td className="py-3 px-4 text-center">2025-04-01 10:00:00</td>
                  <td className="py-3 px-4 text-center">admin</td>
                  <td className="py-3 px-4 text-center">
                    <Button variant="outline" size="sm">
                      복구
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </TableContainer>
        </div>
      </div>

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
  );
}
