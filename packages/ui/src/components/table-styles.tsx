"use client";

import React from "react";

// 테이블 스타일을 적용하는 함수
export function applyTableStyles() {
  // 페이지가 로드된 후 실행
  if (typeof window !== "undefined") {
    setTimeout(() => {
      // 모든 테이블 헤더 요소 선택
      const tableHeaders = document.querySelectorAll("table th");

      // 각 헤더에 인라인 스타일 적용
      tableHeaders.forEach((header) => {
        const element = header as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-height: 3rem !important;
          height: 3rem !important;
          display: table-cell !important;
          max-width: 200px !important;
        `;
      });

      // 모든 테이블 셀 요소 선택
      const tableCells = document.querySelectorAll("table td");

      // 각 셀에 인라인 스타일 적용
      tableCells.forEach((cell) => {
        const element = cell as HTMLElement;
        element.style.cssText = `
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          font-size: 0.875rem !important; /* 14px */
        `;
      });

      // 모든 테이블 요소 선택
      const tables = document.querySelectorAll("table");

      // 각 테이블에 인라인 스타일 적용
      tables.forEach((table) => {
        const element = table as HTMLElement;
        element.style.tableLayout = "fixed";
      });
    }, 100);
  }
}

// 테이블 스타일을 적용하는 컴포넌트
export function TableStylesApplier() {
  React.useEffect(() => {
    applyTableStyles();

    // 윈도우 리사이즈 이벤트에도 스타일 재적용
    window.addEventListener("resize", applyTableStyles);
    return () => {
      window.removeEventListener("resize", applyTableStyles);
    };
  }, []);

  return null;
}
