"use client";

import { useState } from "react";
import { Move, Eye, EyeOff, RotateCcw, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ezpg/ui";
import { Button } from "@ezpg/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ezpg/ui";
import { Switch } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { useLanguage } from "@ezpg/hooks";
import { useTheme } from "@ezpg/ui";
import { RadioGroup, RadioGroupItem } from "@ezpg/ui";
import { Slider } from "@ezpg/ui";
import { useToast } from "@ezpg/ui";

// 위젯 타입 정의
export type WidgetType = {
  id: string;
  name: string;
  nameEn?: string;
  visible: boolean;
  order: number;
};

// 커스터마이징 설정 타입 정의
export type DashboardCustomization = {
  widgets: WidgetType[];
  colorScheme: string;
  refreshInterval: number;
  compactMode: boolean;
};

// 기본 위젯 목록 (공지사항 위젯 추가)
const defaultWidgets: WidgetType[] = [
  {
    id: "stats",
    name: "통계 카드",
    nameEn: "Statistics Cards",
    visible: true,
    order: 1,
  },
  {
    id: "transactions",
    name: "거래 추이 차트",
    nameEn: "Transaction Trend Chart",
    visible: true,
    order: 2,
  },
  {
    id: "hourlyStats",
    name: "시간대별 통계",
    nameEn: "Hourly Statistics",
    visible: true,
    order: 3,
  },
  {
    id: "merchantPerformance",
    name: "가맹점 성과",
    nameEn: "Merchant Performance",
    visible: true,
    order: 4,
  },
  {
    id: "recentTransactions",
    name: "최근 거래 내역",
    nameEn: "Recent Transactions",
    visible: true,
    order: 5,
  },
  { id: "alerts", name: "알림", nameEn: "Alerts", visible: true, order: 6 },
  {
    id: "notices",
    name: "공지사항",
    nameEn: "Notices",
    visible: true,
    order: 7,
  },
  {
    id: "adminActivities",
    name: "관리자 활동",
    nameEn: "Admin Activities",
    visible: false,
    order: 8,
  },
];

// 색상 스키마 옵션
const colorSchemes = [
  {
    id: "default",
    name: "기본 테마",
    nameEn: "Default Theme",
    color: "#3b82f6",
  },
  { id: "green", name: "그린 테마", nameEn: "Green Theme", color: "#10b981" },
  { id: "purple", name: "퍼플 테마", nameEn: "Purple Theme", color: "#8b5cf6" },
  {
    id: "orange",
    name: "오렌지 테마",
    nameEn: "Orange Theme",
    color: "#f97316",
  },
  { id: "red", name: "레드 테마", nameEn: "Red Theme", color: "#ef4444" },
];

interface DashboardCustomizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: DashboardCustomization;
  onSave: (customization: DashboardCustomization) => void;
}

export function DashboardCustomizeModal({
  open,
  onOpenChange,
  customization,
  onSave,
}: DashboardCustomizeModalProps) {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [editedCustomization, setEditedCustomization] =
    useState<DashboardCustomization>({ ...customization });
  const [activeTab, setActiveTab] = useState("widgets");

  // 위젯 가시성 토글
  const toggleWidgetVisibility = (widgetId: string) => {
    setEditedCustomization((prev) => ({
      ...prev,
      widgets: prev.widgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, visible: !widget.visible }
          : widget,
      ),
    }));
  };

  // 위젯 순서 변경 (위로)
  const moveWidgetUp = (widgetId: string) => {
    setEditedCustomization((prev) => {
      const widgets = [...prev.widgets];
      const index = widgets.findIndex((w) => w.id === widgetId);
      if (index > 0) {
        const widget = widgets[index];
        const prevWidget = widgets[index - 1];
        widgets[index] = { ...widget, order: prevWidget.order };
        widgets[index - 1] = { ...prevWidget, order: widget.order };
        widgets.sort((a, b) => a.order - b.order);
      }
      return { ...prev, widgets };
    });
  };

  // 위젯 순서 변경 (아래로)
  const moveWidgetDown = (widgetId: string) => {
    setEditedCustomization((prev) => {
      const widgets = [...prev.widgets];
      const index = widgets.findIndex((w) => w.id === widgetId);
      if (index < widgets.length - 1) {
        const widget = widgets[index];
        const nextWidget = widgets[index + 1];
        widgets[index] = { ...widget, order: nextWidget.order };
        widgets[index + 1] = { ...nextWidget, order: widget.order };
        widgets.sort((a, b) => a.order - b.order);
      }
      return { ...prev, widgets };
    });
  };

  // 색상 스키마 변경
  const changeColorScheme = (schemeId: string) => {
    setEditedCustomization((prev) => ({
      ...prev,
      colorScheme: schemeId,
    }));
  };

  // 새로고침 간격 변경
  const changeRefreshInterval = (value: number[]) => {
    setEditedCustomization((prev) => ({
      ...prev,
      refreshInterval: value[0],
    }));
  };

  // 컴팩트 모드 토글
  const toggleCompactMode = () => {
    setEditedCustomization((prev) => ({
      ...prev,
      compactMode: !prev.compactMode,
    }));
  };

  // 기본 설정으로 초기화
  const resetToDefaults = () => {
    setEditedCustomization({
      widgets: defaultWidgets,
      colorScheme: "default",
      refreshInterval: 0,
      compactMode: false,
    });
    toast({
      title: language === "ko" ? "초기화 완료" : "Reset Complete",
      description:
        language === "ko"
          ? "대시보드 설정이 기본값으로 초기화되었습니다."
          : "Dashboard settings have been reset to default values.",
    });
  };

  // 설정 저장
  const saveCustomization = () => {
    onSave(editedCustomization);
    toast({
      title: language === "ko" ? "설정 저장 완료" : "Settings Saved",
      description:
        language === "ko"
          ? "대시보드 커스터마이징 설정이 저장되었습니다."
          : "Dashboard customization settings have been saved.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-2">
          <DialogTitle>{t("dashboardCustomization")}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="widgets">{t("widgets")}</TabsTrigger>
            <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
            <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1 pr-2">
            <TabsContent value="widgets" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">
                  {language === "ko"
                    ? "위젯 가시성 및 순서"
                    : "Widget Visibility and Order"}
                </h3>
                <div className="space-y-2">
                  {editedCustomization.widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                          title={
                            widget.visible
                              ? language === "ko"
                                ? "숨기기"
                                : "Hide"
                              : language === "ko"
                                ? "표시하기"
                                : "Show"
                          }
                        >
                          {widget.visible ? (
                            <Eye className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </Button>
                        <span
                          className={`text-sm ${!widget.visible ? "text-gray-400" : ""}`}
                        >
                          {language === "ko"
                            ? widget.name
                            : widget.nameEn || widget.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveWidgetUp(widget.id)}
                          disabled={widget.order === 1}
                          title={language === "ko" ? "위로 이동" : "Move Up"}
                        >
                          <Move className="h-4 w-4 rotate-270" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveWidgetDown(widget.id)}
                          disabled={
                            widget.order === editedCustomization.widgets.length
                          }
                          title={
                            language === "ko" ? "아래로 이동" : "Move Down"
                          }
                        >
                          <Move className="h-4 w-4 rotate-90" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    {language === "ko" ? "색상 스키마" : "Color Scheme"}
                  </h3>
                  <RadioGroup
                    value={editedCustomization.colorScheme}
                    onValueChange={changeColorScheme}
                    className="grid grid-cols-2 gap-2"
                  >
                    {colorSchemes.map((scheme) => (
                      <div
                        key={scheme.id}
                        className={`flex items-center space-x-2 p-2 rounded-md border ${
                          editedCustomization.colorScheme === scheme.id
                            ? "border-blue-500 dark:border-blue-400"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <RadioGroupItem
                          value={scheme.id}
                          id={`color-${scheme.id}`}
                        />
                        <Label
                          htmlFor={`color-${scheme.id}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scheme.color }}
                            aria-hidden="true"
                          />
                          <span>
                            {language === "ko"
                              ? scheme.name
                              : scheme.nameEn || scheme.name}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">
                    {language === "ko" ? "컴팩트 모드" : "Compact Mode"}
                  </h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-mode">
                      {language === "ko"
                        ? "컴팩트 모드 사용"
                        : "Use Compact Mode"}
                    </Label>
                    <Switch
                      id="compact-mode"
                      checked={editedCustomization.compactMode}
                      onCheckedChange={toggleCompactMode}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === "ko"
                      ? "컴팩트 모드는 대시보드 요소들을 더 조밀하게 표시합니다."
                      : "Compact mode displays dashboard elements more densely."}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">
                    {language === "ko" ? "자동 새로고침" : "Auto Refresh"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>
                          {language === "ko"
                            ? "새로고침 간격"
                            : "Refresh Interval"}
                        </Label>
                        <span className="text-sm">
                          {editedCustomization.refreshInterval === 0
                            ? language === "ko"
                              ? "비활성화"
                              : "Disabled"
                            : `${editedCustomization.refreshInterval}${language === "ko" ? "초" : " seconds"}`}
                        </span>
                      </div>
                      <Slider
                        value={[editedCustomization.refreshInterval]}
                        onValueChange={changeRefreshInterval}
                        max={60}
                        step={10}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {language === "ko"
                          ? "0으로 설정하면 자동 새로고침이 비활성화됩니다."
                          : "Set to 0 to disable auto refresh."}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">
                    {language === "ko" ? "설정 초기화" : "Reset Settings"}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={resetToDefaults}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {language === "ko"
                      ? "기본값으로 재설정"
                      : "Reset to Defaults"}
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === "ko"
                      ? "모든 대시보드 설정을 기본값으로 되돌립니다."
                      : "Restore all dashboard settings to their default values."}
                  </p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === "ko" ? "취소" : "Cancel"}
          </Button>
          <Button onClick={saveCustomization}>
            <Save className="h-4 w-4 mr-2" />
            {language === "ko" ? "변경사항 저장" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
