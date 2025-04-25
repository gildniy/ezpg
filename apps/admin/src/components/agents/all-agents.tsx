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
import { useEffect, useRef, useState } from "react";
import { TableContainer } from "@ezpg/ui";
import { useNavigation } from "@/contexts/navigation-context";
import { TableStylesApplier } from "@ezpg/ui";
import { AgentDetailModal } from "./agent-detail-modal";
import { useAgents } from "@/hooks/use-agents";
import { AgentResponseDto } from "@ezpg/api-client";

export function AllAgentsContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const { navigateTo } = useNavigation();

  // 모달 상태 관리
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentResponseDto | null>(
    null,
  );
  const [agentToDelete, setAgentToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Use the useAgents hook for agent data
  const { agents, isLoading, error, fetchAgents } = useAgents();
  const [agentsState, setAgentsState] = useState<AgentResponseDto[]>([]);

  console.log(agents);

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents({});
  }, [fetchAgents]);

  useEffect(() => {
    setAgentsState(agents);
  }, [agents]);

  const handleAgentUpdate = (updatedAgent: AgentResponseDto) => {
    setAgentsState((prev) =>
      prev.map((agent) =>
        agent.id === updatedAgent.id ? updatedAgent : agent,
      ),
    );
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
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
          text-align: center !important;
        `;
      });

      // 테이블 셀에 스타일 적용
      const cells = tableRef.current.querySelectorAll("td");
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
    }
  }, []);

  const handleRegisterClick = () => {
    // 에이전트 등록 페이지로 이동
    navigateTo("agents-register");
  };

  const handleDetailClick = (agent: AgentResponseDto) => {
    setSelectedAgent(agent);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (agentId: number, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // 여기에 실제 삭제 API 호출 로직 구현
    console.log(`에이전트 ${agentToDelete?.id} 삭제`);

    // 삭제 후 모달 닫기
    setIsDeleteModalOpen(false);
    setAgentToDelete(null);

    // 성공 메시지 표시
    alert(`에이전트 ${agentToDelete?.name}이(가) 삭제되었습니다.`);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">전체 에이전트</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center ml-auto">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 mx-2 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="보기" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="agentId">
            <SelectTrigger className="w-36 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="검색 조건" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agentId">에이전트 ID</SelectItem>
              <SelectItem value="agentName">에이전트 이름</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="ml-2 dark:border-gray-700 dark:text-gray-200"
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
            <span className="mr-1">에이전트 등록</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div style={{ overflowX: "auto", width: "100%" }}>
        <TableContainer minWidth="1200px">
          <table
            ref={tableRef}
            className="w-full text-sm all-agents-table"
            style={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "80px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
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
                  기타
                </th>
                <th
                  className="py-3 px-4 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  상세보기
                </th>
              </tr>
            </thead>
            <tbody>
              {agentsState.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    {agent.id}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    <div className="flex justify-center">
                      <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                        {agent.agentId}
                      </span>
                    </div>
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    {agent.agentName}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    {agent.balance}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    {agent.status}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    {agent.createdAt}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    {agent.updatedAt}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    {agent.createdBy}
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 text-xs rounded-full px-3 dark:border-red-800 dark:hover:bg-red-900/30"
                        onClick={() =>
                          handleDeleteClick(agent.id, agent.agentName)
                        }
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                  <td
                    className="py-3 px-4 text-center"
                    style={{ textAlign: "center" }}
                  >
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                        onClick={() => handleDetailClick(agent)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        상세보기
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
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
      <TableStylesApplier />

      {/* 에이전트 상세 정보 모달 */}
      {selectedAgent && (
        <AgentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          agentId={selectedAgent.agentId}
          agentData={selectedAgent}
          onAgentUpdate={handleAgentUpdate}
        />
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && agentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">에이전트 삭제</h3>
            <p className="mb-6">
              정말로 <span className="font-bold">{agentToDelete.name}</span>{" "}
              에이전트를 삭제하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="border-gray-200 dark:border-gray-700"
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
