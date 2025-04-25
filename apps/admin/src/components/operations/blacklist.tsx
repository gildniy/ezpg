"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
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
import { Input } from "@ezpg/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ezpg/ui";
import { useRef, useEffect, useState } from "react";

interface BlacklistItem {
  id: number;
  registrationDate: string;
  category: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  birthDate: string;
  ipAddress: string;
  reason: string;
  blockStartDate: string;
  blockEndDate: string;
  status: string;
  registrar: string;
}

export function BlacklistContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);
  const [isAddBlacklistOpen, setIsAddBlacklistOpen] = useState(false); // 팝업 상태 관리
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [newBlacklist, setNewBlacklist] = useState({
    category: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    reason: "",
  });

  const handleDetailConditionClick = () => {
    setIsDetailConditionOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (confirm(`선택한 ${selectedItems.length}개 항목을 삭제하시겠습니까?`)) {
      // 실제 삭제 로직은 여기에 구현
      console.log("삭제할 항목:", selectedItems);
      // 삭제 후 선택 초기화
      setSelectedItems([]);
      alert("선택한 항목이 삭제되었습니다.");
    }
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedItems(blacklistEntries.map((entry) => entry.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBlacklist((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBlacklistSubmit = () => {
    console.log("새로운 블랙리스트 항목:", newBlacklist);
    // 실제 항목 추가 로직 구현

    // 팝업 닫기
    setIsAddBlacklistOpen(false);
    alert("블랙리스트에 새로운 항목이 추가되었습니다.");
  };

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    // 전역 스타일 적용을 방지하기 위한 스타일 태그 추가
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .blacklist-table th, .blacklist-table td {
        white-space: nowrap !important;
        overflow: visible !important;
        text-overflow: clip !important;
        height: 3rem !important;
        line-height: 3rem !important;
        padding: 0.75rem 1rem !important;
      }
      
      .blacklist-table {
        table-layout: auto !important;
        width: 100% !important;
      }
      
      .blacklist-table-container {
        overflow-x: auto !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const blacklistEntries = [
    {
      id: 1,
      registrationDate: "2025/04/14 10:23:45",
      category: "계정",
      bankName: "KB국민은행",
      accountNumber: "123456-01-123456",
      accountHolder: "김철수",
      birthDate: "1985-03-15",
      ipAddress: "123.45.67.89",
      reason: "부정 거래 시도",
      blockStartDate: "2025/04/14",
      blockEndDate: "2025/07/14",
      status: "차단중",
      registrar: "admin01",
    },
    {
      id: 2,
      registrationDate: "2025/04/13 15:42:18",
      category: "계좌",
      bankName: "신한은행",
      accountNumber: "110-123-456789",
      accountHolder: "이영희",
      birthDate: "1990-07-22",
      ipAddress: "98.76.54.32",
      reason: "사기 의심",
      blockStartDate: "2025/04/13",
      blockEndDate: "2025/10/13",
      status: "차단중",
      registrar: "admin02",
    },
    // 추가적인 블랙리스트 항목들...
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">블랙리스트</h2>
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

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200 text-red-500 hover:text-red-600 hover:border-red-200"
          onClick={handleBulkDelete}
        >
          <span className="mr-1">일괄삭제</span>
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
          onClick={() => setIsAddBlacklistOpen(true)}
        >
          <span className="mr-1">등록</span>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 블랙리스트 추가 팝업 */}
      <Dialog open={isAddBlacklistOpen} onOpenChange={setIsAddBlacklistOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>블랙리스트 등록</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                분류
              </label>
              <Select
                value={newBlacklist.category}
                onValueChange={(value) =>
                  setNewBlacklist({ ...newBlacklist, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="분류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">계정</SelectItem>
                  <SelectItem value="bankAccount">계좌</SelectItem>
                  <SelectItem value="ip">IP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="bankName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                은행명
              </label>
              <Input
                id="bankName"
                value={newBlacklist.bankName}
                onChange={handleInputChange}
                name="bankName"
                placeholder="은행명"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="accountNumber"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                계좌번호
              </label>
              <Input
                id="accountNumber"
                value={newBlacklist.accountNumber}
                onChange={handleInputChange}
                name="accountNumber"
                placeholder="계좌번호"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="accountHolder"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                예금주
              </label>
              <Input
                id="accountHolder"
                value={newBlacklist.accountHolder}
                onChange={handleInputChange}
                name="accountHolder"
                placeholder="예금주"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="reason"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                차단사유
              </label>
              <Input
                id="reason"
                value={newBlacklist.reason}
                onChange={handleInputChange}
                name="reason"
                placeholder="차단사유"
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAddBlacklistOpen(false)}
              className="w-[calc(50%-4px)]"
            >
              취소
            </Button>
            <Button
              onClick={handleAddBlacklistSubmit}
              className="w-[calc(50%-4px)] bg-blue-500 hover:bg-blue-600"
            >
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 테이블 */}
      <div className="blacklist-table-container bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <table ref={tableRef} className="w-full text-sm blacklist-table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600"
                  onChange={(e) => handleSelectAllChange(e.target.checked)}
                  checked={
                    selectedItems.length === blacklistEntries.length &&
                    blacklistEntries.length > 0
                  }
                />
              </th>
              <th className="py-3 px-4 text-center font-medium">번호</th>
              <th className="py-3 px-4 text-center font-medium">등록일시</th>
              <th className="py-3 px-4 text-center font-medium">분류</th>
              <th className="py-3 px-4 text-center font-medium">은행명</th>
              <th className="py-3 px-4 text-center font-medium">계좌번호</th>
              <th className="py-3 px-4 text-center font-medium">예금주</th>
              <th className="py-3 px-4 text-center font-medium">생년월일</th>
              <th className="py-3 px-4 text-center font-medium">IP주소</th>
              <th className="py-3 px-4 text-center font-medium">차단사유</th>
              <th className="py-3 px-4 text-center font-medium">상태</th>
              <th className="py-3 px-4 text-center font-medium">기타</th>
            </tr>
          </thead>
          <tbody>
            {blacklistEntries.map((entry) => (
              <tr
                key={entry.id}
                className="border-t border-gray-200 dark:border-gray-700 text-center"
              >
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600"
                    onChange={(e) =>
                      handleCheckboxChange(entry.id, e.target.checked)
                    }
                    checked={selectedItems.includes(entry.id)}
                  />
                </td>
                <td className="py-3 px-4">{entry.id}</td>
                <td className="py-3 px-4">{entry.registrationDate}</td>
                <td className="py-3 px-4">{entry.category}</td>
                <td className="py-3 px-4">{entry.bankName}</td>
                <td className="py-3 px-4">{entry.accountNumber}</td>
                <td className="py-3 px-4">{entry.accountHolder}</td>
                <td className="py-3 px-4">{entry.birthDate}</td>
                <td className="py-3 px-4">{entry.ipAddress}</td>
                <td className="py-3 px-4">{entry.reason}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs">
                    {entry.status}
                  </span>
                </td>
                <td className="py-3 px-4"></td>
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
            <Button variant="outline" className="h-8 w-8 dark:border-gray-700">
              2
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
    </div>
  );
}
