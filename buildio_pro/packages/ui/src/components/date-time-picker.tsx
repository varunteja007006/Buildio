"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: "24h" | "12h";
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "MM/DD/YYYY HH:mm",
  disabled = false,
  className,
  type = "24h",
}: Readonly<DateTimePickerProps>) {
  const hours =
    type === "24h"
      ? Array.from({ length: 24 }, (_, i) => i).reverse()
      : Array.from({ length: 12 }, (_, i) => i + 1).reverse();
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const newDate = value ? new Date(value) : new Date(selectedDate);
    newDate.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    onChange?.(newDate);
  };

  const handleTimeChange = (
    timeType: "hour" | "minute" | "ampm",
    val: number | string,
  ) => {
    const base = value ? new Date(value) : new Date();
    if (timeType === "hour") {
      if (type === "12h") {
        const hour =
          (parseInt(val.toString()) % 12) + (base.getHours() >= 12 ? 12 : 0);
        base.setHours(hour);
      } else {
        base.setHours(parseInt(val.toString()));
      }
    } else if (timeType === "minute") {
      base.setMinutes(parseInt(val.toString()));
    } else if (timeType === "ampm") {
      const currentHours = base.getHours();
      if (val === "PM" && currentHours < 12) base.setHours(currentHours + 12);
      if (val === "AM" && currentHours >= 12) base.setHours(currentHours - 12);
    }
    onChange?.(base);
  };

  const formatDisplay = () => {
    if (!value) return placeholder;
    if (type === "12h") {
      return format(value, "MM/dd/yyyy hh:mm aa");
    }
    return format(value, "MM/dd/yyyy HH:mm");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {formatDisplay()}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      value && value.getHours() === hour ? "default" : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour)}
                  >
                    {type === "24h" ? hour : hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      value && value.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", minute)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            {type === "12h" && (
              <ScrollArea className="">
                <div className="flex sm:flex-col p-2">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        value &&
                        ((ampm === "AM" && value.getHours() < 12) ||
                          (ampm === "PM" && value.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
