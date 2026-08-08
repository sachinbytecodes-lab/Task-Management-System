"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MiniCalendar({
  monthLabel = "January 2026",
  selectedDay = 10,
}: {
  monthLabel?: string;
  selectedDay?: number;
}) {
  const [label] = useState(monthLabel);
  // Static Jan 2026 grid (Jan 1 2026 is a Thursday)
  const weeks = [
    [30, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 31, 1, 2, 3],
  ];

  return (
    <div className="p-3 w-72">
      <div className="flex items-center justify-between mb-3">
        <button className="p-1 rounded hover:bg-black/5"><ChevronLeft size={15} /></button>
        <span className="font-medium text-sm" style={{ color: "var(--text)" }}>{label}</span>
        <button className="p-1 rounded hover:bg-black/5"><ChevronRight size={15} /></button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        {DAYS.map((d) => <div key={d}>{d}</div>)}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-y-1 text-center text-sm mt-1">
          {week.map((day, di) => {
            const inMonth = !((wi === 0 && day > 20) || (wi === 4 && day < 20));
            const isSelected = inMonth && day === selectedDay;
            return (
              <div key={di} className="flex justify-center">
                <span
                  className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
                  style={{
                    color: isSelected ? "var(--bg)" : inMonth ? "var(--text)" : "var(--text-muted)",
                    background: isSelected ? "var(--text)" : "transparent",
                    opacity: inMonth ? 1 : 0.4,
                  }}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
