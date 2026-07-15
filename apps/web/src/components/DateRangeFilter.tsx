"use client";

import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  placeholder = "Pilih tanggal",
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="lg"
              data-empty={!value?.from}
              className="justify-start border-slate-200 bg-white text-left font-normal text-slate-700 hover:bg-slate-50 data-[empty=true]:text-slate-500"
            />
          }
        >
          <CalendarIcon className="text-slate-500" />
          {value?.from ? (
            value.to ? (
              <span>
                {format(value.from, "d MMM yyyy", { locale: id })}
                {" - "}
                {format(value.to, "d MMM yyyy", { locale: id })}
              </span>
            ) : (
              format(value.from, "d MMM yyyy", { locale: id })
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="range" selected={value} onSelect={onChange} locale={id} />
        </PopoverContent>
      </Popover>
      {value?.from && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Hapus filter tanggal"
          onClick={() => onChange(undefined)}
          className="text-slate-500 hover:text-slate-700"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}
