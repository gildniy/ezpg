"use client";

import { useState, useEffect } from "react";
import { Button } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { Checkbox } from "@ezpg/ui";
import { X, Copy, Save, RefreshCw, AlertCircle } from "lucide-react";
import { Textarea } from "@ezpg/ui";

// 한국 은행 목록 상수 정의
const KOREAN_BANKS = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협은행",
  "기업은행",
  "SC제일은행",
  "카카오뱅크",
  "케이뱅크",
  "토스뱅크",
  "부산은행",
  "대구은행",
  "경남은행",
  "광주은행",
  "전북은행",
  "제주은행",
  "산업은행",
  "수협은행",
  "새마을금고",
  "신협",
  "우체국",
  "씨티은행",
  "도이치은행",
  "BNP파리바은행",
  "중국은행",
];

// 은행별 설정 인터페이스
interface BankSettings {
  depositFee: number;
  depositPerTransactionFee: number;
  settlementFee: number;
  settlementPerTransactionFee: number;
  withdrawalFee: number;
  withdrawalPerTransactionFee: number;
  foreignDepositFee: number;
  foreignWithdrawalFee: number;
  reserveFund: number; // 유보금 필드 추가
  reserveRatio: number; // 현금 유보비율 필드 추가
  status: string;
  agent1: number;
  agent2: number;
  agent3: number;
  agent4: number;
  agent5: number;
}

// 기본 은행 설정
const DEFAULT_BANK_SETTINGS: BankSettings = {
  depositFee: 0,
  depositPerTransactionFee: 0,
  settlementFee: 0,
  settlementPerTransactionFee: 0,
  withdrawalFee: 0,
  withdrawalPerTransactionFee: 0,
  foreignDepositFee: 0,
  foreignWithdrawalFee: 0,
  reserveFund: 0, // 유보금 기본값
  reserveRatio: 0, // 현금 유보비율 기본값
  status: "사용",
  agent1: 0,
  agent2: 0,
  agent3: 0,
  agent4: 0,
  agent5: 0,
};

interface MerchantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
}

export function MerchantDetailModal({
  isOpen,
  onClose,
  merchantId,
}: MerchantDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [otpEnabled, setOtpEnabled] = useState(true);

  // 가맹점 기본 데이터
  const [merchantData, setMerchantData] = useState({
    id: merchantId,
    name: merchantId === "merchant1" ? "sticpay" : "atglobal",
    companyName: merchantId === "merchant1" ? "sticpay" : "atglobal",
    group: merchantId === "merchant1" ? "신한은행" : "KB국민은행", // 기본 그룹을 은행으로 설정
    memberCount: merchantId === "merchant1" ? 71 : 52,
    mid: merchantId === "merchant1" ? "STIC_PAY_12345" : "ATGLOBAL_67890",
    mkey:
      merchantId === "merchant1"
        ? "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
        : "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4",
    callbackUrl:
      merchantId === "merchant1"
        ? "https://api.sticpay.com/callback"
        : "https://api.atglobal.com/callback",
    dashboardId:
      merchantId === "merchant1" ? "sticpay_admin" : "atglobal_admin",
    dashboardPassword: "••••••••",
    connectedBanks:
      merchantId === "merchant1"
        ? ["신한은행", "우리은행", "카카오뱅크"]
        : ["KB국민은행", "하나은행", "제주은행"],
  });

  // 은행별 설정 데이터
  const [bankSettingsMap, setBankSettingsMap] = useState<
    Record<string, BankSettings>
  >({});

  // 현재 선택된 은행의 설정
  const [currentBankSettings, setCurrentBankSettings] = useState<BankSettings>({
    ...DEFAULT_BANK_SETTINGS,
  });

  const [alertSettings, setAlertSettings] = useState({
    telegramId:
      merchantId === "merchant1" ? "@sticpay_alert" : "@atglobal_alert",
    alertTypes: {
      paymentFailure: true,
      systemDown: true,
      apiError: false,
      dbError: false,
    },
    alertTime: {
      allDay: true,
      workingHours: false,
      custom: false,
    },
  });

  // 선택된 은행 목록을 위한 상태 추가
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);

  // 컴포넌트가 마운트될 때 merchantData에서 선택된 은행 초기화 및 은행별 설정 초기화
  useEffect(() => {
    if (merchantData.connectedBanks && merchantData.connectedBanks.length > 0) {
      setSelectedBanks(merchantData.connectedBanks);

      // 은행별 설정 초기화
      const initialBankSettings: Record<string, BankSettings> = {};

      // 예시 데이터로 각 은행별 설정 초기화
      merchantData.connectedBanks.forEach((bank, index) => {
        initialBankSettings[bank] = {
          depositFee: 0.5 + index * 0.2,
          depositPerTransactionFee: 1000 + index * 100,
          settlementFee: 0.4 + index * 0.1,
          settlementPerTransactionFee: 500 + index * 50,
          withdrawalFee: 0.3 + index * 0.15,
          withdrawalPerTransactionFee: 1500 + index * 150,
          foreignDepositFee: 1 + index * 0.25,
          foreignWithdrawalFee: 2 + index * 0.3,
          reserveFund: 50000 + index * 10000, // 유보금 초기값
          reserveRatio: 5 + index * 0.5, // 현금 유보비율 초기값
          status: "사용",
          agent1: 50 - index * 5,
          agent2: 30 - index * 3,
          agent3: 15 - index * 2,
          agent4: 5 - index,
          agent5: index,
        };
      });

      setBankSettingsMap(initialBankSettings);

      // 현재 그룹이 선택된 은행 중 하나가 아니라면 첫 번째 은행으로 설정
      if (!merchantData.connectedBanks.includes(merchantData.group)) {
        setMerchantData((prev) => ({
          ...prev,
          group: merchantData.connectedBanks[0],
        }));

        // 현재 선택된 은행의 설정 로드
        if (initialBankSettings[merchantData.connectedBanks[0]]) {
          setCurrentBankSettings(
            initialBankSettings[merchantData.connectedBanks[0]],
          );
        }
      } else {
        // 현재 선택된 은행의 설정 로드
        if (initialBankSettings[merchantData.group]) {
          setCurrentBankSettings(initialBankSettings[merchantData.group]);
        }
      }
    }
  }, [merchantData.connectedBanks]);

  // 그룹(은행) 변경 시 해당 은행의 설정 로드
  useEffect(() => {
    if (bankSettingsMap[merchantData.group]) {
      setCurrentBankSettings(bankSettingsMap[merchantData.group]);
    } else {
      setCurrentBankSettings({ ...DEFAULT_BANK_SETTINGS });
    }
  }, [merchantData.group, bankSettingsMap]);

  if (!isOpen) return null;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // 현재 선택된 은행의 설정 저장
    setBankSettingsMap((prev) => ({
      ...prev,
      [merchantData.group]: currentBankSettings,
    }));

    // 선택된 은행을 merchantData에 저장
    setMerchantData((prev) => ({
      ...prev,
      connectedBanks: selectedBanks,
    }));

    setIsEditing(false);
    // 성공 메시지 표시
    alert("가맹점 정보가 성공적으로 저장되었습니다.");
  };

  const handleCancelClick = () => {
    // 편집 취소 - 현재 선택된 은행의 설정 복원
    if (bankSettingsMap[merchantData.group]) {
      setCurrentBankSettings(bankSettingsMap[merchantData.group]);
    } else {
      setCurrentBankSettings({ ...DEFAULT_BANK_SETTINGS });
    }
    setIsEditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // 복사 성공 알림
        alert("클립보드에 복사되었습니다.");
      })
      .catch((err) => {
        console.error("클립보드 복사 실패:", err);
      });
  };

  const regenerateOtpKey = () => {
    // OTP 키 재생성 로직 (실제로는 서버에 요청)
    alert("OTP 키가 재생성되었습니다.");
  };

  // 은행 체크박스 변경 핸들러
  const handleBankChange = (bank: string, checked: boolean) => {
    let newSelectedBanks: string[] = [];

    if (checked) {
      newSelectedBanks = [...selectedBanks, bank];
      setSelectedBanks(newSelectedBanks);

      // 첫 번째 선택된 은행을 그룹 값으로 설정 (선택된 은행이 없었을 경우)
      if (selectedBanks.length === 0) {
        setMerchantData((prev) => ({ ...prev, group: bank }));

        // 새 은행의 설정 초기화
        if (!bankSettingsMap[bank]) {
          setBankSettingsMap((prev) => ({
            ...prev,
            [bank]: { ...DEFAULT_BANK_SETTINGS },
          }));
          setCurrentBankSettings({ ...DEFAULT_BANK_SETTINGS });
        }
      }
    } else {
      newSelectedBanks = selectedBanks.filter((b) => b !== bank);
      setSelectedBanks(newSelectedBanks);

      // 선택 해제된 은행이 현재 그룹 값과 같다면 다른 은행으로 변경
      if (merchantData.group === bank) {
        if (newSelectedBanks.length > 0) {
          setMerchantData((prev) => ({ ...prev, group: newSelectedBanks[0] }));

          // 새로 선택된 은행의 설정 로드
          if (bankSettingsMap[newSelectedBanks[0]]) {
            setCurrentBankSettings(bankSettingsMap[newSelectedBanks[0]]);
          }
        } else {
          // 선택된 은행이 없는 경우 기본값 설정
          setMerchantData((prev) => ({ ...prev, group: "선택된 은행 없음" }));
          setCurrentBankSettings({ ...DEFAULT_BANK_SETTINGS });
        }
      }
    }
  };

  // 모든 은행 선택/해제 핸들러
  const handleSelectAllBanks = () => {
    if (selectedBanks.length === KOREAN_BANKS.length) {
      setSelectedBanks([]);
      setMerchantData((prev) => ({ ...prev, group: "선택된 은행 없음" }));
      setCurrentBankSettings({ ...DEFAULT_BANK_SETTINGS });
    } else {
      setSelectedBanks([...KOREAN_BANKS]);
      if (KOREAN_BANKS.length > 0) {
        setMerchantData((prev) => ({ ...prev, group: KOREAN_BANKS[0] }));

        // 첫 번째 은행의 설정 로드
        if (bankSettingsMap[KOREAN_BANKS[0]]) {
          setCurrentBankSettings(bankSettingsMap[KOREAN_BANKS[0]]);
        } else {
          // 새 은행들의 설정 초기화
          const newBankSettings: Record<string, BankSettings> = {
            ...bankSettingsMap,
          };
          KOREAN_BANKS.forEach((bank) => {
            if (!newBankSettings[bank]) {
              newBankSettings[bank] = { ...DEFAULT_BANK_SETTINGS };
            }
          });
          setBankSettingsMap(newBankSettings);
          setCurrentBankSettings({ ...DEFAULT_BANK_SETTINGS });
        }
      }
    }
  };

  // 현재 은행 설정 변경 핸들러
  const handleBankSettingChange = (
    field: keyof BankSettings,
    value: number | string,
  ) => {
    setCurrentBankSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 그룹(은행) 변경 핸들러
  const handleGroupChange = (bank: string) => {
    setMerchantData((prev) => ({
      ...prev,
      group: bank,
    }));

    // 선택된 은행의 설정 로드
    if (bankSettingsMap[bank]) {
      setCurrentBankSettings(bankSettingsMap[bank]);
    } else {
      // 새 은행의 설정 초기화
      setBankSettingsMap((prev) => ({
        ...prev,
        [bank]: { ...DEFAULT_BANK_SETTINGS },
      }));
      setCurrentBankSettings({ ...DEFAULT_BANK_SETTINGS });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium">가맹점 상세 정보</h2>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelClick}
                  className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                >
                  <X className="h-4 w-4 mr-1" />
                  취소
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveClick}
                  className="text-green-500 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/30"
                >
                  <Save className="h-4 w-4 mr-1" />
                  저장
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
              >
                정보 수정
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="integration">개발 연동 정보</TabsTrigger>
              <TabsTrigger value="bank">은행 연동 정보</TabsTrigger>
              <TabsTrigger value="alert">장애 알림 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">가맹점명</Label>
                  <Input
                    id="name"
                    value={merchantData.name}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setMerchantData({ ...merchantData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">회사명</Label>
                  <Input
                    id="companyName"
                    value={merchantData.companyName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setMerchantData({
                        ...merchantData,
                        companyName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">그룹 (연동 은행)</Label>
                  {isEditing ? (
                    <Select
                      value={merchantData.group}
                      onValueChange={handleGroupChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="은행 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* 선택된 은행이 없는 경우 표시할 옵션 */}
                        {selectedBanks.length === 0 && (
                          <SelectItem value="선택된 은행 없음">
                            선택된 은행 없음
                          </SelectItem>
                        )}

                        {/* 선택된 은행들만 그룹 옵션으로 표시 */}
                        {selectedBanks.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="group" value={merchantData.group} disabled />
                  )}
                  {selectedBanks.length === 0 && isEditing && (
                    <p className="text-xs text-amber-500 mt-1">
                      은행 연동 정보 탭에서 은행을 선택하세요.
                    </p>
                  )}
                </div>
              </div>

              {/* 현재 선택된 은행의 설정 표시 */}
              {merchantData.group !== "선택된 은행 없음" && (
                <>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-md font-medium">
                        {merchantData.group} 설정
                      </h3>
                      <div className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                        현재 선택됨
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="depositFee">입금수수료 (%)</Label>
                        <Input
                          id="depositFee"
                          type="number"
                          step="0.01"
                          value={currentBankSettings.depositFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "depositFee",
                              Number.parseFloat(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="depositPerTransactionFee">
                          입금건당수수료 (원)
                        </Label>
                        <Input
                          id="depositPerTransactionFee"
                          type="number"
                          value={currentBankSettings.depositPerTransactionFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "depositPerTransactionFee",
                              Number.parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdrawalFee">출금수수료 (%)</Label>
                        <Input
                          id="withdrawalFee"
                          type="number"
                          step="0.01"
                          value={currentBankSettings.withdrawalFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "withdrawalFee",
                              Number.parseFloat(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdrawalPerTransactionFee">
                          출금건당수수료 (원)
                        </Label>
                        <Input
                          id="withdrawalPerTransactionFee"
                          type="number"
                          value={currentBankSettings.withdrawalPerTransactionFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "withdrawalPerTransactionFee",
                              Number.parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settlementFee">정산수수료 (%)</Label>
                        <Input
                          id="settlementFee"
                          type="number"
                          step="0.01"
                          value={currentBankSettings.settlementFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "settlementFee",
                              Number.parseFloat(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="settlementPerTransactionFee">
                          정산건당수수료 (원)
                        </Label>
                        <Input
                          id="settlementPerTransactionFee"
                          type="number"
                          value={currentBankSettings.settlementPerTransactionFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "settlementPerTransactionFee",
                              Number.parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foreignDepositFee">
                          외화수수료 (%)
                        </Label>
                        <Input
                          id="foreignDepositFee"
                          type="number"
                          step="0.01"
                          value={currentBankSettings.foreignDepositFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "foreignDepositFee",
                              Number.parseFloat(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foreignWithdrawalFee">
                          외화송금수수료 (%)
                        </Label>
                        <Input
                          id="foreignWithdrawalFee"
                          type="number"
                          step="0.01"
                          value={currentBankSettings.foreignWithdrawalFee.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "foreignWithdrawalFee",
                              Number.parseFloat(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reserveFund">유보금 (원)</Label>
                        <Input
                          id="reserveFund"
                          type="number"
                          value={currentBankSettings.reserveFund.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "reserveFund",
                              Number.parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reserveRatio">현금 유보비율 (%)</Label>
                        <Input
                          id="reserveRatio"
                          type="number"
                          step="0.01"
                          value={currentBankSettings.reserveRatio.toString()}
                          disabled={!isEditing}
                          onChange={(e) =>
                            handleBankSettingChange(
                              "reserveRatio",
                              Number.parseFloat(e.target.value),
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="reserveFund">유보금 (원)</Label>
                          <Input
                            id="reserveFund"
                            type="number"
                            value={currentBankSettings.reserveFund.toString()}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBankSettingChange(
                                "reserveFund",
                                Number.parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reserveRatio">
                            가맹점 현금 유보비율 (%)
                          </Label>
                          <Input
                            id="reserveRatio"
                            type="number"
                            step="0.1"
                            value={currentBankSettings.reserveRatio.toString()}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBankSettingChange(
                                "reserveRatio",
                                Number.parseFloat(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2 max-w-[50%]">
                        <Label htmlFor="status">상태</Label>
                        {isEditing ? (
                          <Select
                            value={currentBankSettings.status}
                            onValueChange={(value) =>
                              handleBankSettingChange("status", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="상태 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="사용">사용</SelectItem>
                              <SelectItem value="중지">중지</SelectItem>
                              <SelectItem value="대기">대기</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="status"
                            value={currentBankSettings.status}
                            disabled
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-3">
                        에이전트 설정
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="agent1">에이전트1 (%)</Label>
                          <Input
                            id="agent1"
                            type="number"
                            value={currentBankSettings.agent1.toString()}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBankSettingChange(
                                "agent1",
                                Number.parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agent2">에이전트2 (%)</Label>
                          <Input
                            id="agent2"
                            type="number"
                            value={currentBankSettings.agent2.toString()}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBankSettingChange(
                                "agent2",
                                Number.parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agent3">에이전트3 (%)</Label>
                          <Input
                            id="agent3"
                            type="number"
                            value={currentBankSettings.agent3.toString()}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBankSettingChange(
                                "agent3",
                                Number.parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agent4">에이전트4 (%)</Label>
                          <Input
                            id="agent4"
                            type="number"
                            value={currentBankSettings.agent4.toString()}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBankSettingChange(
                                "agent4",
                                Number.parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agent5">에이전트5 (%)</Label>
                          <Input
                            id="agent5"
                            type="number"
                            value={currentBankSettings.agent5.toString()}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBankSettingChange(
                                "agent5",
                                Number.parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 다른 은행 설정 안내 */}
                  {selectedBanks.length > 1 && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <p>
                        다른 은행의 설정을 변경하려면 위의 그룹(연동 은행)
                        드롭다운에서 은행을 선택하세요.
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mid">가맹점 MID</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(merchantData.mid)}
                      className="h-8 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      복사
                    </Button>
                  </div>
                  <Input
                    id="mid"
                    value={merchantData.mid}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setMerchantData({ ...merchantData, mid: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mkey">가맹점 MKEY</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(merchantData.mkey)}
                      className="h-8 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      복사
                    </Button>
                  </div>
                  <Input
                    id="mkey"
                    value={merchantData.mkey}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setMerchantData({ ...merchantData, mkey: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callbackUrl">콜백 URL</Label>
                  <Input
                    id="callbackUrl"
                    value={merchantData.callbackUrl}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setMerchantData({
                        ...merchantData,
                        callbackUrl: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="border-t pt-4 mt-6">
                  <h3 className="text-md font-medium mb-4">
                    대시보드 로그인 설정
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dashboardId">대시보드 아이디</Label>
                      <Input
                        id="dashboardId"
                        value={merchantData.dashboardId}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setMerchantData({
                            ...merchantData,
                            dashboardId: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dashboardPassword">
                        대시보드 비밀번호
                      </Label>
                      <Input
                        id="dashboardPassword"
                        type="password"
                        value={merchantData.dashboardPassword}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setMerchantData({
                            ...merchantData,
                            dashboardPassword: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id="otpEnabled"
                        checked={otpEnabled}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setOtpEnabled(checked as boolean)
                        }
                      />
                      <Label htmlFor="otpEnabled" className="cursor-pointer">
                        OTP 사용
                      </Label>
                    </div>

                    {otpEnabled && (
                      <div className="pl-6 mt-2 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              OTP QR 코드
                            </span>
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={regenerateOtpKey}
                                className="h-8 text-xs"
                              >
                                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                재생성
                              </Button>
                            )}
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-4 rounded-md flex items-center justify-center">
                            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                              QR 코드 이미지
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium">연동 은행 선택</h3>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllBanks}
                      className="text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                    >
                      {selectedBanks.length === KOREAN_BANKS.length
                        ? "모두 해제"
                        : "모두 선택"}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {KOREAN_BANKS.map((bank) => (
                    <div
                      key={bank}
                      className="flex items-center space-x-2 p-2 border rounded-md"
                    >
                      <Checkbox
                        id={`modal-bank-${bank}`}
                        disabled={!isEditing}
                        checked={selectedBanks.includes(bank)}
                        onCheckedChange={(checked) =>
                          handleBankChange(bank, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`modal-bank-${bank}`}
                        className="cursor-pointer"
                      >
                        {bank}
                      </Label>
                    </div>
                  ))}
                </div>

                {selectedBanks.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      선택된 은행 ({selectedBanks.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBanks.map((bank) => (
                        <div
                          key={bank}
                          className={`px-2 py-1 rounded text-xs ${
                            bank === merchantData.group
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium"
                              : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          }`}
                        >
                          {bank} {bank === merchantData.group && "(그룹)"}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    선택된 은행과의 연동을 통해 가맹점은 해당 은행의 계좌
                    서비스를 이용할 수 있습니다. 연동 설정 후 은행별 세부 설정은
                    기본 정보 탭에서 각 은행을 선택하여 설정할 수 있습니다.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alert" className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md mb-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  장애 알림 기능은 추후 개발 예정입니다. 아래 설정은 저장되지만
                  실제로 작동하지 않습니다.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegramId">텔레그램 아이디</Label>
                  <Input
                    id="telegramId"
                    value={alertSettings.telegramId}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAlertSettings({
                        ...alertSettings,
                        telegramId: e.target.value,
                      })
                    }
                    placeholder="@username"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    텔레그램 봇을 통해 장애 알림을 받을 아이디를 입력하세요.
                  </p>
                </div>

                <div className="space-y-2 mt-4">
                  <Label>알림 유형</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="paymentFailure"
                        checked={alertSettings.alertTypes.paymentFailure}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setAlertSettings({
                            ...alertSettings,
                            alertTypes: {
                              ...alertSettings.alertTypes,
                              paymentFailure: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label
                        htmlFor="paymentFailure"
                        className="cursor-pointer"
                      >
                        결제 실패
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="systemDown"
                        checked={alertSettings.alertTypes.systemDown}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setAlertSettings({
                            ...alertSettings,
                            alertTypes: {
                              ...alertSettings.alertTypes,
                              systemDown: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="systemDown" className="cursor-pointer">
                        시스템 다운
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="apiError"
                        checked={alertSettings.alertTypes.apiError}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setAlertSettings({
                            ...alertSettings,
                            alertTypes: {
                              ...alertSettings.alertTypes,
                              apiError: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="apiError" className="cursor-pointer">
                        API 오류
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dbError"
                        checked={alertSettings.alertTypes.dbError}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setAlertSettings({
                            ...alertSettings,
                            alertTypes: {
                              ...alertSettings.alertTypes,
                              dbError: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="dbError" className="cursor-pointer">
                        데이터베이스 오류
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label>알림 수신 시간</Label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allDay"
                        checked={alertSettings.alertTime.allDay}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setAlertSettings({
                            ...alertSettings,
                            alertTime: {
                              allDay: checked as boolean,
                              workingHours: false,
                              custom: false,
                            },
                          })
                        }
                      />
                      <Label htmlFor="allDay" className="cursor-pointer">
                        24시간
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="workingHours"
                        checked={alertSettings.alertTime.workingHours}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setAlertSettings({
                            ...alertSettings,
                            alertTime: {
                              allDay: false,
                              workingHours: checked as boolean,
                              custom: false,
                            },
                          })
                        }
                      />
                      <Label htmlFor="workingHours" className="cursor-pointer">
                        업무 시간 (9:00 - 18:00)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="custom"
                        checked={alertSettings.alertTime.custom}
                        disabled={!isEditing}
                        onCheckedChange={(checked) =>
                          setAlertSettings({
                            ...alertSettings,
                            alertTime: {
                              allDay: false,
                              workingHours: false,
                              custom: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="custom" className="cursor-pointer">
                        사용자 지정
                      </Label>
                    </div>
                    {alertSettings.alertTime.custom && isEditing && (
                      <div className="pl-6 mt-2">
                        <Textarea
                          placeholder="시간 범위를 입력하세요 (예: 9:00-12:00, 13:00-18:00)"
                          className="h-20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
