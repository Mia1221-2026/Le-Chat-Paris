"use client";

import { useState } from "react";
import { Settings, Plus } from "lucide-react";
import Link from "next/link";
import CalendarView from "@/components/CalendarView";
import CreateMomentModal from "@/components/CreateMomentModal";
import MemoryDetailSheet from "@/components/MemoryDetailSheet";
import CatCompanion from "@/components/CatCompanion";
import { useSession } from "@/lib/sessionStore";

export default function Home() {
  const { memories } = useSession();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState<string | null>(null);

  const memoriesForDate = selectedDate
    ? memories.filter((m) => m.date === selectedDate)
    : [];

  function handleDateSelect(date: string) {
    const hasMemories = memories.some((m) => m.date === date);
    if (hasMemories) {
      setSelectedDate(date);
    } else {
      setCreateDate(date);
      setShowCreate(true);
    }
  }

  function openCreate() {
    setCreateDate(null);
    setShowCreate(true);
  }

  return (
    <div className="relative flex flex-col min-h-full pb-36">
      {/* Settings icon — top right */}
      <div className="flex justify-end px-5 pt-10 pb-0">
        <Link
          href="/settings"
          style={{ color: "var(--color-warm-text)", opacity: 0.35 }}
        >
          <Settings size={17} strokeWidth={1.4} />
        </Link>
      </div>

      {/* Calendar — owns the year/month header */}
      <div className="px-5 pt-10">
        <CalendarView
          memories={memories}
          onSelectDate={handleDateSelect}
          selectedDate={selectedDate}
        />
      </div>

      {/* Watermark */}
      <div className="flex justify-center mt-12">
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--color-warm-muted)",
            opacity: 0.3,
            letterSpacing: "0.04em",
          }}
        >
          Le Chat à Paris
        </p>
      </div>

      {/* Floating "+" button — outlined circle */}
      <div className="fixed bottom-0 left-0 right-0 pb-10 flex justify-center pointer-events-none z-40">
        <div className="mx-auto flex justify-center" style={{ maxWidth: 390 }}>
          <button
            onClick={openCreate}
            className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center transition-all active:opacity-60"
            style={{
              background: "transparent",
              border: "1px solid var(--color-warm-text)",
              color: "var(--color-warm-text)",
              opacity: 0.5,
            }}
          >
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Cat companion — rests quietly in bottom-right corner */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-30" style={{ paddingBottom: 72 }}>
        <div className="relative mx-auto" style={{ maxWidth: 390 }}>
          <div className="absolute bottom-0 right-5 pointer-events-auto">
            <CatCompanion size={150} />
          </div>
        </div>
      </div>

      {/* Memory detail */}
      {selectedDate && memoriesForDate.length > 0 && (
        <MemoryDetailSheet
          date={selectedDate}
          cards={memoriesForDate}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Create moment */}
      {showCreate && (
        <CreateMomentModal
          date={createDate}
          onClose={() => { setShowCreate(false); setCreateDate(null); }}
          onSaved={() => { setShowCreate(false); setCreateDate(null); }}
        />
      )}
    </div>
  );
}
