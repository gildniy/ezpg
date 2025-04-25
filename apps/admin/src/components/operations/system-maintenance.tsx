"use client";
import { ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
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
import { Switch } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { Textarea } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { DatePicker } from "@ezpg/ui";

interface MaintenanceItem {
  id: number;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  registeredDate: string;
  editor: string;
}

export function SystemMaintenanceContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([
    {
      id: 1,
      type: "시스템",
      title: "시스템 점검 안내 (2024-04-15)",
      content: "시스템 안정화를 위한 정기 점검이 진행됩니다.",
      isActive: true,
      startDate: "2024-04-15 00:00:00",
      endDate: "2024-04-15 06:00:00",
      registeredDate: "2024-04-10 09:30:00",
      editor: "admin",
    },
  ]);

  // 새 시스템 점검 등록을 위한 상태
  const [newMaintenance, setNewMaintenance] = useState<
    Omit<MaintenanceItem, "id" | "registeredDate" | "editor">
  >({
    type: "시스템",
    title: "",
    content: "",
    isActive: true,
    startDate: new Date().toISOString().slice(0, 16).replace("T", " "),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16)
      .replace("T", " "),
  });

  // 상세 내용 모달을 위한 상태
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 시작일시와 종료일시를 위한 상태
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [endTime, setEndTime] = useState("02:00");

  // 제목 클릭 시 상세 내용 모달을 여는 함수
  const handleTitleClick = (item: MaintenanceItem) => {
    setSelectedMaintenance(item);
    setIsDetailOpen(true);
  };

  // 상세 내용 모달을 닫는 함수
  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedMaintenance(null);
  };

  // 시작일시와 종료일시 업데이트 함수
  useEffect(() => {
    if (startDate) {
      const formattedDate = startDate.toISOString().slice(0, 10);
      setNewMaintenance((prev) => ({
        ...prev,
        startDate: `${formattedDate} ${startTime}:00`,
      }));
    }
  }, [startDate, startTime]);

  useEffect(() => {
    if (endDate) {
      const formattedDate = endDate.toISOString().slice(0, 10);
      setNewMaintenance((prev) => ({
        ...prev,
        endDate: `${formattedDate} ${endTime}:00`,
      }));
    }
  }, [endDate, endTime]);

  const toggleStatus = (id: number) => {
    setMaintenanceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item,
      ),
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setNewMaintenance((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setNewMaintenance((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleStatusChange = (checked: boolean) => {
    setNewMaintenance((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSubmit = () => {
    // 유효성 검사
    if (!newMaintenance.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    // 새 시스템 점검 항목 추가
    const newItem: MaintenanceItem = {
      ...newMaintenance,
      id:
        maintenanceItems.length > 0
          ? Math.max(...maintenanceItems.map((item) => item.id)) + 1
          : 1,
      registeredDate: new Date().toISOString().slice(0, 19).replace("T", " "),
      editor: "admin", // 현재 로그인한 사용자 정보로 대체 가능
    };

    setMaintenanceItems((prev) => [...prev, newItem]);
    resetForm();
    setShowRegisterPopup(false);
  };

  const resetForm = () => {
    setNewMaintenance({
      type: "시스템",
      title: "",
      content: "",
      isActive: true,
      startDate: new Date().toISOString().slice(0, 16).replace("T", " "),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
        .replace("T", " "),
    });
    setStartDate(new Date());
    setStartTime("00:00");
    setEndDate(new Date());
    setEndTime("02:00");
  };

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

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">시스템 점검 관리</h2>
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
            className="ml-2 dark:border-gray-700 dark:text-gray-200"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="ml-2 dark:border-gray-700 dark:text-gray-200"
            onClick={() => setShowRegisterPopup(true)}
          >
            <span className="mr-1">등록</span>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <table ref={tableRef} className="w-full text-sm">
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
                구분
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                제목
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                노출상태
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                시작일시
              </th>
              <th
                className="py-3 px-4 text-center font-medium"
                style={{ textAlign: "center" }}
              >
                종료일시
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
                수정자
              </th>
            </tr>
          </thead>
          <tbody>
            {maintenanceItems.map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {item.id}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {item.type}
                </td>
                <td
                  className="py-3 px-4 text-center cursor-pointer hover:text-blue-500 hover:underline"
                  style={{ textAlign: "center" }}
                  onClick={() => handleTitleClick(item)}
                >
                  {item.title}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => toggleStatus(item.id)}
                    />
                    <span
                      className={
                        item.isActive ? "text-green-500" : "text-gray-500"
                      }
                    >
                      {item.isActive ? "활성" : "비활성"}
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {item.startDate}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {item.endDate}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {item.registeredDate}
                </td>
                <td
                  className="py-3 px-4 text-center"
                  style={{ textAlign: "center" }}
                >
                  {item.editor}
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

      {/* 시스템 점검 등록 팝업 */}
      {showRegisterPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">시스템 점검 등록</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRegisterPopup(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* 구분 */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label htmlFor="type">구분</Label>
                <Select
                  value={newMaintenance.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="구분 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="시스템">시스템</SelectItem>
                    <SelectItem value="서비스">서비스</SelectItem>
                    <SelectItem value="결제">결제</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 제목 */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  value={newMaintenance.title}
                  onChange={handleInputChange}
                  placeholder="제목을 입력하세요"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* 내용 */}
              <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                <Label htmlFor="content" className="mt-2">
                  내용
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={newMaintenance.content}
                  onChange={handleInputChange}
                  placeholder="내용을 입력하세요"
                  rows={5}
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* 시작일시 */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label>시작일시</Label>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <DatePicker value={startDate} onChange={setStartDate} />
                  </div>
                  <div className="w-1/2">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* 종료일시 */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label>종료일시</Label>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <DatePicker value={endDate} onChange={setEndDate} />
                  </div>
                  <div className="w-1/2">
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* 노출상태 */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label>노출상태</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newMaintenance.isActive}
                    onCheckedChange={handleStatusChange}
                  />
                  <span
                    className={
                      newMaintenance.isActive
                        ? "text-green-500"
                        : "text-gray-500"
                    }
                  >
                    {newMaintenance.isActive ? "활성" : "비활성"}
                  </span>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="px-6 py-2 border-gray-300 dark:border-gray-600"
                >
                  초기화
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600"
                >
                  등록
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 상세 내용 모달 */}
      {isDetailOpen && selectedMaintenance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {selectedMaintenance.title}
              </h3>
              <Button variant="ghost" size="icon" onClick={handleDetailClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <div className="max-h-[60vh] overflow-y-auto p-2">
                <p className="whitespace-pre-wrap">
                  {selectedMaintenance.content}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleDetailClose} className="px-6 py-2">
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
