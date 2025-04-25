"use client";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  Eye,
  Edit,
  Save,
} from "lucide-react";
import type React from "react";

import { Button } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { useState, useRef, useEffect } from "react";
import { Input } from "@ezpg/ui";
import { Textarea } from "@ezpg/ui";
import { Badge } from "@ezpg/ui";

// 공지사항 타입 정의
interface Notice {
  id: number;
  category: string;
  title: string;
  content: string;
  noticeDate: string;
  status: "active" | "inactive";
  registrationDate: string;
  author: string;
}

export function NoticesContent() {
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [editedNotice, setEditedNotice] = useState<Notice | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // 샘플 공지사항 데이터
  const notices: Notice[] = [
    {
      id: 1,
      category: "시스템",
      title: "시스템 점검 안내 (2024-04-15)",
      content:
        "안녕하세요. 시스템 점검 안내드립니다.\n\n일시: 2024년 4월 15일 02:00 ~ 06:00\n점검 내용: 서버 안정화 및 보안 업데이트\n\n점검 시간 동안에는 서비스 이용이 제한될 수 있습니다.\n이용에 불편을 드려 죄송합니다.\n\n감사합니다.",
      noticeDate: "2024-04-10 09:30:00",
      status: "active",
      registrationDate: "2024-04-10 09:30:00",
      author: "admin",
    },
    {
      id: 2,
      category: "공지",
      title: "신규 가맹점 추가 안내",
      content:
        "안녕하세요. 신규 가맹점 추가 안내드립니다.\n\n4월부터 다음 가맹점들이 추가되었습니다:\n- 가맹점A\n- 가맹점B\n- 가맹점C\n\n많은 이용 부탁드립니다.\n\n감사합니다.",
      noticeDate: "2024-04-05 14:20:00",
      status: "active",
      registrationDate: "2024-04-05 14:20:00",
      author: "admin",
    },
    {
      id: 3,
      category: "업데이트",
      title: "시스템 업데이트 완료 안내",
      content:
        "안녕하세요. 시스템 업데이트 완료 안내드립니다.\n\n업데이트 내용:\n1. 사용자 인터페이스 개선\n2. 결제 시스템 안정화\n3. 보안 취약점 패치\n\n업데이트와 관련하여 문의사항이 있으시면 고객센터로 연락 부탁드립니다.\n\n감사합니다.",
      noticeDate: "2024-03-28 10:15:00",
      status: "active",
      registrationDate: "2024-03-28 10:15:00",
      author: "admin",
    },
  ];

  useEffect(() => {
    if (tableRef.current) {
      const thElements = tableRef.current.querySelectorAll("th");
      const tdElements = tableRef.current.querySelectorAll("td");

      thElements.forEach((th) => {
        th.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          text-align: center !important;
        `;
      });

      tdElements.forEach((td) => {
        td.style.cssText = `
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

  const handleDetailClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setEditedNotice(notice);
    setIsEditMode(false);
    setShowDetailPopup(true);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = () => {
    if (editedNotice) {
      // 실제 구현에서는 API 호출로 데이터를 저장
      setSelectedNotice(editedNotice);
      setIsEditMode(false);

      // 성공 메시지 표시 등의 로직 추가 가능
      alert("공지사항이 수정되었습니다.");
    }
  };

  const handleCancelEdit = () => {
    // 수정 취소 시 원래 데이터로 복원
    setEditedNotice(selectedNotice);
    setIsEditMode(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (editedNotice) {
      setEditedNotice({
        ...editedNotice,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (editedNotice) {
      setEditedNotice({
        ...editedNotice,
        [name]: value,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium dark:text-white">공지사항 관리</h2>
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
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
          onClick={() => setShowRegisterPopup(true)}
        >
          <span className="mr-1">등록</span>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <table
          ref={tableRef}
          className="w-full text-sm"
          style={{ minWidth: "1200px", tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "300px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "100px" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                번호
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                분류
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                제목
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                공지일시
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                상태
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                등록일시
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                작성자
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                상세보기
              </th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <tr
                key={notice.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td
                  className="py-3 px-4 text-center dark:text-gray-300"
                  style={{ textAlign: "center" }}
                >
                  {notice.id}
                </td>
                <td
                  className="py-3 px-4 text-center dark:text-gray-300"
                  style={{ textAlign: "center" }}
                >
                  {notice.category}
                </td>
                <td
                  className="py-3 px-4 text-center dark:text-gray-300"
                  style={{ textAlign: "center" }}
                >
                  {notice.title}
                </td>
                <td
                  className="py-3 px-4 text-center dark:text-gray-300"
                  style={{ textAlign: "center" }}
                >
                  {notice.noticeDate}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <Badge
                      className={
                        notice.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }
                    >
                      {notice.status === "active" ? "게시중" : "미게시"}
                    </Badge>
                  </div>
                </td>
                <td
                  className="py-3 px-4 text-center dark:text-gray-300"
                  style={{ textAlign: "center" }}
                >
                  {notice.registrationDate}
                </td>
                <td
                  className="py-3 px-4 text-center dark:text-gray-300"
                  style={{ textAlign: "center" }}
                >
                  {notice.author}
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
                      onClick={() => handleDetailClick(notice)}
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
      </div>

      {/* 공지사항 등록 팝업 */}
      {showRegisterPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">
                공지사항 등록
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRegisterPopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  분류
                </label>
                <Select>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="분류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">시스템</SelectItem>
                    <SelectItem value="notice">공지</SelectItem>
                    <SelectItem value="update">업데이트</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  제목
                </label>
                <Input
                  placeholder="공지사항 제목을 입력하세요"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                <label className="text-sm font-medium pt-2 dark:text-gray-300">
                  내용
                </label>
                <Textarea
                  placeholder="공지사항 내용을 입력하세요"
                  rows={8}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  상태
                </label>
                <Select>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">게시중</SelectItem>
                    <SelectItem value="inactive">미게시</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowRegisterPopup(false)}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                취소
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setShowRegisterPopup(false)}
              >
                등록
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 공지사항 상세보기/수정 팝업 */}
      {showDetailPopup && selectedNotice && editedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">
                {isEditMode ? "공지사항 수정" : "공지사항 상세"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetailPopup(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  분류
                </label>
                {isEditMode ? (
                  <Select
                    value={editedNotice.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
                    <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="분류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="시스템">시스템</SelectItem>
                      <SelectItem value="공지">공지</SelectItem>
                      <SelectItem value="업데이트">업데이트</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm dark:text-gray-300">
                    {selectedNotice.category}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  제목
                </label>
                {isEditMode ? (
                  <Input
                    name="title"
                    value={editedNotice.title}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="text-sm dark:text-gray-300">
                    {selectedNotice.title}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                <label className="text-sm font-medium pt-2 dark:text-gray-300">
                  내용
                </label>
                {isEditMode ? (
                  <Textarea
                    name="content"
                    value={editedNotice.content}
                    onChange={handleInputChange}
                    rows={8}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="text-sm p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md h-48 overflow-y-auto whitespace-pre-wrap dark:text-gray-300">
                    {selectedNotice.content}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  공지일시
                </label>
                {isEditMode ? (
                  <Input
                    name="noticeDate"
                    type="datetime-local"
                    value={editedNotice.noticeDate.replace(" ", "T")}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                ) : (
                  <div className="text-sm dark:text-gray-300">
                    {selectedNotice.noticeDate}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  상태
                </label>
                {isEditMode ? (
                  <Select
                    value={editedNotice.status}
                    onValueChange={(value) =>
                      handleSelectChange(
                        "status",
                        value as "active" | "inactive",
                      )
                    }
                  >
                    <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">게시중</SelectItem>
                      <SelectItem value="inactive">미게시</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    <Badge
                      className={
                        selectedNotice.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }
                    >
                      {selectedNotice.status === "active" ? "게시중" : "미게시"}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  등록일시
                </label>
                <div className="text-sm dark:text-gray-300">
                  {selectedNotice.registrationDate}
                </div>
              </div>

              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="text-sm font-medium dark:text-gray-300">
                  작성자
                </label>
                <div className="text-sm dark:text-gray-300">
                  {selectedNotice.author}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    취소
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleSaveClick}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    저장
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailPopup(false)}
                    className="dark:border-gray-600 dark:text-gray-300"
                  >
                    닫기
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleEditClick}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
