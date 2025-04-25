"use client";
import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
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
import { useEffect, useRef, useState } from "react";
import { TableContainer } from "@ezpg/ui";
import { TableStylesApplier } from "@ezpg/ui";
import { useAgents } from "@/hooks/use-agents";

export function DeletedAgentsContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    agentId: "",
    agentName: "",
    status: "",
    dateRange: "",
  });

  const {
    agents,
    isLoading,
    error,
    fetchDeleted,
    recoverAgent,
    permanentDeleteAgent,
    totalPages,
    totalAgents,
  } = useAgents();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchDeleted({ page, limit });
  }, [fetchDeleted, page, limit]);

  const handleSearchParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, status: value }));
  };

  const handleSearch = () => {
    console.log("검색 조건:", searchParams);
    // 여기에 검색 로직 구현
    setIsSearchDialogOpen(false);
  };

  const resetSearchParams = () => {
    setSearchParams({
      agentId: "",
      agentName: "",
      status: "",
      dateRange: "",
    });
  };

  const [agentFormData, setAgentFormData] = useState({
    agentId: "",
    agentName: "",
    email: "",
    phone: "",
    status: "active",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAgentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgentStatusChange = (value: string) => {
    setAgentFormData((prev) => ({ ...prev, status: value }));
  };

  const handleRegisterAgent = () => {
    // 여기에 에이전트 등록 로직 구현
    console.log("등록할 에이전트 정보:", agentFormData);
    // 성공 시 다이얼로그 닫기
    setIsRegisterDialogOpen(false);
    // 폼 초기화
    setAgentFormData({
      agentId: "",
      agentName: "",
      email: "",
      phone: "",
      status: "active",
    });
    // 성공 메시지 표시 등의 추가 작업...
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
          text-align: center !important;
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
          display: table-cell !important;
          text-align: center !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">삭제된 에이전트</h2>
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

          <Button
            variant="outline"
            className="ml-4 dark:border-gray-700 dark:text-gray-200"
            onClick={() => setIsSearchDialogOpen(true)}
          >
            <span className="mr-1">상세조건</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="ml-4 dark:border-gray-700 dark:text-gray-200"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="ml-4 dark:border-gray-700 dark:text-gray-200"
            onClick={() => setIsRegisterDialogOpen(true)}
          >
            <span className="mr-1">삭제 등록</span>
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 상세 검색 조건 모달 */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              상세 검색 조건
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentId" className="text-right">
                에이전트 아이디
              </Label>
              <Input
                id="agentId"
                name="agentId"
                placeholder="에이전트 아이디 입력"
                value={searchParams.agentId}
                onChange={handleSearchParamChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentName" className="text-right">
                에이전트명
              </Label>
              <Input
                id="agentName"
                name="agentName"
                placeholder="에이전트명 입력"
                value={searchParams.agentName}
                onChange={handleSearchParamChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                상태
              </Label>
              <Select
                value={searchParams.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateRange" className="text-right">
                삭제일
              </Label>
              <Input
                id="dateRange"
                name="dateRange"
                placeholder="날짜 범위 선택"
                value={searchParams.dateRange}
                onChange={handleSearchParamChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={resetSearchParams}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              초기화
            </Button>
            <Button
              onClick={handleSearch}
              className="flex items-center bg-blue-500 hover:bg-blue-600"
            >
              <Search className="h-4 w-4 mr-1" />
              검색
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 에이전트 등록 모달 */}
      <Dialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              신규 에이전트 등록
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentId" className="text-right">
                아이디 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="agentId"
                name="agentId"
                placeholder="에이전트 아이디 입력"
                value={agentFormData.agentId}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agentName" className="text-right">
                에이전트명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="agentName"
                name="agentName"
                placeholder="에이전트 이름 입력"
                value={agentFormData.agentName}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                이메일
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일 주소 입력"
                value={agentFormData.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                연락처
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="연락처 입력 (예: 010-1234-5678)"
                value={agentFormData.phone}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                상태 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={agentFormData.status}
                onValueChange={handleAgentStatusChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialBalance" className="text-right">
                초기 잔액
              </Label>
              <Input
                id="initialBalance"
                name="initialBalance"
                type="number"
                placeholder="0"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="text-xs text-gray-500">
              <span className="text-red-500">*</span> 표시는 필수 입력
              항목입니다
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsRegisterDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                onClick={handleRegisterAgent}
                className="bg-blue-500 hover:bg-blue-600"
              >
                등록
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto" style={{ width: "100%" }}>
        <div>
          <TableContainer>
            <table
              ref={tableRef}
              className="w-full text-sm deleted-agents-table"
              style={{ tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: "60px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "180px" }} />
                <col style={{ width: "180px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "220px" }} />
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
                    에이전트아이디
                  </th>
                  <th
                    className="py-3 px-4 text-center font-medium"
                    style={{ textAlign: "center" }}
                  >
                    에이전트명
                  </th>
                  <th
                    className="py-3 px-4 text-center font-medium"
                    style={{ textAlign: "center" }}
                  >
                    잔액
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
                    등록일시
                  </th>
                  <th
                    className="py-3 px-4 text-center font-medium"
                    style={{ textAlign: "center" }}
                  >
                    수정일시
                  </th>
                  <th
                    className="py-3 px-4 text-center font-medium"
                    style={{ textAlign: "center" }}
                  >
                    작업자
                  </th>
                  <th
                    className="py-3 px-4 text-center font-medium"
                    style={{ textAlign: "center" }}
                  >
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-red-500">
                      {error.message}
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-6">
                      No deleted agents found.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent, idx) => (
                    <tr
                      key={agent.agentId}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-3 px-4 text-center">
                        {idx + 1 + (page - 1) * limit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center">
                          <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                            {agent.agentId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {agent.agentName}
                      </td>
                      <td className="py-3 px-4 text-center">{agent.balance}</td>
                      <td className="py-3 px-4 text-center">
                        {agent.status === "active" ? "활성" : "미사용"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {agent.createdAt}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {agent.updatedAt}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {agent.createdByName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                            onClick={() => recoverAgent(agent.agentId)}
                          >
                            복구
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 text-xs rounded-full px-3 dark:border-red-800 dark:hover:bg-red-900/30"
                            onClick={() => permanentDeleteAgent(agent.agentId)}
                          >
                            완전삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
      <TableStylesApplier />
    </div>
  );
}
