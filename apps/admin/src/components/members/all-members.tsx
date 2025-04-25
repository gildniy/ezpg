"use client";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
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
import { useNavigation } from "@/contexts/navigation-context";
// 상단 import 부분에 Dialog 관련 컴포넌트 추가
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ezpg/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ezpg/ui";
import { Card, CardContent } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import {
  AlertCircle,
  Ban,
  Save,
  RotateCcw,
  Clock,
  CreditCard,
  User,
  FileText,
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";
import { DateRangePicker } from "@ezpg/ui";

// MemberDetail import 제거
// import { MemberDetail } from "./member-detail"

export function AllMembersContent() {
  const tableRef = useRef<HTMLTableElement>(null);
  const { navigateTo, activePage } = useNavigation();
  // useState 부분 수정
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDetailConditionOpen, setIsDetailConditionOpen] = useState(false);

  // 컴포넌트가 마운트된 후 테이블 헤더와 셀에 직접 스타일 적용
  useEffect(() => {
    if (tableRef.current) {
      // 테이블 헤더에 스타일 적용
      const headers = tableRef.current.querySelectorAll("th");
      headers.forEach((header) => {
        const element = header as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          max-height: 3rem !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
          text-align: center !important;
        `;
      });

      // 테이블 셀에도 스타일 적용
      const cells = tableRef.current.querySelectorAll("td");
      cells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          max-height: 3rem !important;
          height: 3rem !important;
          line-height: 3rem !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: table-cell !important;
          text-align: center !important;
        `;
      });
    }
  }, []);

  // handleDetailClick 함수 수정
  const handleDetailClick = (memberId: string) => {
    // 임시 데이터 - 실제로는 API에서 가져와야 함
    const mockMember = {
      id: memberId,
      username: memberId === "test01" ? "test01" : "user123",
      merchant: memberId === "test01" ? "test03" : "merchant05",
      companyName: memberId === "test01" ? "test03" : "주식회사 예시",
      realName: memberId === "test01" ? "test01" : "김철수",
      phone: memberId === "test01" ? "010-1234-5678" : "010-9876-5432",
      idNumber: memberId === "test01" ? "900101-1234567" : "880505-2345678",
      accountHolder: memberId === "test01" ? "test01" : "김철수",
      bank: memberId === "test01" ? "국민은행" : "신한은행",
      accountNumber: memberId === "test01" ? "7016800760867" : "110987654321",
      virtualAccount:
        memberId === "test01" ? "110-123456-78901" : "110-987654-32109",
      joinDate:
        memberId === "test01" ? "2025-02-21 22:14:39" : "2024-01-15 14:22:10",
      totalDeposit: memberId === "test01" ? "6,100,000원" : "12,500,000원",
      totalWithdrawal: memberId === "test01" ? "3,500,000원" : "8,750,000원",
      status: "사용",
      email:
        memberId === "test01" ? "test01@example.com" : "user123@example.com",
      address: "서울특별시 강남구 테헤란로 123",
      memo: "특이사항 없음",
      lastLoginDate:
        memberId === "test01" ? "2025-03-01 10:23:45" : "2024-03-02 09:15:30",
      transactions: [
        {
          id: "tx1",
          date: "2025-03-01 09:30:22",
          type: "입금",
          amount: "1,000,000원",
          balance: "3,500,000원",
          status: "완료",
        },
        {
          id: "tx2",
          date: "2025-02-28 14:22:10",
          type: "출금",
          amount: "500,000원",
          balance: "2,500,000원",
          status: "완료",
        },
        {
          id: "tx3",
          date: "2025-02-25 11:15:33",
          type: "입금",
          amount: "2,000,000원",
          balance: "3,000,000원",
          status: "완료",
        },
      ],
    };

    setSelectedMember(mockMember);
    setIsDetailModalOpen(true);
  };

  // 삭제 확인 모달 열기 함수 추가
  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  // 삭제 실행 함수 추가
  const handleConfirmDelete = () => {
    // 실제로는 API 호출하여 삭제 처리
    console.log(`회원 삭제: ${selectedMember?.id}`);
    setIsDeleteConfirmOpen(false);
    setIsDetailModalOpen(false);
    // 성공 메시지 표시 등의 추가 처리
  };

  // 상세조건 모달 열기 함수 추가
  const handleDetailConditionClick = () => {
    setIsDetailConditionOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">전체 회원</h2>
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
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          상세조건
        </Button>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
        >
          <Search className="h-4 w-4 mr-2" />
          검색
        </Button>

        <Button
          variant="outline"
          className="dark:border-gray-700 dark:text-gray-200"
        >
          엑셀다운로드
        </Button>
      </div>

      <div className="overflow-x-auto w-full">
        <TableContainer minWidth="1800px">
          <table
            ref={tableRef}
            className="w-full text-sm"
            style={{ tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  번호
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  아이디
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  가맹점
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  업체명
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  실명
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  휴대폰
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  주민등록번호
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  예금주
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  은행
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  계좌번호
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  가상계좌
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  가입일자
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  총 입금
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  총 출금
                </th>
                <th
                  className="py-3 px-2 text-center font-medium"
                  style={{ textAlign: "center" }}
                >
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                onClick={() => handleDetailClick("test01")}
                className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  1
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      test01
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      test03
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  test03
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  test01
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  010-1234-5678
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  900101-1234567
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  test01
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  국민은행
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  7016800760867
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  110-123456-78901
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  2025-02-21 22:14:39
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  6,100,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  3,500,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  사용
                </td>
              </tr>
              <tr
                onClick={() => handleDetailClick("user123")}
                className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  2
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      user123
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  <div className="flex justify-center">
                    <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                      merchant05
                    </span>
                  </div>
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  주식회사 예시
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  김철수
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  010-9876-5432
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  880505-2345678
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  김철수
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  신한은행
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  110987654321
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  110-987654-32109
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  2024-01-15 14:22:10
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  12,500,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  8,750,000원
                </td>
                <td
                  className="py-3 px-2 text-center"
                  style={{ textAlign: "center" }}
                >
                  사용
                </td>
              </tr>
            </tbody>
          </table>
        </TableContainer>
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

      {/* 회원 상세 정보 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>회원 상세 정보</DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <Tabs defaultValue="basic-info" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="basic-info" className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  기본 정보
                </TabsTrigger>
                <TabsTrigger
                  value="transaction-history"
                  className="flex items-center"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  거래 내역
                </TabsTrigger>
                <TabsTrigger value="account-info" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  계좌 정보
                </TabsTrigger>
                <TabsTrigger value="memo" className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  메모
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  보안 관리
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic-info">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>아이디</Label>
                          <div className="font-medium">
                            <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                              {selectedMember.username}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>가맹점</Label>
                          <div className="font-medium">
                            <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">
                              {selectedMember.merchant}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>업체명</Label>
                          <Input
                            value={selectedMember.companyName}
                            className="max-w-md"
                          />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>실명</Label>
                          <Input
                            value={selectedMember.realName}
                            className="max-w-md"
                          />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>휴대폰</Label>
                          <Input
                            value={selectedMember.phone}
                            className="max-w-md"
                          />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>주민등록번호</Label>
                          <Input
                            value={selectedMember.idNumber}
                            className="max-w-md"
                          />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>이메일</Label>
                          <Input
                            value={selectedMember.email}
                            className="max-w-md"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>주소</Label>
                          <Input
                            value={selectedMember.address}
                            className="max-w-md"
                          />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>가입일자</Label>
                          <div className="font-medium">
                            {selectedMember.joinDate}
                          </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>최근 로그인</Label>
                          <div className="font-medium">
                            {selectedMember.lastLoginDate}
                          </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>총 입금</Label>
                          <div className="font-medium text-green-600">
                            {selectedMember.totalDeposit}
                          </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>총 출금</Label>
                          <div className="font-medium text-red-600">
                            {selectedMember.totalWithdrawal}
                          </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>상태</Label>
                          <Select defaultValue={selectedMember.status}>
                            <SelectTrigger className="max-w-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="사용">사용</SelectItem>
                              <SelectItem value="정지">정지</SelectItem>
                              <SelectItem value="휴면">휴면</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transaction-history">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">거래 내역</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          새로고침
                        </Button>
                      </div>
                    </div>

                    <TableContainer>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th
                              className="py-3 px-4 text-center font-medium"
                              style={{ textAlign: "center" }}
                            >
                              거래 ID
                            </th>
                            <th
                              className="py-3 px-4 text-center font-medium"
                              style={{ textAlign: "center" }}
                            >
                              일시
                            </th>
                            <th
                              className="py-3 px-4 text-center font-medium"
                              style={{ textAlign: "center" }}
                            >
                              유형
                            </th>
                            <th
                              className="py-3 px-4 text-center font-medium"
                              style={{ textAlign: "center" }}
                            >
                              금액
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
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMember.transactions.map((tx: any) => (
                            <tr
                              key={tx.id}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <td
                                className="py-3 px-4 text-center"
                                style={{ textAlign: "center" }}
                              >
                                {tx.id}
                              </td>
                              <td
                                className="py-3 px-4 text-center"
                                style={{ textAlign: "center" }}
                              >
                                {tx.date}
                              </td>
                              <td
                                className="py-3 px-4 text-center"
                                style={{ textAlign: "center" }}
                              >
                                <div className="flex justify-center">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${tx.type === "입금" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                  >
                                    {tx.type}
                                  </span>
                                </div>
                              </td>
                              <td
                                className="py-3 px-4 text-center"
                                style={{ textAlign: "center" }}
                              >
                                {tx.amount}
                              </td>
                              <td
                                className="py-3 px-4 text-center"
                                style={{ textAlign: "center" }}
                              >
                                {tx.balance}
                              </td>
                              <td
                                className="py-3 px-4 text-center"
                                style={{ textAlign: "center" }}
                              >
                                <div className="flex justify-center">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {tx.status}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account-info">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">계좌 정보</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>예금주</Label>
                          <Input
                            value={selectedMember.accountHolder}
                            className="max-w-md"
                          />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>은행</Label>
                          <Select defaultValue={selectedMember.bank}>
                            <SelectTrigger className="max-w-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="국민은행">국민은행</SelectItem>
                              <SelectItem value="신한은행">신한은행</SelectItem>
                              <SelectItem value="우리은행">우리은행</SelectItem>
                              <SelectItem value="하나은행">하나은행</SelectItem>
                              <SelectItem value="농협은행">농협은행</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>계좌번호</Label>
                          <Input
                            value={selectedMember.accountNumber}
                            className="max-w-md"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>가상계좌</Label>
                          <Input
                            value={selectedMember.virtualAccount}
                            className="max-w-md"
                          />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                          <Label>가상계좌 상태</Label>
                          <Select defaultValue="활성">
                            <SelectTrigger className="max-w-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="활성">활성</SelectItem>
                              <SelectItem value="비활성">비활성</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="memo">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">메모</h3>
                    <textarea
                      className="w-full h-40 p-3 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-800"
                      defaultValue={selectedMember.memo}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">보안 관리</h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">비밀번호 초기화</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          회원의 비밀번호를 초기화합니다. 초기화된 비밀번호는
                          회원에게 SMS로 전송됩니다.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          비밀번호 초기화
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">로그인 기록</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          최근 5회 로그인 기록을 확인합니다.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          로그인 기록 조회
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">계정 잠금 해제</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          비밀번호 5회 오류 등으로 잠긴 계정을 해제합니다.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          계정 잠금 해제
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              회원 삭제
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
              >
                <Ban className="h-4 w-4 mr-1" />
                계정 정지
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/30"
              >
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              회원 삭제 확인
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>정말로 이 회원을 삭제하시겠습니까?</p>
            <p className="text-sm text-gray-500 mt-2">
              이 작업은 되돌릴 수 없으며 모든 회원 데이터가 영구적으로
              삭제됩니다.
            </p>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              삭제 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 상세조건 모달 */}
      <Dialog
        open={isDetailConditionOpen}
        onOpenChange={setIsDetailConditionOpen}
      >
        <DialogContent className="max-w-[450px] w-full">
          <div className="flex items-center justify-between border-b pb-2">
            <DialogTitle className="text-lg font-medium">상세조건</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailConditionOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="search-period" className="text-sm">
                조회기간
              </Label>
              <div className="flex items-center">
                <DateRangePicker className="w-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="merchant" className="text-sm">
                가맹점 선택
              </Label>
              <Select>
                <SelectTrigger id="merchant">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="merchant1">가맹점1</SelectItem>
                  <SelectItem value="merchant2">가맹점2</SelectItem>
                  <SelectItem value="merchant3">가맹점3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm">
                상태
              </Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">사용</SelectItem>
                  <SelectItem value="suspended">정지</SelectItem>
                  <SelectItem value="dormant">휴면</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="keyword" className="text-sm">
                키워드
              </Label>
              <Input id="keyword" placeholder="키워드를 입력하세요" />
            </div>
          </div>

          <div className="border-t pt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDetailConditionOpen(false)}
            >
              초기화
            </Button>
            <Button onClick={() => setIsDetailConditionOpen(false)}>
              조회
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TableStylesApplier />
    </div>
  );
}
