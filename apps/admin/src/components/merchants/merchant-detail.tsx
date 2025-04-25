"use client";

import { useState } from "react";
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
import { useNavigation } from "@/contexts/navigation-context";
import { ArrowLeft, Copy, Save, X, RefreshCw } from "lucide-react";
import { Textarea } from "@ezpg/ui";

export function MerchantDetailContent() {
  const { navigateTo } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [merchantData, setMerchantData] = useState({
    id: "merchant1",
    name: "sticpay",
    companyName: "sticpay",
    group: "제휴사 그룹",
    depositFee: 0.33,
    depositPerTransactionFee: 1000,
    settlementFee: 0.5,
    settlementPerTransactionFee: 500,
    withdrawalFee: 0.11,
    withdrawalPerTransactionFee: 1500,
    foreignDepositFee: 1,
    foreignWithdrawalFee: 3,
    agent1: 55,
    agent2: 35,
    agent3: 10,
    agent4: 0,
    agent5: 0,
    status: "사용",
    mid: "STIC_PAY_12345",
    mkey: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    callbackUrl: "https://api.sticpay.com/callback",
    dashboardId: "sticpay_admin",
    dashboardPassword: "••••••••",
  });

  const [alertSettings, setAlertSettings] = useState({
    telegramId: "@sticpay_alert",
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

  const handleBackClick = () => {
    navigateTo("all-merchants");
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // 여기서 저장 로직 구현
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    // 편집 취소
    setIsEditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // 복사 성공 알림 (추후 toast 메시지로 대체 가능)
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            돌아가기
          </Button>
          <h2 className="text-lg font-medium">가맹점 상세 정보</h2>
        </div>
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
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="integration">개발 연동 정보</TabsTrigger>
          <TabsTrigger value="alert">장애 알림 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="group">그룹</Label>
              {isEditing ? (
                <Select
                  value={merchantData.group}
                  onValueChange={(value) =>
                    setMerchantData({ ...merchantData, group: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="그룹 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="제휴사 그룹">제휴사 그룹</SelectItem>
                    <SelectItem value="일반 그룹">일반 그룹</SelectItem>
                    <SelectItem value="VIP 그룹">VIP 그룹</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input id="group" value={merchantData.group} disabled />
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-md font-medium mb-3">수수료 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositFee">입금수수료 (%)</Label>
                <Input
                  id="depositFee"
                  type="number"
                  step="0.01"
                  value={merchantData.depositFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      depositFee: Number.parseFloat(e.target.value),
                    })
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
                  value={merchantData.depositPerTransactionFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      depositPerTransactionFee: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withdrawalFee">출금수수료 (%)</Label>
                <Input
                  id="withdrawalFee"
                  type="number"
                  step="0.01"
                  value={merchantData.withdrawalFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      withdrawalFee: Number.parseFloat(e.target.value),
                    })
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
                  value={merchantData.withdrawalPerTransactionFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      withdrawalPerTransactionFee: Number.parseInt(
                        e.target.value,
                      ),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settlementFee">정산수수료 (%)</Label>
                <Input
                  id="settlementFee"
                  type="number"
                  step="0.01"
                  value={merchantData.settlementFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      settlementFee: Number.parseFloat(e.target.value),
                    })
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
                  value={merchantData.settlementPerTransactionFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      settlementPerTransactionFee: Number.parseInt(
                        e.target.value,
                      ),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foreignDepositFee">외화수수료 (%)</Label>
                <Input
                  id="foreignDepositFee"
                  type="number"
                  step="0.01"
                  value={merchantData.foreignDepositFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      foreignDepositFee: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foreignWithdrawalFee">외화송금수수료 (%)</Label>
                <Input
                  id="foreignWithdrawalFee"
                  type="number"
                  step="0.01"
                  value={merchantData.foreignWithdrawalFee.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      foreignWithdrawalFee: Number.parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2 max-w-[50%]">
                <Label htmlFor="status">상태</Label>
                {isEditing ? (
                  <Select
                    value={merchantData.status}
                    onValueChange={(value) =>
                      setMerchantData({ ...merchantData, status: value })
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
                  <Input id="status" value={merchantData.status} disabled />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-medium mb-3">에이전트 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent1">에이전트1 (%)</Label>
                <Input
                  id="agent1"
                  type="number"
                  value={merchantData.agent1.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      agent1: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent2">에이전트2 (%)</Label>
                <Input
                  id="agent2"
                  type="number"
                  value={merchantData.agent2.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      agent2: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent3">에이전트3 (%)</Label>
                <Input
                  id="agent3"
                  type="number"
                  value={merchantData.agent3.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      agent3: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent4">에이전트4 (%)</Label>
                <Input
                  id="agent4"
                  type="number"
                  value={merchantData.agent4.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      agent4: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent5">에이전트5 (%)</Label>
                <Input
                  id="agent5"
                  type="number"
                  value={merchantData.agent5.toString()}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setMerchantData({
                      ...merchantData,
                      agent5: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
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
              <h3 className="text-md font-medium mb-4">대시보드 로그인 설정</h3>

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
                  <Label htmlFor="dashboardPassword">대시보드 비밀번호</Label>
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
                        <span className="text-sm font-medium">OTP QR 코드</span>
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
                  <Label htmlFor="paymentFailure" className="cursor-pointer">
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
  );
}
