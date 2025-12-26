"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  categories?: FilterOption[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  budgets?: FilterOption[];
  selectedBudget?: string;
  onBudgetChange?: (value: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

export function FilterBar({
  onSearchChange,
  searchValue,
  categories,
  selectedCategory,
  onCategoryChange,
  budgets,
  selectedBudget,
  onBudgetChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  const hasActiveFilters = selectedCategory || selectedBudget || searchValue;

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 items-center ${className}`}
    >
      <div className="relative w-full sm:w-[300px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search transactions..."
          className="pl-9 w-full"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        {categories && (
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[150px] rounded-full border-dashed">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-3.5 w-3.5" />
                <span className="truncate">
                  {selectedCategory
                    ? categories.find((c) => c.value === selectedCategory)
                        ?.label
                    : "Category"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {budgets && (
          <Select value={selectedBudget} onValueChange={onBudgetChange}>
            <SelectTrigger className="w-[150px] rounded-full border-dashed">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-3.5 w-3.5" />
                <span className="truncate">
                  {selectedBudget
                    ? budgets.find((b) => b.value === selectedBudget)?.label
                    : "Budget"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              {budgets.map((budget) => (
                <SelectItem key={budget.value} value={budget.value}>
                  {budget.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
