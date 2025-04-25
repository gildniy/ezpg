import type React from "react";

interface FixedTableProps {
  children: React.ReactNode;
  className?: string;
}

export function FixedTable({ children, className = "" }: FixedTableProps) {
  return (
    <table
      className={`w-full text-sm fixed-table ${className}`}
      style={{ tableLayout: "auto" }}
    >
      {children}
    </table>
  );
}

export function FixedTableHead({ children, className = "" }: FixedTableProps) {
  return <thead className={`fixed-table-head ${className}`}>{children}</thead>;
}

export function FixedTableHeader({
  children,
  className = "",
  width,
}: FixedTableProps & { width?: string }) {
  return (
    <th
      className={`py-3 px-4 text-left font-medium fixed-table-header ${className}`}
      style={{
        width,
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "clip",
        minHeight: "3rem",
        height: "auto",
        lineHeight: "1.25rem",
      }}
    >
      {children}
    </th>
  );
}

export function FixedTableBody({ children, className = "" }: FixedTableProps) {
  return <tbody className={`fixed-table-body ${className}`}>{children}</tbody>;
}

export function FixedTableRow({ children, className = "" }: FixedTableProps) {
  return (
    <tr
      className={`border-t border-gray-200 dark:border-gray-700 fixed-table-row ${className}`}
    >
      {children}
    </tr>
  );
}

export function FixedTableCell({ children, className = "" }: FixedTableProps) {
  return (
    <td
      className={`py-3 px-4 fixed-table-cell ${className}`}
      style={{
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "clip",
      }}
    >
      {children}
    </td>
  );
}
