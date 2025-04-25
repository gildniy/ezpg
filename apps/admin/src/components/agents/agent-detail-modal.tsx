"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { X, Copy, Save, RefreshCw } from "lucide-react";
import { Textarea } from "@ezpg/ui";
import { useAgents } from "@/hooks/use-agents";
import { AgentResponseDto } from "@ezpg/api-client";
import Image from "next/image";
import { AdminAgentsApi } from "@ezpg/api-client";
import apiClient from "@ezpg/api-client/src/apiClient";
import { AdminUserManagementApi } from "@ezpg/api-client";

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentData: AgentResponseDto;
  onAgentUpdate?: (agent: AgentResponseDto) => void;
}

export function AgentDetailModal({
  isOpen,
  onClose,
  agentId,
  agentData: initialAgentData,
  onAgentUpdate,
}: AgentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [otpEnabled, setOtpEnabled] = useState(true);
  const prevOtpEnabled = useRef(otpEnabled);

  // Use the useAgents hook only for update
  const { updateAgent } = useAgents();
  const [agentData, setAgentData] =
    useState<AgentResponseDto>(initialAgentData);

  // Create agents API instance using the apiClient
  const agentsApi = new AdminAgentsApi(undefined, undefined, apiClient);
  const usersApi = new AdminUserManagementApi(undefined, undefined, apiClient);

  useEffect(() => {
    setAgentData(initialAgentData);
  }, [initialAgentData]);

  const [alertSettings, setAlertSettings] = useState({
    telegramId: agentId === "agent1" ? "@agent1_alert" : "@agent2_alert",
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

  // Function to reset TFA and update QR code
  const handleTfaReset = useCallback(async () => {
    try {
      const response = await agentsApi.resetTfa(agentId);
      const data = response.data;
      setAgentData((prev) =>
        prev
          ? {
              ...prev,
              tfaQrCodeBase64: data.tfaQrCodeBase64,
              // Optionally: tfaSecret: data.tfaSecret,
            }
          : prev,
      );
      alert("OTP 키가 재생성되었습니다.");
    } catch (err) {
      alert("OTP 키 재생성에 실패했습니다.");
    }
  }, [agentId, agentsApi]);

  // Effect: When OTP is enabled (from disabled), generate QR code
  useEffect(() => {
    if (isEditing && otpEnabled && !prevOtpEnabled.current) {
      handleTfaReset();
    }
    // When disabling, call API to disable TFA and clear QR code
    if (isEditing && !otpEnabled && prevOtpEnabled.current) {
      const disable = async () => {
        try {
          // agentData.id is the agent's numeric id, but we need the user id (username or user_id)
          // Assuming agentData has a userId or username property, otherwise adjust as needed
          await usersApi.disableTfa(agentId);
          setAgentData((prev) =>
            prev
              ? {
                  ...prev,
                  tfaQrCodeBase64: undefined,
                }
              : prev,
          );
        } catch (err) {
          alert("OTP 비활성화에 실패했습니다.");
        }
      };
      disable();
    }
    prevOtpEnabled.current = otpEnabled;
  }, [otpEnabled, isEditing, handleTfaReset, agentId, usersApi]);

  if (!isOpen) return null;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!agentData) return;
    const updated = await updateAgent(agentId, agentData);
    if (updated) {
      setAgentData({
        ...updated,
        username: updated.agentId,
      } as AgentResponseDto);
      if (onAgentUpdate) onAgentUpdate(updated);
    }
    setIsEditing(false);
    alert("에이전트 정보가 성공적으로 저장되었습니다.");
  };

  const handleCancelClick = () => {
    // 편집 취소
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium">에이전트 상세 정보</h2>
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
              <TabsTrigger value="alert">장애 알림 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">에이전트명</Label>
                  <Input
                    id="name"
                    value={agentData?.agentName}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, agentName: e.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    value={agentData?.email}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, email: e.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={agentData?.phone}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, phone: e.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">상태</Label>
                  {isEditing ? (
                    <Select
                      value={agentData?.status}
                      onValueChange={(value) =>
                        setAgentData((prev) =>
                          prev ? { ...prev, status: value } : prev,
                        )
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
                    <Input id="status" value={agentData?.status} disabled />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">잔액</Label>
                  <Input
                    id="balance"
                    value={agentData?.balance}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, balance: e.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission">수수료</Label>
                  <Input
                    id="commission"
                    value={agentData?.commission}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, commission: e.target.value } : prev,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createdAt">등록일</Label>
                  <Input id="createdAt" value={agentData?.createdAt} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updatedAt">수정일</Label>
                  <Input id="updatedAt" value={agentData?.updatedAt} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createdBy">등록자</Label>
                  <Input id="createdBy" value={agentData?.createdBy} disabled />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mid">에이전트 MID</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        agentData?.mid && copyToClipboard(agentData.mid)
                      }
                      className="h-8 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      복사
                    </Button>
                  </div>
                  <Input
                    id="mid"
                    value={agentData?.mid}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, mid: e.target.value } : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="mkey">에이전트 MKEY</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        agentData?.mkey && copyToClipboard(agentData.mkey)
                      }
                      className="h-8 text-xs"
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      복사
                    </Button>
                  </div>
                  <Input
                    id="mkey"
                    value={agentData?.mkey}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, mkey: e.target.value } : prev,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callbackUrl">콜백 URL</Label>
                  <Input
                    id="callbackUrl"
                    value={agentData?.callbackUrl}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setAgentData((prev) =>
                        prev ? { ...prev, callbackUrl: e.target.value } : prev,
                      )
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
                        value={agentData?.dashboardId}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setAgentData((prev) =>
                            prev
                              ? { ...prev, dashboardId: e.target.value }
                              : prev,
                          )
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
                        value={agentData?.dashboardPassword}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setAgentData((prev) =>
                            prev
                              ? { ...prev, dashboardPassword: e.target.value }
                              : prev,
                          )
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
                                onClick={handleTfaReset}
                                className="h-8 text-xs"
                              >
                                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                재생성
                              </Button>
                            )}
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-4 rounded-md flex items-center justify-center">
                            {agentData?.tfaQrCodeBase64 ? (
                              <Image
                                src={`data:image/png;base64,${agentData.tfaQrCodeBase64}`}
                                alt="OTP QR 코드"
                                width={128}
                                height={128}
                                unoptimized
                                className="w-40 h-40 object-contain"
                              />
                            ) : (
                              <div className="w-40 h-40 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                                QR 코드 이미지 없음
                              </div>
                            )}
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
