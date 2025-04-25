"use client";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
  Calendar,
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
import { DatePicker } from "@ezpg/ui";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@ezpg/ui";
import { Input } from "@ezpg/ui";

export function MerchantWithdrawalContent() {
  const router = useRouter();
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  useEffect(() => {
    if (tableRef.current) {
      const headers = tableRef.current.querySelectorAll("th");
      const cells = tableRef.current.querySelectorAll("td");

      headers.forEach((header) => {
        header.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          text-align: center !important;
        `;
      });

      cells.forEach((cell) => {
        cell.style.cssText = `
          white-space: nowrap !important;
          text-align: center !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium dark:text-white">
          가맹점 출금 관리
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <SelectValue placeholder="신청일시" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="date" className="dark:text-white">
                신청일시
              </SelectItem>
              <SelectItem value="name" className="dark:text-white">
                가맹점
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md mr-2 dark:text-gray-300">
            총: <span className="font-medium">3건</span>, 회원 출금액:{" "}
            <span className="font-medium">1,402,630원</span>
          </div>

          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <SelectValue placeholder="보기" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="10" className="dark:text-white">
                10
              </SelectItem>
              <SelectItem value="25" className="dark:text-white">
                25
              </SelectItem>
              <SelectItem value="50" className="dark:text-white">
                50
              </SelectItem>
              <SelectItem value="100" className="dark:text-white">
                100
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="mx-2 dark:border-gray-700 dark:text-gray-200"
            onClick={() => setIsDetailConditionOpen(true)}
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
            <span className="mr-1">엑셀</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TableContainer minWidth="1200px">
        <table
          ref={tableRef}
          className="w-full text-sm merchant-withdrawal-table"
        >
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
                신청일시
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                가맹점
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                업체명
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                예금주
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                은행
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                계좌번호
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                금액
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
                출금일시
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                출금방식
              </th>
              <th
                className="py-3 px-4 text-center font-medium dark:text-gray-200"
                style={{ textAlign: "center" }}
              >
                비고
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                1
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                2025/04/01 12:01:38
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                sticpay
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                sticpay
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                함동오
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                KAKAO BANK
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                3333022954291
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                470,958
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                완료
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                2025/04/01 12:01:39
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                원화출금
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                처리완료
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                2
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                2025/04/01 02:19:50
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                sticpay
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                sticpay
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                HOWON CHOI
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                NATIONAL AGRICULTURAL
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                3511063044233
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                832,626
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                완료
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                2025/04/01 02:19:52
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                정산
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                처리완료
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                3
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                2025/04/01 02:18:35
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                sticpay
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                sticpay
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                이승은
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                KOOKMIN BANK
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                01250204238622
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                99,046
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                완료
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                2025/04/01 02:18:36
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                외화출금
              </td>
              <td
                className="py-3 px-4 text-center dark:text-gray-300"
                style={{ textAlign: "center" }}
              >
                처리완료
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-center p-4">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 dark:border-gray-700 dark:text-gray-300"
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
              className="h-8 w-8 dark:border-gray-700 dark:text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TableContainer>

      <Dialog
        open={isDetailConditionOpen}
        onOpenChange={setIsDetailConditionOpen}
      >
        <DialogContent className="p-0 max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-lg font-medium dark:text-white">
                검색조건 설정
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailConditionOpen(false)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 dark:text-white" />
            </Button>
          </div>

          <div className="p-4 space-y-6">
            {/* 조회기준 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm dark:text-gray-300">조회기준</label>
              <div className="col-span-3">
                <Select defaultValue="date">
                  <SelectTrigger className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="신청일자" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="date" className="dark:text-white">
                      신청일자
                    </SelectItem>
                    <SelectItem value="apply" className="dark:text-white">
                      완료일자
                    </SelectItem>
                    <SelectItem value="complete" className="dark:text-white">
                      거래일자
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 조회기간 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm dark:text-gray-300">조회기간</label>
              <div className="col-span-3 flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="text"
                    value="2025-05-07"
                    className="border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white pr-10"
                    readOnly
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
                </div>
                <span className="dark:text-white">~</span>
                <div className="relative">
                  <Input
                    type="text"
                    value="2025-05-07"
                    className="border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white pr-10"
                    readOnly
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
                </div>
              </div>
            </div>

            {/* 가맹점 선택 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm dark:text-gray-300">가맹점 선택</label>
              <div className="col-span-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white">
                      전체
                    </SelectItem>
                    <SelectItem value="merchant1" className="dark:text-white">
                      가맹점1
                    </SelectItem>
                    <SelectItem value="merchant2" className="dark:text-white">
                      가맹점2
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 분류 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-sm pt-2 dark:text-gray-300">분류</label>
              <div className="col-span-3 space-y-2">
                <Select defaultValue="id">
                  <SelectTrigger className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="아이디" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="id" className="dark:text-white">
                      아이디
                    </SelectItem>
                    <SelectItem value="name" className="dark:text-white">
                      이름
                    </SelectItem>
                    <SelectItem value="account" className="dark:text-white">
                      계좌번호
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="키워드를 입력하세요"
                  className="border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* 상태 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm dark:text-gray-300">상태</label>
              <div className="col-span-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white">
                      모든 상태
                    </SelectItem>
                    <SelectItem value="complete" className="dark:text-white">
                      완료
                    </SelectItem>
                    <SelectItem value="pending" className="dark:text-white">
                      대기
                    </SelectItem>
                    <SelectItem value="failed" className="dark:text-white">
                      실패
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="grid grid-cols-2 gap-2 p-2">
            <Button
              variant="outline"
              className="border-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              초기화
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              조회
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
