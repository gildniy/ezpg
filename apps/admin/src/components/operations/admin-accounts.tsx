"use client";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";

export function AdminAccountsContent() {
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  const handleDetailConditionClick = () => {
    setIsDetailConditionOpen(true);
  };

  const handleDetailConditionClose = () => {
    setIsDetailConditionOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {"관리자 계정"}
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
          onClick={handleDetailConditionClick}
        >
          <span className="mr-1">상세조건</span>
          <SlidersHorizontal className="h-4 w-4" />
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
          <span className="mr-1">{"추가"}</span>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <table className="w-full text-sm single-line-table">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium">{"번호"}</th>
              <th className="py-3 px-4 text-center font-medium">{"아이디"}</th>
              <th className="py-3 px-4 text-center font-medium">{"등록일"}</th>
              <th className="py-3 px-4 text-center font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700 text-center">
              <td className="py-3 px-4">1</td>
              <td className="py-3 px-4">
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs">
                  ezpgadmin
                </span>
              </td>
              <td className="py-3 px-4">2025-02-17 00:23:07</td>
              <td className="py-3 px-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                >
                  {"권한관리"}
                </Button>
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
      </div>

      <Dialog
        open={isDetailConditionOpen}
        onOpenChange={setIsDetailConditionOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>상세조건</DialogTitle>
            <Button
              variant="ghost"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              onClick={handleDetailConditionClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="group" className="text-sm font-medium">
                그룹명
              </label>
              <Select>
                <SelectTrigger id="group" className="w-full">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="operator">운영자</SelectItem>
                  <SelectItem value="normal">일반</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={handleDetailConditionClose}>
              초기화
            </Button>
            <Button onClick={handleDetailConditionClose}>조회</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
