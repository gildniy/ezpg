"use client";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import type React from "react";

import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";
import { TableContainer } from "@ezpg/ui";
import { TableStylesApplier } from "@ezpg/ui";
import { useNavigation } from "@/contexts/navigation-context";
import { Input } from "@ezpg/ui";

export function DeletedMembersContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const { navigateTo } = useNavigation();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    merchant: "",
    keyword: "",
  });

  // 상세조건 모달 열기/닫기
  const toggleDetailModal = () => {
    setIsDetailModalOpen(!isDetailModalOpen);
  };

  // 검색 조건 초기화
  const resetSearchParams = () => {
    setSearchParams({
      merchant: "",
      keyword: "",
    });
  };

  // 검색 실행
  const handleSearch = () => {
    console.log("검색 조건:", searchParams);
    // 여기에 실제 검색 로직 구현
    setIsDetailModalOpen(false);
  };

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 가맹점 선택 처리
  const handleMerchantChange = (value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      merchant: value,
    }));
  };

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    if (tableRef.current) {
      // 테이블 헤더에 스타일 적용
      const headers = tableRef.current.querySelectorAll("th");
      headers.forEach((header) => {
        const element = header as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          max-height: 3rem !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
          text-align: center !important;
        `;
      });

      // 테이블 셀에도 스타일 적용
      const cells = tableRef.current.querySelectorAll("td");
      cells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          max-height: 3rem !important;
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

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">삭제된 회원</h2>
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
          onClick={toggleDetailModal}
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
          엑셀다운로드
        </Button>
      </div>

      {/* 상세조건 모달 */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">상세 검색 조건</h3>
              <button
                onClick={toggleDetailModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">가맹점</label>
                <Select
                  value={searchParams.merchant}
                  onValueChange={handleMerchantChange}
                >
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                    <SelectValue placeholder="가맹점 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="merchant1">가맹점1</SelectItem>
                    <SelectItem value="merchant2">가맹점2</SelectItem>
                    <SelectItem value="merchant3">가맹점3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">키워드</label>
                <Input
                  name="keyword"
                  value={searchParams.keyword}
                  onChange={handleInputChange}
                  placeholder="아이디, 실명, 휴대폰 등"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={resetSearchParams}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                초기화
              </Button>
              <Button
                onClick={handleSearch}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                조회
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto w-full">
        <TableContainer minWidth="1800px">
          <table
            ref={tableRef}
            className="w-full text-sm"
            style={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "150px" }} /> {/* 가상계좌 */}
              <col style={{ width: "180px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "240px" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  번호
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  아이디
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  가맹점
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  업체명
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  실명
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  휴대폰
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  주민등록번호
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  예금주
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  은행
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  계좌번호
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  가상계좌
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  가입일자
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  총 입금
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  총 출금
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  상태
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  1
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      test01
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      test03
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  test03
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  test01
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  010-1234-5678
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  900101-1234567
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  test01
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  국민은행
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  7016800760867
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  110-123456-78901
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  2025-02-21 22:14:39
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  6,100,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  3,500,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  미사용
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                    >
                      복구
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 text-xs rounded-full px-3 ml-2 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                      완전삭제
                    </Button>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  2
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      user123
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      merchant05
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  주식회사 예시
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  김철수
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  010-9876-5432
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  880505-2345678
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  김철수
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  신한은행
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  110987654321
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  110-987654-32109
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  2024-01-15 14:22:10
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  12,500,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  8,750,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  미사용
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                    >
                      복구
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 text-xs rounded-full px-3 ml-2 dark:border-red-800 dark:hover:bg-red-900/30"
                    >
                      완전삭제
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </TableContainer>
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
      <TableStylesApplier />
    </div>
  );
}
