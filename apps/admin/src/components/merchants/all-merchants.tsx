"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  Eye,
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
import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/contexts/navigation-context";
import { MerchantDetailModal } from "./merchant-detail-modal";

export function AllMerchantsContent() {
  const { navigateTo } = useNavigation();
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMerchantId, setSelectedMerchantId] = useState("");

  useEffect(() => {
    if (tableRef.current) {
      // 테이블 헤더에 스타일 적용
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
          text-align: center !important;
        `;
      });

      // 테이블 셀에도 동일한 스타일 적용
      const cells = tableRef.current.querySelectorAll("td");
      cells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
          text-align: center !important;
        `;
      });
    }
  }, []);

  const handleRegisterClick = () => {
    navigateTo("merchants-register");
  };

  const handleDetailClick = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">전체 가맹점</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center ml-auto">
          <Select>
            <SelectTrigger className="w-32 mx-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
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
              <SelectItem value="group">그룹</SelectItem>
              <SelectItem value="merchantName">가맹점명</SelectItem>
              <SelectItem value="companyName">회사명</SelectItem>
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
            className="ml-2 dark:border-gray-700 dark:text-gray-200"
          >
            <span className="mr-1">엑셀</span>
            <Download className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="ml-2 dark:border-gray-700 dark:text-gray-200"
            onClick={handleRegisterClick}
          >
            <span className="mr-1">가맹점 등록</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TableContainer className="overflow-x-auto">
        <table
          ref={tableRef}
          className="w-full text-sm all-merchants-table"
          style={{ minWidth: "2000px", tableLayout: "auto" }}
        >
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                번호
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                가맹점그룹
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                가맹점
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                업체명
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                회원가입수
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                입금수수료
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                원화수수료
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                외화수수료
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                외화최종수수료
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                에이전트1
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                에이전트2
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                에이전트3
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                에이전트4
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                에이전트5
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                가상계좌사용
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                가상계좌제한
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                총입금
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                입금수수료
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                총출금금액
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                출금수수료
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                민원금액
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                유보금액
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                잔액
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                상태
              </th>
              <th
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4 font-medium dark:text-gray-200"
              >
                상세보기
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                1
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                제휴사 그룹
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                  sticpay
                </span>
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                sticpay
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                71
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0.33
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0.11
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                1
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                3
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                55
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                35
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                10
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs">
                  사용
                </span>
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                없음
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                1,500,000
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                4,950
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                1,200,000
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                1,320
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                30,000
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                273,730
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                사용
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                  onClick={() => handleDetailClick("merchant1")}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  상세보기
                </Button>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                2
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                제휴사 그룹
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                  atglobal
                </span>
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                atglobal
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                52
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                2.75
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                2.2
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                1.1
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                55
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                35
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                10
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                0
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                  미사용
                </span>
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                10개
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                2,750,000
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                7,563
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                2,500,000
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                2,750
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                50,000
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                75,000
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                224,687
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                사용
              </td>
              <td
                style={{ whiteSpace: "nowrap", textAlign: "center" }}
                className="py-3 px-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                  onClick={() => handleDetailClick("merchant2")}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  상세보기
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </TableContainer>
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

      {/* 상세보기 모달 */}
      <MerchantDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        merchantId={selectedMerchantId}
      />
    </div>
  );
}
