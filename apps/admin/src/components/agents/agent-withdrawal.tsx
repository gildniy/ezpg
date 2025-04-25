"use client";

import { DatePicker } from "@ezpg/ui";

const AgentWithdrawal = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{"에이전트 출금 관리"}</h1>

      <div className="mb-4">
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {"날짜"}:
        </label>
        <div className="flex items-center">
          <DatePicker defaultValue={new Date("2025-04-01")} />
        </div>
      </div>

      {/* Add more form elements as needed */}
    </div>
  );
};

export default AgentWithdrawal;
