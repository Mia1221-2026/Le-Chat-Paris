"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import AddMemoryModal from "@/components/AddMemoryModal";
import { mockProfile } from "@/lib/mockData";
import { useSession } from "@/lib/sessionStore";
import type { MemoryCard } from "@/lib/mockData";

interface DailyMemoryDrawerProps {
  date: string;
  cards: MemoryCard[];
  onClose: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DailyMemoryDrawer({
  date,
  cards,
  onClose,
}: DailyMemoryDrawerProps) {
  const { deleteMemory, updateMemory } = useSession();
  const [index, setIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(cards.length === 0);
  const { nativeLanguage, targetLanguage } = mockProfile;

  // Keep index in bounds when cards shrink after delete
  useEffect(() => {
    if (index >= cards.length && cards.length > 0) {
      setIndex(cards.length - 1);
    }
  }, [cards.length, index]);

  const current = cards[index];
  const multiple = cards.length > 1;

  return (
    <>
      {/* Bottom-sheet drawer */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-end"
        style={{ background: "rgba(42,37,32,0.45)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="mx-auto w-full rounded-t-3xl overflow-hidden flex flex-col"
          style={{
            maxWidth: 390,
            background: "var(--color-warm-bg)",
            maxHeight: "88dvh",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "var(--color-warm-border)" }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
            <div>
              <p
                className="text-base font-semibold"
                style={{
                  fontFamily: "var(--font-crimson), Georgia, serif",
                  color: "var(--color-warm-text)",
                }}
              >
                {formatDate(date)}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-warm-muted)" }}
              >
                {cards.length === 0
                  ? "No memories yet"
                  : `${cards.length} ${cards.length === 1 ? "memory" : "memories"}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                title="Add memory for this date"
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{
                  background: "var(--color-warm-accent-light)",
                  color: "var(--color-warm-accent)",
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{
                  background: "var(--color-warm-border)",
                  color: "var(--color-warm-muted)",
                }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Card pagination */}
          {multiple && (
            <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
              <button
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="flex items-center gap-1 text-xs font-medium disabled:opacity-30 transition-opacity"
                style={{ color: "var(--color-warm-accent)" }}
              >
                <ChevronLeft size={15} strokeWidth={2} /> Prev
              </button>
              <div className="flex gap-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: i === index ? 20 : 6,
                      background:
                        i === index
                          ? "var(--color-warm-accent)"
                          : "var(--color-warm-border)",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setIndex((i) => Math.min(cards.length - 1, i + 1))
                }
                disabled={index === cards.length - 1}
                className="flex items-center gap-1 text-xs font-medium disabled:opacity-30 transition-opacity"
                style={{ color: "var(--color-warm-accent)" }}
              >
                Next <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Scrollable content */}
          <div className="overflow-y-auto px-5 pb-8 flex-1">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-center">
                <p
                  className="text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-crimson), Georgia, serif",
                    color: "var(--color-warm-text)",
                  }}
                >
                  Nothing here yet
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-warm-muted)" }}
                >
                  Tap + to add a memory for this day
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
                  style={{
                    background: "var(--color-warm-accent)",
                    color: "#fff",
                  }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Add memory
                </button>
              </div>
            ) : (
              current && (
                <StoryCard
                  key={current.id}
                  card={current}
                  mode="review"
                  nativeLanguage={nativeLanguage}
                  targetLanguage={targetLanguage}
                  onDelete={deleteMemory}
                  onUpdate={updateMemory}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Add Memory modal — mounts above the drawer at z-50 */}
      {showAddModal && (
        <AddMemoryModal
          date={date}
          onClose={() => setShowAddModal(false)}
          onSaved={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
