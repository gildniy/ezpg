"use client";
import {
  ChevronLeft,
  ChevronRight,
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
import { useEffect, useRef, useState } from "react";
import { TableContainer } from "@ezpg/ui";
import { TableStylesApplier } from "@ezpg/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { DateRangePicker } from "@ezpg/ui";

type InquiryStatus = "답변 완료" | "답변 대기";

interface Inquiry {
  id: number;
  userId: string;
  title: string;
  date: string;
  status: InquiryStatus;
}

export function InquiriesContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: 1,
      userId: "user123",
      title: "가입 문의",
      date: "2025-04-01 10:00:00",
      status: "답변 완료",
    },
    {
      id: 2,
      userId: "admin456",
      title: "출금 문의",
      date: "2025-04-01 11:00:00",
      status: "답변 대기",
    },
  ]);
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  const handleStatusChange = (id: number, newStatus: InquiryStatus) => {
    setInquiries((prevInquiries) =>
      prevInquiries.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry,
      ),
    );
  };

  const handleDetailClick = (id: number) => {
    console.log(`상세보기: ${id}번 문의`);
    // 상세보기 페이지로 이동하는 로직 추가
  };

  const handleReplyClick = (id: number) => {
    console.log(`답변하기: ${id}번 문의`);
    // 답변하기 모달 또는 페이지로 이동하는 로직 추가
  };

  const handleDetailConditionClick = () => {
    setIsDetailConditionOpen(true);
  };

  useEffect(() => {
    if (tableRef.current) {
      const thElements = tableRef.current.querySelectorAll("th");
      const tdElements = tableRef.current.querySelectorAll("td");

      thElements.forEach((th) => {
        th.style.cssText = `
          white-space: nowrap !important;
          height: 3.5rem !important;
          line-height: 3.5rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          font-weight: 600 !important;
          text-align: center !important;
        `;
      });

      tdElements.forEach((td) => {
        td.style.cssText = `
          white-space: nowrap !important;
          height: 3.5rem !important;
          line-height: 3.5rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          text-align: center !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          1:1 문의 관리
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-5 justify-end">
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
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          상세조건
        </Button>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <TableContainer>
          <table
            ref={tableRef}
            className="w-full text-sm"
            style={{ tableLayout: "auto" }}
          >
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th
                  className="py-4 px-5 text-center font-medium w-[70px] text-gray-700 dark:text-gray-200"
                  style={{ textAlign: "center" }}
                >
                  번호
                </th>
                <th
                  className="py-4 px-5 text-center font-medium w-[120px] text-gray-700 dark:text-gray-200"
                  style={{ textAlign: "center" }}
                >
                  아이디
                </th>
                <th
                  className="py-4 px-5 text-center font-medium w-[200px] text-gray-700 dark:text-gray-200"
                  style={{ textAlign: "center" }}
                >
                  제목
                </th>
                <th
                  className="py-4 px-5 text-center font-medium w-[180px] text-gray-700 dark:text-gray-200"
                  style={{ textAlign: "center" }}
                >
                  등록일시
                </th>
                <th
                  className="py-4 px-5 text-center font-medium w-[120px] text-gray-700 dark:text-gray-200"
                  style={{ textAlign: "center" }}
                >
                  상태
                </th>
                <th
                  className="py-4 px-5 text-center font-medium w-[180px] text-gray-700 dark:text-gray-200"
                  style={{ textAlign: "center" }}
                >
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td
                    className="py-4 px-5 text-center text-gray-800 dark:text-gray-300"
                    style={{ textAlign: "center" }}
                  >
                    {inquiry.id}
                  </td>
                  <td
                    className="py-4 px-5 text-center text-gray-800 dark:text-gray-300"
                    style={{ textAlign: "center" }}
                  >
                    {inquiry.userId}
                  </td>
                  <td
                    className="py-4 px-5 text-center truncate text-gray-800 dark:text-gray-300"
                    style={{ textAlign: "center" }}
                  >
                    {inquiry.title}
                  </td>
                  <td
                    className="py-4 px-5 text-center text-gray-800 dark:text-gray-300"
                    style={{ textAlign: "center" }}
                  >
                    {inquiry.date}
                  </td>
                  <td
                    className="py-4 px-5 text-center"
                    style={{ textAlign: "center" }}
                  >
                    <div className="flex justify-center">
                      <Select
                        value={inquiry.status}
                        onValueChange={(value: InquiryStatus) =>
                          handleStatusChange(inquiry.id, value)
                        }
                      >
                        <SelectTrigger
                          className={`w-28 h-8 text-xs ${
                            inquiry.status === "답변 완료"
                              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800"
                          } dark:bg-opacity-20`}
                        >
                          <SelectValue>{inquiry.status}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="답변 완료"
                            className="text-green-800"
                          >
                            답변 완료
                          </SelectItem>
                          <SelectItem
                            value="답변 대기"
                            className="text-yellow-800"
                          >
                            답변 대기
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td
                    className="py-4 px-5 text-center"
                    style={{ textAlign: "center" }}
                  ></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-center p-5">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 dark:border-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-9 w-9 bg-blue-500 border-blue-500 text-white hover:bg-blue-600"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 dark:border-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TableContainer>
      </div>
      <TableStylesApplier />

      <Dialog
        open={isDetailConditionOpen}
        onOpenChange={setIsDetailConditionOpen}
      >
        <DialogContent className="sm:max-w-[450px] w-full">
          <button
            onClick={() => setIsDetailConditionOpen(false)}
            className="absolute right-2 top-2 h-8 w-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">닫기</span>
          </button>
          <DialogHeader className="border-b pb-3">
            <DialogTitle>상세조건</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-1.5">
              <label
                htmlFor="search-basis"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                조회기준
              </label>
              <Select>
                <SelectTrigger
                  id="search-basis"
                  className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                >
                  <SelectValue placeholder="질문일자" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="question_date">질문일자</SelectItem>
                  <SelectItem value="answer_date">답변일자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="date-range"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                조회기간
              </label>
              <DateRangePicker className="w-full" />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="answer-status"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                답변여부
              </label>
              <Select>
                <SelectTrigger
                  id="answer-status"
                  className="w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                >
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="answered">답변완료</SelectItem>
                  <SelectItem value="unanswered">답변대기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="user-id"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                질문자 아이디
              </label>
              <Input
                id="user-id"
                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                placeholder="질문자 아이디를 입력하세요"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                제목
              </label>
              <Input
                id="title"
                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                placeholder="제목을 입력하세요"
              />
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDetailConditionOpen(false)}
                className="flex-1 border-gray-200 dark:border-gray-700 dark:text-gray-300"
              >
                초기화
              </Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                조회
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
