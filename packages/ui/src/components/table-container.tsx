"use client";

import React from "react";

interface TableContainerProps {
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}

export function TableContainer({
  children,
  minWidth = "100%",
  className = "",
}: TableContainerProps) {
  // 테이블 헤더에 직접 스타일 적용
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const container = document.querySelector(
        `.table-container-${Math.random().toString(36).substring(7)}`,
      );
      if (container) {
        const headers = container.querySelectorAll("th");
        headers.forEach((header) => {
          const element = header as HTMLElement;
          element.style.whiteSpace = "normal";
          element.style.overflow = "visible";
          element.style.textOverflow = "clip";
          element.style.minHeight = "3rem";
          element.style.height = "auto";
        });

        // 테이블 셀에도 스타일 적용
        const cells = container.querySelectorAll("td");
        cells.forEach((cell) => {
          const element = cell as HTMLElement;
          element.style.whiteSpace = "normal";
          element.style.overflow = "visible";
          element.style.textOverflow = "clip";
        });
      }
    }
  }, []);

  const uniqueClass = `table-container-${Math.random().toString(36).substring(7)}`;

  return (
    <div
      className={`overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}
    >
      <div
        style={{ minWidth, width: "100%" }}
        className={`table-container ${uniqueClass}`}
      >
        {children}
      </div>
    </div>
  );
}
