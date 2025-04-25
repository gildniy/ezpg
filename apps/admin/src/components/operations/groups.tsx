"use client";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { useMerchantGroups } from "@/hooks/use-merchant-groups";
import {
  AdminMerchantGroupsCreateDto,
  AdminMerchantGroupsCreateDtoStatusEnum,
  AdminMerchantGroupsResponseDto,
} from "@ezpg/api-client";
import { useToast } from "@ezpg/ui";

export function GroupsContent() {
  const { toast } = useToast();
  const tableRef = useRef<HTMLTableElement>(null);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedGroup, setSelectedGroup] =
    useState<AdminMerchantGroupsResponseDto | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [onlyDeleted, setOnlyDeleted] = useState(false);
  const [groups, setGroups] = useState<AdminMerchantGroupsResponseDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupStatus, setNewGroupStatus] =
    useState<AdminMerchantGroupsCreateDtoStatusEnum>(
      AdminMerchantGroupsCreateDtoStatusEnum.Active,
    );

  const {
    createMerchantGroup,
    getAllMerchantGroups,
    getMerchantGroup,
    deleteMerchantGroup,
    isLoading,
    error,
  } = useMerchantGroups();

  useEffect(() => {
    loadGroups();
  }, [page, limit, search, includeDeleted, onlyDeleted]);

  const loadGroups = async () => {
    const result = await getAllMerchantGroups(
      page,
      limit,
      search,
      includeDeleted,
      onlyDeleted,
    );
    if (result) {
      setGroups(result.data);
      setTotalPages(result.meta.totalPages);
    } else {
      setGroups([]);
      toast({
        title: "오류",
        description: "그룹을 불러오는데 실패했습니다",
        variant: "destructive",
      });
    }
  };

  const handleRegisterSubmit = async () => {
    const data: AdminMerchantGroupsCreateDto = {
      groupName: newGroupName,
      status: newGroupStatus,
    };

    const result = await createMerchantGroup(data);
    if (result) {
      toast({
        title: "성공",
        description: "그룹이 생성되었습니다",
      });
      setShowRegisterPopup(false);
      setNewGroupName("");
      setNewGroupStatus(AdminMerchantGroupsCreateDtoStatusEnum.Active);
      loadGroups();
    } else {
      toast({
        title: "오류",
        description: error?.message || "그룹 생성에 실패했습니다",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (groupId: number) => {
    const success = await deleteMerchantGroup(groupId);
    if (success) {
      toast({
        title: "성공",
        description: "그룹이 삭제되었습니다",
      });
      loadGroups();
    } else {
      toast({
        title: "오류",
        description: error?.message || "그룹 삭제에 실패했습니다",
        variant: "destructive",
      });
    }
  };

  const handleDetailSubmit = async (group: AdminMerchantGroupsResponseDto) => {
    const updatedGroup = await getMerchantGroup(group.groupId);
    if (updatedGroup) {
      setSelectedGroup(updatedGroup);
      setShowDetailPopup(true);
    } else {
      toast({
        title: "오류",
        description:
          error?.message || "그룹 상세 정보를 불러오는데 실패했습니다",
        variant: "destructive",
      });
    }
  };

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .groups-table th, .groups-table td {
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;
        height: 3rem !important;
        line-height: 3rem !important;
        padding: 0.75rem 1rem !important;
      }
      .groups-table {
        table-layout: auto !important;
        width: 100% !important;
      }
      .groups-table-container {
        overflow-x: auto !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          그룹
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
        >
          <span className="mr-1">상세</span>
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
          onClick={() => setShowRegisterPopup(true)}
        >
          <span className="mr-1">추가</span>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="groups-table-container bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <table ref={tableRef} className="w-full text-sm groups-table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium">번호</th>
              <th className="py-3 px-4 text-center font-medium">그룹명</th>
              <th className="py-3 px-4 text-center font-medium">상태</th>
              <th className="py-3 px-4 text-center font-medium">등록일</th>
              <th className="py-3 px-4 text-center font-medium">수정일</th>
              <th className="py-3 px-4 text-center font-medium">운영자</th>
              <th className="py-3 px-4 text-center font-medium">행동</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, index) => (
              <tr
                key={group.groupId}
                className="border-t border-gray-200 dark:border-gray-700 text-center"
              >
                <td className="py-3 px-4">{(page - 1) * limit + index + 1}</td>
                <td className="py-3 px-4">{group.groupName}</td>
                <td className="py-3 px-4">{group.status}</td>
                <td className="py-3 px-4">
                  {group.createdAt
                    ? new Date(group.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="py-3 px-4">
                  {group.updatedAt
                    ? new Date(group.updatedAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="py-3 px-4">{group.creatorUsername}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                      onClick={() => handleDetailSubmit(group)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                      onClick={() => handleDelete(group.groupId)}
                    >
                      삭제
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 bg-blue-500 border-blue-500 text-white hover:bg-blue-600"
            >
              {page}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 dark:border-gray-700"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 등록 팝업 */}
      <Dialog open={showRegisterPopup} onOpenChange={setShowRegisterPopup}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>그룹 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label htmlFor="groupName" className="text-sm font-medium">
                그룹명
              </label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="그룹명을 입력하세요"
                className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium">
                상태
              </label>
              <Select
                value={newGroupStatus}
                onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                  setNewGroupStatus(value)
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="상태를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="INACTIVE">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegisterPopup(false)}
            >
              취소
            </Button>
            <Button onClick={handleRegisterSubmit} disabled={isLoading}>
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 상세보기 팝업 */}
      <Dialog open={showDetailPopup} onOpenChange={setShowDetailPopup}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>그룹 상세</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p>그룹명: {selectedGroup?.groupName}</p>
              <p>상태: {selectedGroup?.status}</p>
              <p>
                등록일:{" "}
                {selectedGroup?.createdAt
                  ? new Date(selectedGroup.createdAt).toLocaleDateString()
                  : "-"}
              </p>
              <p>
                수정일:{" "}
                {selectedGroup?.updatedAt
                  ? new Date(selectedGroup.updatedAt).toLocaleDateString()
                  : "-"}
              </p>
              <p>운영자: {selectedGroup?.creatorUsername}</p>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDetailPopup(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
