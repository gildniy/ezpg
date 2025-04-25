"use client";

import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TableContainer,
  DatePicker,
} from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";

export function AgentBalanceLogContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [selectedAgent, setSelectedAgent] = useState("all");

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value);
  };

  useEffect(() => {
    if (tableRef.current) {
      const headers = tableRef.current.querySelectorAll("th");
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

      const cells = tableRef.current.querySelectorAll("td");
      cells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          text-align: center !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">에이전트 출금내역</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="등록 일자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">등록 일자</SelectItem>
              <SelectItem value="agent">에이전트</SelectItem>
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

          <Select value={selectedAgent} onValueChange={handleAgentChange}>
            <SelectTrigger className="w-40 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="에이전트" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merchant">가맹점</SelectItem>
              <SelectItem value="bank">은행</SelectItem>
              <SelectItem value="vacc">가상계좌</SelectItem>
              <SelectItem value="accname">예금주</SelectItem>
              <SelectItem value="type">형식</SelectItem>
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

      <TableContainer>
        <table
          ref={tableRef}
          className="w-full text-sm agent-balance-log-table"
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
                날짜
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
                내용
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                변경금액
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                변경후금액
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
                2025-04-01 12:00:00
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                robert
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                입금
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                +100,000
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                100,000
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
                2025-04-01 13:00:00
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                youknow327
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                출금
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                -50,000
              </td>
              <td
                className="py-3 px-4 text-center"
                style={{ textAlign: "center" }}
              >
                50,000
              </td>
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
      </TableContainer>
    </div>
  );
}
