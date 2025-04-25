"use client";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Filter,
  PlusCircle,
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
import { useLanguage } from "@ezpg/hooks";
import { TableStylesApplier } from "@ezpg/ui";
import { useRef, useEffect, useState } from "react";
import { Input } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@ezpg/ui";
import { Badge } from "@ezpg/ui";

export function VirtualAccountInfoContent() {
  const { t, language } = useLanguage();
  const tableRef = useRef<HTMLTableElement>(null);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({
    merchant: "",
    accountStatus: t("selectAll"),
    accountNumber: "",
    accountHolder: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleMerchantChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, merchant: value }));
  };

  const handleAccountStatusChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, accountStatus: value }));
  };

  const handleSearch = () => {
    // 검색 로직 구현
    console.log("검색 파라미터:", searchParams);
    setIsAdvancedSearchOpen(false);
  };

  const handleReset = () => {
    setSearchParams({
      merchant: "",
      accountStatus: t("selectAll"),
      accountNumber: "",
      accountHolder: "",
    });
  };

  // Translations for the component
  const translations = {
    en: {
      virtualAccountInfo: "Virtual Account Information",
      views: " views",
      advancedSearch: "Advanced Search",
      excel: "Excel",
      close: "Close",
      merchant: "Merchant",
      selectMerchant: "Select Merchant",
      selectAll: "Select All",
      accountStatus: "Account Status",
      selectStatus: "Select issuance method",
      active: "Active",
      inactive: "Inactive",
      virtualAccount: "Deposit amount",
      enterVirtualAccount: "Enter Deposit amount",
      accountHolder: "Account Holder",
      enterAccountHolder: "Enter Account Holder",
      reset: "Reset",
      search: "Search",
      number: "No.",
      bank: "Bank",
      accountType: "Account Type",
      date: "Date",
      fixedType: "Fixed Type",
      rotatingType: "Rotating Type",
      register: "Account application",
      processingMethod: "Processing Method",
    },
    ko: {
      virtualAccountInfo: "가상계좌 정보",
      views: "개 보기",
      advancedSearch: "상세 검색",
      excel: "엑셀",
      close: "닫기",
      merchant: "가맹점",
      selectMerchant: "가맹점 선택",
      selectAll: "전체 선택",
      processingMethod: "발급 방식",
      accountStatus: "계좌 상태",
      selectStatus: "발급 방식 선택",
      active: "활성",
      inactive: "비활성",
      virtualAccount: "입금 금액",
      enterVirtualAccount: "입금 금액 입력",
      accountHolder: "예금주",
      enterAccountHolder: "예금주 입력",
      reset: "초기화",
      search: "검색",
      number: "번호",
      bank: "은행",
      accountType: "계좌 유형",
      date: "날짜",
      fixedType: "고정식",
      rotatingType: "회전식",
      register: "계좌신청",
    },
  } as const;

  type TranslationKey = keyof typeof translations.en;

  // Get the appropriate translation based on language
  const getText = (key: TranslationKey) => {
    const currentLang = language === "ko" ? "ko" : "en";
    return translations[currentLang][key] || key;
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
        `;
      });

      tdElements.forEach((td) => {
        td.style.cssText = `
          white-space: nowrap !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        `;
      });
    }
  }, []);

  return (
    <div className="p-6">
      <TableStylesApplier />
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          {getText("virtualAccountInfo")}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 justify-end">
        <Select>
          <SelectTrigger className="w-32 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
            <SelectValue placeholder={language === "ko" ? `보기` : `View`} />
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
          onClick={() => setIsAdvancedSearchOpen(true)}
        >
          <Filter className="h-4 w-4 mr-1.5" />
          {getText("advancedSearch")}
        </Button>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
        >
          <span className="mr-1">{getText("excel")}</span>
          <Download className="h-4 w-4" />
        </Button>
        {/* Add new account button */}
        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
          onClick={() => setIsCreateAccountOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-1.5" />
          계좌발급
        </Button>
      </div>

      {/* 상세조건 모달 - 다국어 지원 */}
      <Dialog
        open={isAdvancedSearchOpen}
        onOpenChange={setIsAdvancedSearchOpen}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-left">
              {getText("advancedSearch")}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">{getText("close")}</span>
            </DialogClose>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="merchant">{getText("merchant")}</Label>
              <Select
                value={searchParams.merchant}
                onValueChange={handleMerchantChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getText("selectMerchant")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{getText("selectAll")}</SelectItem>
                  <SelectItem value="Siliconsilk">Siliconsilk</SelectItem>
                  <SelectItem value="atglobal">atglobal</SelectItem>
                  <SelectItem value="sticpay">sticpay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountStatus">{getText("accountStatus")}</Label>
              <Select
                value={searchParams.accountStatus}
                onValueChange={handleAccountStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getText("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={getText("selectAll")}>
                    {getText("selectAll")}
                  </SelectItem>
                  <SelectItem value={getText("active")}>
                    {getText("active")}
                  </SelectItem>
                  <SelectItem value={getText("inactive")}>
                    {getText("inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountNumber">{getText("virtualAccount")}</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={searchParams.accountNumber}
                onChange={handleInputChange}
                placeholder={getText("enterVirtualAccount")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accountHolder">{getText("accountHolder")}</Label>
              <Input
                id="accountHolder"
                name="accountHolder"
                value={searchParams.accountHolder}
                onChange={handleInputChange}
                placeholder={getText("enterAccountHolder")}
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              {getText("reset")}
            </Button>
            <Button
              onClick={handleSearch}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {getText("search")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 계좌 등록 팝업 */}
      <Dialog open={isCreateAccountOpen} onOpenChange={setIsCreateAccountOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-left">
              {getText("register")}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">{getText("close")}</span>
            </DialogClose>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newAccountHolder">
                {getText("accountHolder")}
              </Label>
              <Input
                id="newAccountHolder"
                placeholder={getText("enterAccountHolder")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newProcessingMethod">
                {getText("processingMethod")}
              </Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getText("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={getText("fixedType")}>
                    {getText("fixedType")}
                  </SelectItem>
                  <SelectItem value={getText("rotatingType")}>
                    {getText("rotatingType")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="newAccountNumber">
                {getText("virtualAccount")}
              </Label>
              <Input
                id="newAccountNumber"
                placeholder={getText("enterVirtualAccount")}
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateAccountOpen(false)}
              className="flex-1"
            >
              {getText("close")}
            </Button>
            <Button
              onClick={() => console.log("계좌 생성")}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              계좌신청
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 테이블 컨테이너 - 다크모드에서 배경색 제거 */}
      <div className="overflow-x-auto w-full rounded-lg shadow-sm dark:bg-transparent">
        <table
          ref={tableRef}
          className="w-full text-sm dark:bg-transparent"
          style={{ minWidth: "1100px", tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "180px" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 dark:bg-transparent">
              <th className="py-3 px-4 text-center font-medium dark:bg-transparent">
                {getText("number")}
              </th>
              <th className="py-3 px-4 text-center font-medium dark:bg-transparent">
                {getText("merchant")}
              </th>
              <th className="py-3 px-4 text-center font-medium dark:bg-transparent">
                {getText("bank")}
              </th>
              <th className="py-3 px-4 text-center font-medium dark:bg-transparent">
                {getText("virtualAccount")}
              </th>
              <th className="py-3 px-4 text-center font-medium dark:bg-transparent">
                {getText("accountHolder")}
              </th>
              <th className="py-3 px-4 text-center font-medium dark:bg-transparent">
                {getText("accountType")}
              </th>
              <th className="py-3 px-4 text-center font-medium dark:bg-transparent">
                {getText("date")}
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300 dark:bg-transparent">
            <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-transparent dark:bg-transparent cursor-pointer">
              <td className="py-3 px-4 text-center">1</td>
              <td className="py-3 px-4 text-center">Siliconsilk</td>
              <td className="py-3 px-4 text-center">K-BANK</td>
              <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400 text-center">
                7016800761033
              </td>
              <td className="py-3 px-4 text-center">LISHUANGXI</td>
              <td className="py-3 px-4 text-center">{getText("fixedType")}</td>
              <td className="py-3 px-4 text-center">2025-04-01 12:17:54</td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-transparent dark:bg-transparent cursor-pointer">
              <td className="py-3 px-4 text-center">2</td>
              <td className="py-3 px-4 text-center">Siliconsilk</td>
              <td className="py-3 px-4 text-center">K-BANK</td>
              <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400 text-center">
                7016800761057
              </td>
              <td className="py-3 px-4 text-center">LISHUANGXI</td>
              <td className="py-3 px-4 text-center">
                {getText("rotatingType")}
              </td>
              <td className="py-3 px-4 text-center">2025-04-01 12:17:46</td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-transparent dark:bg-transparent cursor-pointer">
              <td className="py-3 px-4 text-center">3</td>
              <td className="py-3 px-4 text-center">atglobal</td>
              <td className="py-3 px-4 text-center">K-BANK</td>
              <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400 text-center">
                7016800761066
              </td>
              <td className="py-3 px-4 text-center">Choi You Na</td>
              <td className="py-3 px-4 text-center">{getText("fixedType")}</td>
              <td className="py-3 px-4 text-center">2025-04-01 12:08:47</td>
            </tr>
            <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-transparent dark:bg-transparent cursor-pointer">
              <td className="py-3 px-4 text-center">4</td>
              <td className="py-3 px-4 text-center">sticpay</td>
              <td className="py-3 px-4 text-center">K-BANK</td>
              <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400 text-center">
                7016800761033
              </td>
              <td className="py-3 px-4 text-center">WOOJOO LEE</td>
              <td className="py-3 px-4 text-center">
                {getText("rotatingType")}
              </td>
              <td className="py-3 px-4 text-center">2025-04-01 11:50:08</td>
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
    </div>
  );
}
