"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Eye,
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
import { DatePicker } from "@ezpg/ui";
import { useEffect, useRef, useState } from "react";
import { TableStylesApplier } from "@ezpg/ui";
import { useNavigation } from "@/contexts/navigation-context";
import { Dialog, DialogContent } from "@ezpg/ui";
import { Input } from "@ezpg/ui";

// 등록된 가맹점 목록 (더미 데이터)
const merchantsList = [
  { id: "merchant1", name: "Siliconsilk" },
  { id: "merchant2", name: "atglobal" },
  { id: "merchant3", name: "sticpay" },
  { id: "merchant4", name: "Payoneer" },
  { id: "merchant5", name: "Skrill" },
  { id: "merchant6", name: "Neteller" },
  { id: "merchant7", name: "PayPal" },
  { id: "merchant8", name: "Alipay" },
  { id: "merchant9", name: "WeChat Pay" },
  { id: "merchant10", name: "UnionPay" },
];

export function MerchantBalanceLogContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const { navigateTo } = useNavigation();
  const [selectedMerchant, setSelectedMerchant] = useState<string>("all");
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  // 상세보기 버튼 클릭 핸들러
  const handleDetailClick = (id: number) => {
    console.log(`상세보기 클릭: ${id}`);
    // 나중에 상세 페이지로 이동하는 코드 추가
    // navigateTo(`merchant-balance-log-detail-${id}`)
  };

  // 가맹점 선택 핸들러
  const handleMerchantChange = (value: string) => {
    setSelectedMerchant(value);
    console.log(`선택된 가맹점: ${value}`);
    // 여기에 선택된 가맹점에 따라 데이터를 필터링하는 로직 추가
  };

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    if (tableRef.current) {
      // 테이블 헤더에 스타일 적용
      const headers = tableRef.current.querySelectorAll("th");
      headers.forEach((header, index) => {
        const element = header as HTMLElement;

        // 각 열의 너비를 내용에 맞게 설정
        let width = "100px";
        if (index === 0) width = "80px"; // 번호
        if (index === 1) width = "180px"; // 날짜
        if (index === 2) width = "150px"; // 가맹점
        if (index === 3) width = "150px"; // 내용
        if (index === 4) width = "200px"; // 변경금액
        if (index === 5) width = "200px"; // 변경후금액
        if (index === 6) width = "100px"; // 상세보기

        element.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
          width: ${width} !important;
          min-width: ${width} !important;
        `;
      });

      // 테이블 셀에 스타일 적용
      const cells = tableRef.current.querySelectorAll("td");
      cells.forEach((cell, index) => {
        const element = cell as HTMLElement;
        const columnIndex = index % 7; // 7개 열이 있으므로 모듈로 연산으로 열 인덱스 계산

        // 각 열의 너비를 헤더와 동일하게 설정
        let width = "100px";
        if (columnIndex === 0) width = "80px"; // 번호
        if (columnIndex === 1) width = "180px"; // 날짜
        if (columnIndex === 2) width = "150px"; // 가맹점
        if (columnIndex === 3) width = "150px"; // 내용
        if (columnIndex === 4) width = "200px"; // 변경금액
        if (columnIndex === 5) width = "200px"; // 변경후금액
        if (columnIndex === 6) width = "100px"; // 상세보기

        element.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
          width: ${width} !important;
          min-width: ${width} !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">가맹점 잔액 로그</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center">
          <Select>
            <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <SelectValue placeholder="등록 일자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_value">등록 일자</SelectItem>
              <SelectItem value="merchant_name">가맹점명</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>

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

          {/* 상세조건 버튼 */}
          <Button
            variant="outline"
            className="mx-2 dark:border-gray-700 dark:text-gray-200"
            onClick={() => setIsDetailConditionOpen(true)}
          >
            상세조건
          </Button>

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
        </div>
      </div>

      <div
        className="overflow-x-auto"
        style={{ minWidth: "100%", width: "100%" }}
      >
        <table
          ref={tableRef}
          className="w-full text-sm merchant-balance-log-table"
          style={{ tableLayout: "fixed", minWidth: "1060px" }}
        >
          <colgroup>
            <col style={{ width: "80px" }} /> {/* 번호 */}
            <col style={{ width: "180px" }} /> {/* 날짜 */}
            <col style={{ width: "150px" }} /> {/* 가맹점 */}
            <col style={{ width: "150px" }} /> {/* 내용 */}
            <col style={{ width: "200px" }} /> {/* 변경금액 */}
            <col style={{ width: "200px" }} /> {/* 변경후금액 */}
            <col style={{ width: "100px" }} /> {/* 상세보기 */}
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                번호
              </th>
              <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                날짜
              </th>
              <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                가맹점
              </th>
              <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                내용
              </th>
              <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                변경금액(수수료포함금액)
              </th>
              <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                변경후금액
              </th>
              <th className="py-3 px-4 text-center font-medium dark:text-gray-200">
                상세보기
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4 text-center">1</td>
              <td className="py-3 px-4 text-center">2025-04-01 13:27:44</td>
              <td className="py-3 px-4 text-center">Siliconsilk</td>
              <td className="py-3 px-4 text-center">입금</td>
              <td className="py-3 px-4 text-center">199,230</td>
              <td className="py-3 px-4 text-center">237,581</td>
              <td className="py-3 px-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  상세보기
                </Button>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4 text-center">2</td>
              <td className="py-3 px-4 text-center">2025-04-01 12:10:56</td>
              <td className="py-3 px-4 text-center">atglobal</td>
              <td className="py-3 px-4 text-center">입금</td>
              <td className="py-3 px-4 text-center">85,545</td>
              <td className="py-3 px-4 text-center">3,705,932</td>
              <td className="py-3 px-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  상세보기
                </Button>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4 text-center">3</td>
              <td className="py-3 px-4 text-center">2025-04-01 12:01:39</td>
              <td className="py-3 px-4 text-center">sticpay</td>
              <td className="py-3 px-4 text-center">출금</td>
              <td className="py-3 px-4 text-center">470,958</td>
              <td className="py-3 px-4 text-center">25,642,761</td>
              <td className="py-3 px-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  상세보기
                </Button>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4 text-center">4</td>
              <td className="py-3 px-4 text-center">2025-04-01 11:51:52</td>
              <td className="py-3 px-4 text-center">sticpay</td>
              <td className="py-3 px-4 text-center">입금</td>
              <td className="py-3 px-4 text-center">78,453</td>
              <td className="py-3 px-4 text-center">26,113,709</td>
              <td className="py-3 px-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  상세보기
                </Button>
              </td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-3 px-4 text-center">5</td>
              <td className="py-3 px-4 text-center">2025-04-01 09:30:43</td>
              <td className="py-3 px-4 text-center">sticpay</td>
              <td className="py-3 px-4 text-center">입금</td>
              <td className="py-3 px-4 text-center">79,448</td>
              <td className="py-3 px-4 text-center">26,035,256</td>
              <td className="py-3 px-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 text-xs rounded-full px-3 dark:border-blue-800 dark:hover:bg-blue-900/30"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  상세보기
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
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
      {/* 상세조건 팝업창 */}
      <Dialog
        open={isDetailConditionOpen}
        onOpenChange={setIsDetailConditionOpen}
      >
        <DialogContent className="p-0 w-full max-w-[450px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="text-lg font-medium">검색조건 설정</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailConditionOpen(false)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* 조회기준 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">조회기준</label>
              <Select defaultValue="date">
                <SelectTrigger className="w-full border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="거래일자" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">거래일자</SelectItem>
                  <SelectItem value="merchant">가맹점명</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 조회기간 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">조회기간</label>
              <div className="flex items-center gap-2">
                <div className="w-[calc(50%-8px)]">
                  <DatePicker defaultValue={new Date("2025-05-07")} />
                </div>
                <span>~</span>
                <div className="w-[calc(50%-8px)]">
                  <DatePicker defaultValue={new Date("2025-05-07")} />
                </div>
              </div>
            </div>

            {/* 가맹점 선택 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">가맹점 선택</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {merchantsList.map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 구분 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">구분</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="deposit">입금</SelectItem>
                  <SelectItem value="member_withdraw">출금</SelectItem>
                  <SelectItem value="complaint">민원</SelectItem>
                  <SelectItem value="reserve">유보금</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 차감/추가 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">차감/추가</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-full border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="subtract">차감</SelectItem>
                  <SelectItem value="add">추가</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 키워드 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">키워드</label>
              <Input
                placeholder="키워드를 입력하세요"
                className="w-full border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className="w-[calc(50%-4px)] border-gray-200 dark:border-gray-700"
              onClick={() => console.log("초기화")}
            >
              초기화
            </Button>
            <Button
              className="w-[calc(50%-4px)] bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                console.log("조회");
                setIsDetailConditionOpen(false);
              }}
            >
              조회
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <TableStylesApplier />
    </div>
  );
}
