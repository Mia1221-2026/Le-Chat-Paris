"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { MemoryCard } from "@/lib/mockData";

interface CalendarViewProps {
  memories: MemoryCard[];
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// Sunday-first (0 = Sunday, matches JS getDay())
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarView({
  memories,
  onSelectDate,
  selectedDate,
}: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const memoriesByDate = memories.reduce<Record<string, MemoryCard[]>>(
    (acc, m) => {
      if (!acc[m.date]) acc[m.date] = [];
      acc[m.date].push(m);
      return acc;
    },
    {}
  );

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function dateStr(day: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${viewYear}-${mm}-${dd}`;
  }

  return (
    <div>
      {/* Year + month header */}
      <div className="flex items-center justify-between px-2 mb-10">
        <button
          onClick={prevMonth}
          className="w-10 h-10 flex items-center justify-center transition-opacity active:opacity-40"
          style={{ color: "var(--color-warm-muted)", opacity: 0.3 }}
        >
          <ChevronLeft size={16} strokeWidth={1.4} />
        </button>

        <div className="flex flex-col items-center gap-1">
          <span
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--color-warm-text)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {viewYear}
          </span>
          <span
            style={{
              fontSize: "0.875rem",
              color: "var(--color-warm-muted)",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
          >
            {MONTH_NAMES[viewMonth]}
          </span>
        </div>

        <button
          onClick={nextMonth}
          className="w-10 h-10 flex items-center justify-center transition-opacity active:opacity-40"
          style={{ color: "var(--color-warm-muted)", opacity: 0.3 }}
        >
          <ChevronRight size={16} strokeWidth={1.4} />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-3">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center"
            style={{
              fontSize: "0.7rem",
              color: "var(--color-warm-muted)",
              fontWeight: 400,
              opacity: 0.45,
              letterSpacing: "0.03em",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-x-1.5 gap-y-5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="aspect-square" />;

          const ds = dateStr(day);
          const dayMemories = memoriesByDate[ds] ?? [];
          const hasMemories = dayMemories.length > 0;
          const isSelected = selectedDate === ds;

          return (
            <button
              key={ds}
              onClick={() => onSelectDate(ds)}
              className="aspect-square relative flex items-center justify-center transition-opacity active:opacity-60"
              style={{
                // Rounded corners only for image cells — applied on inner container
              }}
            >
              {hasMemories ? (
                // Image cell
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ borderRadius: 12 }}
                >
                  <Image
                    src={dayMemories[0].image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                  {/* Scrim */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "rgba(0,0,0,0.22)" }}
                  />
                  {/* Number */}
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "#fff",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {day}
                  </span>
                </div>
              ) : (
                // Plain number cell
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 400,
                    color: isSelected
                      ? "var(--color-warm-accent)"
                      : "var(--color-warm-text)",
                    opacity: isSelected ? 1 : 0.75,
                    letterSpacing: "0.01em",
                  }}
                >
                  {day}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
