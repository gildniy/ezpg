"use client";
import { X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface SearchModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  fields: {
    label: string;
    type: "select" | "input";
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
}

export function SearchModal({
  title,
  isOpen,
  onClose,
  fields,
}: SearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <span className="mr-2">≡</span>
            {title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-[100px_1fr] items-center gap-4"
            >
              <label className="text-sm">{field.label}</label>
              {field.type === "select" ? (
                <Select>
                  <SelectTrigger className="border-gray-700 bg-gray-700">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={field.placeholder}
                  className="border-gray-700 bg-gray-700"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8">
            초기화
          </Button>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8">
            조회
          </Button>
        </div>
      </div>
    </div>
  );
}
