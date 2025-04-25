"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ezpg/ui";
import { Button } from "@ezpg/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ezpg/ui";
import { Switch } from "@ezpg/ui";
import { Label } from "@ezpg/ui";
import { Badge } from "@ezpg/ui";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { useToast } from "@ezpg/ui";

export interface WidgetType {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

export interface DashboardCustomization {
  widgets: WidgetType[];
  colorScheme: "default" | "blue" | "green" | "purple";
  refreshInterval: number; // seconds, 0 = disabled
  compactMode: boolean;
}

interface DashboardCustomizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: DashboardCustomization;
  onSave: (customization: DashboardCustomization) => void;
}

const colorSchemes = [
  { id: "default", name: "기본", color: "bg-blue-500" },
  { id: "blue", name: "블루", color: "bg-blue-600" },
  { id: "green", name: "그린", color: "bg-green-500" },
  { id: "purple", name: "퍼플", color: "bg-purple-500" },
];

const refreshIntervals = [
  { value: 0, label: "비활성화" },
  { value: 30, label: "30초" },
  { value: 60, label: "1분" },
  { value: 300, label: "5분" },
  { value: 600, label: "10분" },
  { value: 1800, label: "30분" },
];

export function DashboardCustomizeModal({
  open,
  onOpenChange,
  customization,
  onSave,
}: DashboardCustomizeModalProps) {
  const { toast } = useToast();
  const [editedCustomization, setEditedCustomization] =
    useState<DashboardCustomization>(customization);

  useEffect(() => {
    setEditedCustomization(customization);
  }, [customization]);

  const moveWidget = (widgetId: string, direction: "up" | "down") => {
    const widgets = [...editedCustomization.widgets];
    const currentIndex = widgets.findIndex((w) => w.id === widgetId);

    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= widgets.length) return;

    // Swap orders
    const temp = widgets[currentIndex].order;
    widgets[currentIndex].order = widgets[newIndex].order;
    widgets[newIndex].order = temp;

    // Sort by order
    widgets.sort((a, b) => a.order - b.order);

    setEditedCustomization({
      ...editedCustomization,
      widgets,
    });
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const widgets = editedCustomization.widgets.map((widget) =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget,
    );

    // Sort by order
    widgets.sort((a, b) => a.order - b.order);

    setEditedCustomization({
      ...editedCustomization,
      widgets,
    });
  };

  const resetToDefaults = () => {
    const defaultCustomization: DashboardCustomization = {
      widgets: [
        { id: "stats", name: "통계 카드", visible: true, order: 1 },
        { id: "transactions", name: "거래 추이 차트", visible: true, order: 2 },
        { id: "hourlyStats", name: "시간대별 통계", visible: true, order: 3 },
        {
          id: "recentTransactions",
          name: "최근 거래 내역",
          visible: true,
          order: 4,
        },
        { id: "alerts", name: "알림", visible: true, order: 5 },
        { id: "notices", name: "공지사항", visible: true, order: 6 },
        {
          id: "adminActivities",
          name: "관리자 활동",
          visible: false,
          order: 7,
        },
      ],
      colorScheme: "default",
      refreshInterval: 0,
      compactMode: true,
    };

    setEditedCustomization(defaultCustomization);
    toast({
      title: "설정 초기화",
      description: "모든 설정이 기본값으로 초기화되었습니다.",
    });
  };

  const handleSave = () => {
    onSave(editedCustomization);
    onOpenChange(false);
    toast({
      title: "설정 저장 완료",
      description: "대시보드 커스터마이징이 저장되었습니다.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{"대시보드 커스터마이징"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="widgets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="widgets">{"위젯"}</TabsTrigger>
            <TabsTrigger value="appearance">{"외관"}</TabsTrigger>
            <TabsTrigger value="settings">{"설정"}</TabsTrigger>
          </TabsList>

          <TabsContent value="widgets" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">
                {"위젯 표시 및 순서"}
              </h3>
              <div className="space-y-2">
                {editedCustomization.widgets
                  .sort((a, b) => a.order - b.order)
                  .map((widget, index) => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveWidget(widget.id, "up")}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveWidget(widget.id, "down")}
                            disabled={
                              index === editedCustomization.widgets.length - 1
                            }
                            className="h-6 w-6 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{widget.name}</div>
                          <div className="text-sm text-gray-500">
                            순서: {widget.order}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={widget.visible ? "default" : "secondary"}
                        >
                          {widget.visible ? "표시" : "숨김"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                        >
                          {widget.visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">{"색상 테마"}</h3>
              <div className="grid grid-cols-2 gap-3">
                {colorSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      editedCustomization.colorScheme === scheme.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setEditedCustomization({
                        ...editedCustomization,
                        colorScheme: scheme.id as any,
                      })
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full ${scheme.color}`} />
                      <span className="font-medium">{scheme.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Switch
                  id="compact-mode"
                  checked={editedCustomization.compactMode}
                  onCheckedChange={(checked) =>
                    setEditedCustomization({
                      ...editedCustomization,
                      compactMode: checked,
                    })
                  }
                />
                <Label htmlFor="compact-mode">{"컴팩트 모드 사용"}</Label>
              </div>
              <p className="text-sm text-gray-500">
                {"컴팩트 모드에서는 위젯들이 더 조밀하게 배치됩니다."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">{"자동 새로고침"}</h3>
              <div className="space-y-3">
                <div>
                  <Label>{"새로고침 간격"}</Label>
                  <div className="mt-2">
                    <span className="text-sm font-medium">
                      {editedCustomization.refreshInterval === 0
                        ? "비활성화"
                        : `${editedCustomization.refreshInterval}초`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {refreshIntervals.map((interval) => (
                      <Button
                        key={interval.value}
                        variant={
                          editedCustomization.refreshInterval === interval.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setEditedCustomization({
                            ...editedCustomization,
                            refreshInterval: interval.value,
                          })
                        }
                      >
                        {interval.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {
                    "자동 새로고침을 설정하면 지정된 간격으로 대시보드 데이터가 업데이트됩니다."
                  }
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">{"설정 초기화"}</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  className="w-full"
                >
                  {"기본값으로 초기화"}
                </Button>
                <p className="text-sm text-gray-500">
                  {"모든 커스터마이징 설정을 기본값으로 되돌립니다."}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {"취소"}
          </Button>
          <Button onClick={handleSave}>{"변경사항 저장"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
