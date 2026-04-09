"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Languages,
  Bookmark,
  MapPin,
  Play,
  Square,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { MemoryCard } from "@/lib/mockData";

function langCode(language: string): string {
  const map: Record<string, string> = {
    French: "fr-FR",
    English: "en-US",
    Spanish: "es-ES",
    German: "de-DE",
    Italian: "it-IT",
    Japanese: "ja-JP",
    Chinese: "zh-CN",
    Portuguese: "pt-PT",
  };
  return map[language] ?? "en-US";
}

interface StoryCardProps {
  card: MemoryCard;
  nativeLanguage: string;
  targetLanguage: string;
  mode?: "create" | "review";
  onSave?: (id: string) => void;
  saved?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<MemoryCard>) => void;
}

export default function StoryCard({
  card,
  nativeLanguage,
  targetLanguage,
  mode = "create",
  onSave,
  saved = false,
  onDelete,
  onUpdate,
}: StoryCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const primaryStory =
    targetLanguage === "French" ? card.storyFr : card.storyEn;
  const translationStory =
    nativeLanguage === "English" ? card.storyEn : card.storyFr;

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function handlePlay() {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(primaryStory);
    utter.lang = langCode(targetLanguage);
    utter.rate = 0.88;
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setIsPlaying(true);
  }

  function handleStartEdit() {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setShowTranslation(false);
    setEditText(primaryStory);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditText("");
  }

  function handleSaveEdit() {
    const updates: Partial<MemoryCard> =
      targetLanguage === "French"
        ? { storyFr: editText }
        : { storyEn: editText };
    onUpdate?.(card.id, updates);
    setIsEditing(false);
    setEditText("");
  }

  function handleDeleteConfirm() {
    onDelete?.(card.id);
  }

  // Small circle play button used in create mode (above story text)
  const PlayIconButton = (
    <button
      onClick={handlePlay}
      title={isPlaying ? "Stop" : `Listen in ${targetLanguage}`}
      className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200"
      style={{
        background: isPlaying
          ? "var(--color-warm-accent)"
          : "var(--color-warm-accent-light)",
        color: isPlaying ? "#fff" : "var(--color-warm-accent)",
      }}
    >
      {isPlaying ? (
        <Square size={11} fill="currentColor" strokeWidth={0} />
      ) : (
        <Play size={11} fill="currentColor" strokeWidth={0} />
      )}
    </button>
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--color-warm-card)",
        border: "1px solid var(--color-warm-border)",
        boxShadow: "0 2px 20px rgba(44,37,32,0.07)",
      }}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
        <Image
          src={card.image}
          alt={card.caption}
          fill
          className="object-cover"
          sizes="390px"
        />
      </div>

      <div className="p-5">
        {/* Location + play icon (create mode) */}
        <div className="flex items-center justify-between mb-3">
          <div
            className="flex items-center gap-1.5"
            style={{ color: "var(--color-warm-muted)" }}
          >
            {card.location && (
              <>
                <MapPin size={12} strokeWidth={1.8} />
                <span className="text-xs tracking-wide">{card.location}</span>
              </>
            )}
          </div>
          {/* Play shown here only in create mode */}
          {mode === "create" && PlayIconButton}
        </div>

        {/* Story text — or textarea when editing */}
        {isEditing ? (
          <>
            <textarea
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={6}
              className="w-full text-sm leading-relaxed resize-none outline-none rounded-xl p-3 mb-3"
              style={{
                border: "1.5px solid var(--color-warm-accent)",
                background: "var(--color-warm-accent-light)",
                color: "var(--color-warm-text)",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
              }}
            />
            <button
              disabled
              className="flex items-center gap-1.5 text-xs mb-4"
              style={{ color: "var(--color-warm-sage)", opacity: 0.5 }}
            >
              <Sparkles size={12} strokeWidth={1.8} />
              Improve with AI
              <span
                className="rounded-full px-2 py-0.5"
                style={{
                  background: "var(--color-warm-sage-light)",
                  color: "var(--color-warm-sage)",
                  fontSize: "0.65rem",
                }}
              >
                Soon
              </span>
            </button>
          </>
        ) : (
          <p
            className="text-sm leading-relaxed mb-4"
            style={{
              color: "var(--color-warm-text)",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {primaryStory}
          </p>
        )}

        {/* Translate toggle — hidden while editing */}
        {!isEditing && (
          <>
            <button
              onClick={() => setShowTranslation((v) => !v)}
              className="flex items-center gap-2 text-xs font-medium mb-4 transition-colors"
              style={{ color: "var(--color-warm-accent)" }}
            >
              <Languages size={14} strokeWidth={2} />
              {showTranslation
                ? `Hide ${nativeLanguage}`
                : `Translate to ${nativeLanguage}`}
            </button>

            {showTranslation && (
              <div
                className="rounded-xl p-4 mb-4 text-sm leading-relaxed"
                style={{
                  background: "var(--color-warm-accent-light)",
                  color: "var(--color-warm-text)",
                  fontStyle: "italic",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                }}
              >
                {translationStory}
              </div>
            )}
          </>
        )}

        {/* ── CREATE MODE: Save button ── */}
        {mode === "create" && (
          <button
            onClick={() => onSave?.(card.id)}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98]"
            style={{
              paddingTop: 13,
              paddingBottom: 13,
              background: saved
                ? "var(--color-warm-sage-light)"
                : "var(--color-warm-accent)",
              color: saved ? "var(--color-warm-sage)" : "#fff",
            }}
          >
            <Bookmark
              size={15}
              strokeWidth={2}
              fill={saved ? "currentColor" : "none"}
            />
            {saved ? "Saved to Journal" : "Save as Memory Card"}
          </button>
        )}

        {/* ── REVIEW MODE: three icon buttons ── */}
        {mode === "review" && !isEditing && !isConfirmingDelete && (
          <div className="flex gap-2">
            {/* Play */}
            <button
              onClick={handlePlay}
              title={isPlaying ? "Stop" : `Listen in ${targetLanguage}`}
              className="flex-1 h-11 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{
                background: isPlaying
                  ? "var(--color-warm-accent)"
                  : "var(--color-warm-accent-light)",
                color: isPlaying ? "#fff" : "var(--color-warm-accent)",
              }}
            >
              {isPlaying ? (
                <Square size={14} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={14} fill="currentColor" strokeWidth={0} />
              )}
            </button>

            {/* Edit */}
            <button
              onClick={handleStartEdit}
              title="Edit story"
              className="flex-1 h-11 flex items-center justify-center rounded-xl transition-all active:scale-[0.97]"
              style={{
                border: "1px solid var(--color-warm-border)",
                color: "var(--color-warm-text)",
                background: "transparent",
              }}
            >
              <Pencil size={15} strokeWidth={1.8} />
            </button>

            {/* Delete */}
            <button
              onClick={() => setIsConfirmingDelete(true)}
              title="Delete memory"
              className="flex-1 h-11 flex items-center justify-center rounded-xl transition-all active:scale-[0.97]"
              style={{
                border: "1px solid #FECACA",
                color: "#EF4444",
                background: "#FEF2F2",
              }}
            >
              <Trash2 size={15} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* ── REVIEW MODE: editing actions ── */}
        {mode === "review" && isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="flex-1 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                paddingTop: 11,
                paddingBottom: 11,
                border: "1px solid var(--color-warm-border)",
                color: "var(--color-warm-muted)",
                background: "transparent",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                paddingTop: 11,
                paddingBottom: 11,
                background: "var(--color-warm-accent)",
                color: "#fff",
              }}
            >
              Save
            </button>
          </div>
        )}

        {/* ── REVIEW MODE: delete confirmation ── */}
        {mode === "review" && isConfirmingDelete && (
          <div
            className="rounded-xl p-4"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <p className="text-sm text-center mb-3" style={{ color: "#DC2626" }}>
              Delete this memory?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 rounded-xl text-sm font-medium py-2.5 transition-all"
                style={{
                  border: "1px solid #FECACA",
                  color: "var(--color-warm-muted)",
                  background: "#fff",
                }}
              >
                Keep
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl text-sm font-medium py-2.5 transition-all active:scale-[0.98]"
                style={{ background: "#EF4444", color: "#fff" }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
