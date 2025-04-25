"use client";
import { useState, useEffect } from "react";

import { Button } from "@ezpg/ui";
import { Input } from "@ezpg/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ezpg/ui";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@ezpg/ui";

export function RegisterMerchantContent() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    merchantName: "",
    company: "",
    group: "",
    merchantId: "",
    telegramId: "",
    depositFee: "",
    depositPerTransactionFee: "", // 입금 건당 수수료 추가
    withdrawalFee: "", // 출금수수료(%) 추가
    withdrawalPerTransactionFee: "", // 출금 건당 수수료 추가
    settlementFee: "", // 정산수수료(%) 추가
    settlementPerTransactionFee: "", // 정산 건당 수수료 추가
    foreignCurrencyFee: "",
    foreignRemittanceFee: "",
    reserveAmount: "",
    cashReserveRatio: "", // 가맹점 현금 유지비율 추가
    status: "active",
    // 외화송금은행 정보
    foreignBank: "",
    accountNumber: "",
    accountHolder: "",
    // 가상계좌
    virtualAccountCount: "10",
    minDepositAmount: "10000",
    // 출금
    maxWithdrawalPerTransaction: "1000000",
    maxWithdrawalPerDay: "5000000",
    // 입금
    maxDepositAmount: "10000000", // 1회 최대 입금 가능 금액
    maxDepositPerDay: "30000000", // 1일 최대 입금 가능 금액 추가
    // 콜백 IP
    ipAddress: "",
    callbackUrl: "", // 콜백 URL 추가
  });

  // 에이전트 배분율 설정
  const [agents, setAgents] = useState([{ name: "", distributionRate: "" }]);

  // 가맹점 ID가 변경될 때마다 비밀번호도 동일하게 설정
  const [password, setPassword] = useState("");

  useEffect(() => {
    setPassword(formData.merchantId);
  }, [formData.merchantId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgentChange = (index: number, field: string, value: string) => {
    const newAgents = [...agents];
    newAgents[index] = { ...newAgents[index], [field]: value };
    setAgents(newAgents);
  };

  const addAgent = () => {
    setAgents([...agents, { name: "", distributionRate: "" }]);
  };

  const removeAgent = (index: number) => {
    if (agents.length > 1) {
      const newAgents = [...agents];
      newAgents.splice(index, 1);
      setAgents(newAgents);
    }
  };

  // IP 주소 검증 함수
  const validateIpAddress = (ip: string) => {
    // 기본적인 IP 주소 형식 검증 (더 엄격한 검증이 필요하면 정규식 사용)
    const parts = ip.split(".");
    if (parts.length !== 4) return false;

    for (const part of parts) {
      const num = Number.parseInt(part, 10);
      if (isNaN(num) || num < 0 || num > 255) return false;
    }

    return true;
  };

  // URL 검증 함수
  const validateUrl = (url: string) => {
    if (!url) return true; // 빈 값은 허용
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = () => {
    // IP 주소 검증
    if (formData.ipAddress && !validateIpAddress(formData.ipAddress)) {
      alert("유효한 IP 주소를 입력해주세요. (예: 192.168.0.1)");
      return;
    }

    // URL 검증
    if (formData.callbackUrl && !validateUrl(formData.callbackUrl)) {
      alert("유효한 URL을 입력해주세요. (예: https://example.com/callback)");
      return;
    }

    // 여기에 폼 제출 로직 구현
    console.log("Form submitted:", { ...formData, password, agents });
    // 성공 시 전체 가맹점 페이지로 이동
    router.push("/merchants");
  };

  const handleCancel = () => {
    router.push("/merchants");
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">{"가맹점 등록"}</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 섹션 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400">
              <span className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md">
                기본 정보
              </span>
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchantName">
              {"가맹점명"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="merchantName"
              placeholder={"가맹점명을 입력하세요"}
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.merchantName}
              onChange={(e) =>
                handleInputChange("merchantName", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">
              {"회사명"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              placeholder="회사명 입력"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchantId">
              가맹점 ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="merchantId"
              type="text"
              placeholder="가맹점 ID 입력"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.merchantId}
              onChange={(e) => handleInputChange("merchantId", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              가맹점 비밀번호는 입력하신 가맹점 ID와 동일하게 초기 설정됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegramId">
              텔레그램 아이디 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telegramId"
              placeholder="텔레그램 아이디 입력"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.telegramId}
              onChange={(e) => handleInputChange("telegramId", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">
              {"그룹"} <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => handleSelectChange("group", value)}
              required
            >
              <SelectTrigger className="border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <SelectValue placeholder={"선택하세요"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group1">그룹1</SelectItem>
                <SelectItem value="group2">그룹2</SelectItem>
                <SelectItem value="group3">그룹3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              {"상태"} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger
                id="status"
                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              >
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">사용</SelectItem>
                <SelectItem value="inactive">중지</SelectItem>
                <SelectItem value="pending">대기</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 수수료 정보 섹션 */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-green-300 dark:border-green-700 text-green-600 dark:text-green-400">
              <span className="bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-md">
                수수료 정보
              </span>
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositFee">
              {"입금 수수료"} (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="depositFee"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.depositFee}
              onChange={(e) => handleInputChange("depositFee", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositPerTransactionFee">
              입금 건당 수수료 (원) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="depositPerTransactionFee"
              type="number"
              placeholder="0"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.depositPerTransactionFee}
              onChange={(e) =>
                handleInputChange("depositPerTransactionFee", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalFee">
              출금수수료 (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="withdrawalFee"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.withdrawalFee}
              onChange={(e) =>
                handleInputChange("withdrawalFee", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalPerTransactionFee">
              출금 건당 수수료 (원) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="withdrawalPerTransactionFee"
              type="number"
              placeholder="0"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.withdrawalPerTransactionFee}
              onChange={(e) =>
                handleInputChange("withdrawalPerTransactionFee", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settlementFee">
              정산수수료 (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="settlementFee"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.settlementFee}
              onChange={(e) =>
                handleInputChange("settlementFee", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settlementPerTransactionFee">
              정산 건당 수수료 (원) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="settlementPerTransactionFee"
              type="number"
              placeholder="0"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.settlementPerTransactionFee}
              onChange={(e) =>
                handleInputChange("settlementPerTransactionFee", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreignCurrencyFee">
              {"외화 수수료"} (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="foreignCurrencyFee"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.foreignCurrencyFee}
              onChange={(e) =>
                handleInputChange("foreignCurrencyFee", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreignRemittanceFee">
              외화송금수수료 (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="foreignRemittanceFee"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.foreignRemittanceFee}
              onChange={(e) =>
                handleInputChange("foreignRemittanceFee", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserveAmount">
              {"예비 금액"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reserveAmount"
              type="number"
              placeholder="0"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.reserveAmount}
              onChange={(e) =>
                handleInputChange("reserveAmount", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashReserveRatio">
              가맹점 현금 유지비율 (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cashReserveRatio"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.cashReserveRatio}
              onChange={(e) =>
                handleInputChange("cashReserveRatio", e.target.value)
              }
              required
            />
          </div>

          {/* 외화송금은행 정보 섹션 */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400">
              <span className="bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-md">
                외화송금은행 정보
              </span>
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreignBank">
              은행 선택 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.foreignBank}
              onValueChange={(value) =>
                handleSelectChange("foreignBank", value)
              }
            >
              <SelectTrigger
                id="foreignBank"
                className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              >
                <SelectValue placeholder="은행 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kb">KB국민은행</SelectItem>
                <SelectItem value="shinhan">신한은행</SelectItem>
                <SelectItem value="woori">우리은행</SelectItem>
                <SelectItem value="hana">하나은행</SelectItem>
                <SelectItem value="nh">농협은행</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              계좌번호 입력 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              placeholder="계좌번호 입력 (- 없이 입력)"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.accountNumber}
              onChange={(e) =>
                handleInputChange("accountNumber", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="accountHolder">
              예금주명 입력 (송금시 송금인 정보){" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountHolder"
              placeholder="예금주명 입력"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.accountHolder}
              onChange={(e) =>
                handleInputChange("accountHolder", e.target.value)
              }
              required
            />
          </div>

          {/* 에이전트 배분율 설정 섹션 */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400">
              <span className="bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-md">
                에이전트 배분율 설정
              </span>
            </h3>
          </div>

          {agents.map((agent, index) => (
            <div
              key={index}
              className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <div className="space-y-2">
                <Label htmlFor={`agentName-${index}`}>
                  에이전트 등록 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={agent.name}
                  onValueChange={(value) =>
                    handleAgentChange(index, "name", value)
                  }
                >
                  <SelectTrigger
                    id={`agentName-${index}`}
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <SelectValue placeholder="에이전트 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent1">에이전트 1</SelectItem>
                    <SelectItem value="agent2">에이전트 2</SelectItem>
                    <SelectItem value="agent3">에이전트 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex-1">
                  <Label htmlFor={`distributionRate-${index}`}>
                    에이전트 배분율 등록 (%){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`distributionRate-${index}`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    value={agent.distributionRate}
                    onChange={(e) =>
                      handleAgentChange(
                        index,
                        "distributionRate",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-2 mb-0.5"
                  onClick={() => removeAgent(index)}
                  disabled={agents.length <= 1}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}

          <div className="col-span-1 md:col-span-2">
            <Button
              type="button"
              size="sm"
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
              onClick={addAgent}
            >
              <Plus className="h-4 w-4 mr-2" /> 에이전트 추가
            </Button>
          </div>

          {/* 가상계좌 섹션 */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-red-300 dark:border-red-700 text-red-600 dark:text-red-400">
              <span className="bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-md">
                가상계좌
              </span>
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="virtualAccountCount">
              가상계좌 발급좌수 설정 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="virtualAccountCount"
              type="number"
              placeholder="10"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.virtualAccountCount}
              onChange={(e) =>
                handleInputChange("virtualAccountCount", e.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minDepositAmount">
              가상계좌 입금 가능 금액 설정{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="minDepositAmount"
              type="number"
              placeholder="10000"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.minDepositAmount}
              onChange={(e) =>
                handleInputChange("minDepositAmount", e.target.value)
              }
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              최소 입금 가능 금액을 원 단위로 입력하세요.
            </p>
          </div>

          {/* 입금 및 출금 섹션 */}
          <div className="col-span-1 md:col-span-2 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 입금 섹션 */}
            <div>
              <h3 className="text-md font-medium mb-4 pb-2 border-b border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400">
                <span className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md">
                  입금
                </span>
              </h3>

              <div className="space-y-2">
                <Label htmlFor="maxDepositAmount">
                  1회 최대 입금 가능 금액{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxDepositAmount"
                  type="number"
                  placeholder="10000000"
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.maxDepositAmount}
                  onChange={(e) =>
                    handleInputChange("maxDepositAmount", e.target.value)
                  }
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  1회 입금 시 최대 금액을 원 단위로 입력하세요.
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="maxDepositPerDay">
                  1일 최대 입금 가능 금액{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxDepositPerDay"
                  type="number"
                  placeholder="30000000"
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.maxDepositPerDay}
                  onChange={(e) =>
                    handleInputChange("maxDepositPerDay", e.target.value)
                  }
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  1일 입금 가능 최대 금액을 원 단위로 입력하세요.
                </p>
              </div>
            </div>

            {/* 출금 섹션 */}
            <div>
              <h3 className="text-md font-medium mb-4 pb-2 border-b border-teal-300 dark:border-teal-700 text-teal-600 dark:text-teal-400">
                <span className="bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-md">
                  출금
                </span>
              </h3>

              <div className="space-y-2">
                <Label htmlFor="maxWithdrawalPerTransaction">
                  1회 출금 최대 금액 설정{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxWithdrawalPerTransaction"
                  type="number"
                  placeholder="1000000"
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.maxWithdrawalPerTransaction}
                  onChange={(e) =>
                    handleInputChange(
                      "maxWithdrawalPerTransaction",
                      e.target.value,
                    )
                  }
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  1회 출금 시 최대 금액을 원 단위로 입력하세요.
                </p>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="maxWithdrawalPerDay">
                  1일 출금 가능 금액 설정{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxWithdrawalPerDay"
                  type="number"
                  placeholder="5000000"
                  className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.maxWithdrawalPerDay}
                  onChange={(e) =>
                    handleInputChange("maxWithdrawalPerDay", e.target.value)
                  }
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  1일 출금 가능 최대 금액을 원 단위로 입력하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 가맹점등록(콜백) IP 섹션 */}
          <div className="col-span-1 md:col-span-2 mt-4">
            <h3 className="text-md font-medium mb-4 pb-2 border-b border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400">
              <span className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-md">
                가맹점등록(콜백) 정보
              </span>
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipAddress" className="mb-2 block">
              콜백 IP 주소 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ipAddress"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.ipAddress}
              onChange={(e) => handleInputChange("ipAddress", e.target.value)}
              placeholder="예: 192.168.0.1"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              가맹점 콜백 IP 주소를 입력하세요. (예: 192.168.0.1)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="callbackUrl" className="mb-2 block">
              콜백 URL
            </Label>
            <Input
              id="callbackUrl"
              className="border-gray-200 dark:border-gray-700 dark:bg-gray-800"
              value={formData.callbackUrl}
              onChange={(e) => handleInputChange("callbackUrl", e.target.value)}
              placeholder="예: https://example.com/callback"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              가맹점 콜백 URL을 입력하세요. (선택사항)
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="col-span-1 md:col-span-2 flex justify-center gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-8"
            >
              {"취소"}
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              {"확인"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
