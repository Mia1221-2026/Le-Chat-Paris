"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play, Square, Pencil, Trash2, Loader2 } from "lucide-react";
import { useSession } from "@/lib/sessionStore";
import { mockProfile } from "@/lib/mockData";
import type { MemoryCard } from "@/lib/mockData";


function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "long" }),
    full: d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

interface MemoryDetailSheetProps {
  date: string;
  cards: MemoryCard[];
  onClose: () => void;
}

export default function MemoryDetailSheet({
  date,
  cards,
  onClose,
}: MemoryDetailSheetProps) {
  const { deleteMemory, updateMemory, profile } = useSession();
  const [index, setIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationEn, setTranslationEn] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showVoiceHint, setShowVoiceHint] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<{ text: string; url: string } | null>(null);

  const { nativeLanguage, targetLanguage } = mockProfile;
  const { weekday, full } = formatDate(date);

  useEffect(() => {
    if (index >= cards.length && cards.length > 0) setIndex(cards.length - 1);
  }, [cards.length, index]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioCacheRef.current?.url) URL.revokeObjectURL(audioCacheRef.current.url);
    };
  }, []);

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    setIsLoadingAudio(false);
  }

  // Reset all sub-states when switching cards
  useEffect(() => {
    setShowTranslation(false);
    setTranslationEn(null);
    setIsTranslating(false);
    setIsEditing(false);
    setEditText("");
    setIsRefining(false);
    setConfirmDelete(false);
    setShowVoiceHint(false);
    stopAudio();
  }, [index]);

  const card = cards[index];
  if (!card) return null;

  const primaryStory =
    targetLanguage === "French" ? card.storyFr : card.storyEn;

  async function handlePlay() {
    if (isPlaying || isLoadingAudio) { stopAudio(); return; }
    setIsLoadingAudio(true);
    try {
      let url: string;
      if (audioCacheRef.current?.text === primaryStory) {
        url = audioCacheRef.current.url;
      } else {
        const res = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: primaryStory }),
        });
        if (!res.ok) throw new Error("speech failed");
        const blob = await res.blob();
        if (audioCacheRef.current?.url) URL.revokeObjectURL(audioCacheRef.current.url);
        url = URL.createObjectURL(blob);
        audioCacheRef.current = { text: primaryStory, url };
      }
      const audio = new Audio(url);
      audio.onended = () => { setIsPlaying(false); audioRef.current = null; };
      audio.onerror = () => { setIsPlaying(false); audioRef.current = null; };
      audioRef.current = audio;
      setIsLoadingAudio(false);
      setIsPlaying(true);
      await audio.play();
    } catch (error) {
      console.error("[detail] speech error:", error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  }

  function handleStartEdit() {
    stopAudio();
    setShowTranslation(false);
    setEditText(primaryStory);
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    const trimmed = editText.trim();
    if (!trimmed) return;

    // Persist the user's raw edit immediately
    const editUpdates: Partial<MemoryCard> =
      targetLanguage === "French" ? { storyFr: trimmed } : { storyEn: trimmed };
    updateMemory(card.id, editUpdates);

    setIsEditing(false);
    setEditText("");
    setTranslationEn(null);
    setShowTranslation(false);

    // Auto-refine
    setIsRefining(true);
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          targetLanguage,
          languageLevel: profile.languageLevel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const refinedText = data.story ?? trimmed;
        const refinedUpdates: Partial<MemoryCard> =
          targetLanguage === "French"
            ? { storyFr: refinedText }
            : { storyEn: refinedText };
        updateMemory(card.id, refinedUpdates);
      }
    } catch (error) {
      console.error("[detail] refine error:", error);
      // keep the user's raw edit on failure
    } finally {
      setIsRefining(false);
    }
  }

  async function handleTranslate() {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    // Use cached translation if story hasn't changed
    if (translationEn !== null) {
      setShowTranslation(true);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: primaryStory }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslationEn(data.translation ?? "");
        setShowTranslation(true);
      }
    } catch (error) {
      console.error("[detail] translate error:", error);
    } finally {
      setIsTranslating(false);
    }
  }

  function handleVoiceHint() {
    setShowVoiceHint(true);
    setTimeout(() => setShowVoiceHint(false), 2000);
  }

  function handleDelete() {
    deleteMemory(card.id);
    setConfirmDelete(false);
    if (cards.length <= 1) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "var(--color-warm-bg)" }}
    >
      <div className="mx-auto" style={{ maxWidth: 390 }}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-14 pb-8">
          <div>
            <p
              className="mb-2"
              style={{
                color: "var(--color-warm-muted)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: "0.6rem",
                opacity: 0.55,
              }}
            >
              {weekday}
            </p>
            <p
              className="text-2xl"
              style={{
                fontFamily: "var(--font-crimson), Georgia, serif",
                color: "var(--color-warm-text)",
                fontWeight: 400,
              }}
            >
              {full}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-1 transition-opacity hover:opacity-60"
            style={{ color: "var(--color-warm-muted)", opacity: 0.45 }}
          >
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>

        {/* Pagination */}
        {cards.length > 1 && (
          <div className="flex items-center justify-between px-5 pb-4">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="disabled:opacity-20 transition-opacity"
              style={{ color: "var(--color-warm-muted)" }}
            >
              <ChevronLeft size={17} strokeWidth={1.5} />
            </button>
            <span style={{ fontSize: "0.7rem", color: "var(--color-warm-muted)" }}>
              {index + 1} of {cards.length}
            </span>
            <button
              onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}
              disabled={index === cards.length - 1}
              className="disabled:opacity-20 transition-opacity"
              style={{ color: "var(--color-warm-muted)" }}
            >
              <ChevronRight size={17} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={card.image}
            alt={card.caption}
            fill
            className="object-cover"
            sizes="390px"
          />
        </div>

        {/* Content */}
        <div className="px-5 pt-6 pb-32">
          {card.location && (
            <p
              className="text-xs mb-5"
              style={{ color: "var(--color-warm-muted)", letterSpacing: "0.04em", opacity: 0.6 }}
            >
              {card.location}
            </p>
          )}

          {/* Story / Edit / Refining */}
          {isEditing ? (
            <>
              <textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={8}
                className="w-full resize-none outline-none bg-transparent mb-4"
                style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.65",
                  color: "var(--color-warm-text)",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  borderBottom: "1px solid var(--color-warm-border)",
                  paddingBottom: "0.75rem",
                }}
              />
              <div className="flex items-center gap-6">
                <button
                  onClick={() => { setIsEditing(false); setEditText(""); }}
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-warm-muted)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-warm-accent)" }}
                >
                  Save
                </button>
                <div className="flex-1" />
                <button
                  onClick={handleVoiceHint}
                  aria-label="Voice input"
                  className="transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-warm-muted)", opacity: 0.45 }}
                >
                  <MicIcon />
                </button>
              </div>
              {showVoiceHint && (
                <p
                  className="mt-2 text-right"
                  style={{ fontSize: "0.72rem", color: "var(--color-warm-muted)", opacity: 0.5 }}
                >
                  Voice input — coming soon
                </p>
              )}
            </>
          ) : isRefining ? (
            <div className="flex items-center gap-3 py-4 mb-6">
              <Loader2
                size={14}
                strokeWidth={1.5}
                className="animate-spin"
                style={{ color: "var(--color-warm-muted)" }}
              />
              <p style={{ fontSize: "0.8rem", color: "var(--color-warm-muted)" }}>
                Refining…
              </p>
            </div>
          ) : (
            <>
              <p
                className="mb-6"
                style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.65",
                  color: "var(--color-warm-text)",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontWeight: 400,
                }}
              >
                {primaryStory}
              </p>

              {/* Translation toggle */}
              <button
                onClick={handleTranslate}
                className="text-xs mb-4 transition-opacity hover:opacity-70"
                style={{
                  color: "var(--color-warm-muted)",
                  opacity: isTranslating ? 0.35 : 0.55,
                  textDecorationLine: "underline",
                  textUnderlineOffset: "3px",
                  textDecorationColor: "var(--color-warm-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isTranslating && (
                  <Loader2 size={10} strokeWidth={1.5} className="animate-spin" />
                )}
                {showTranslation ? `Hide ${nativeLanguage}` : `Read in ${nativeLanguage}`}
              </button>

              {showTranslation && translationEn && (
                <p
                  className="mb-6"
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.65",
                    color: "var(--color-warm-muted)",
                    fontStyle: "italic",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {translationEn}
                </p>
              )}
            </>
          )}

          {/* Delete confirm */}
          {confirmDelete && (
            <div className="mt-4">
              <p className="text-sm mb-4" style={{ color: "#EF4444", opacity: 0.8 }}>
                Delete this memory?
              </p>
              <div className="flex gap-6">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ color: "var(--color-warm-muted)" }}
                >
                  Keep
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: "#EF4444" }}
                >
                  Yes, delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        {!isEditing && !confirmDelete && !isRefining && (
          <div
            className="fixed bottom-0 left-0 right-0 z-10"
            style={{ background: "var(--color-warm-bg)" }}
          >
            <div
              className="mx-auto flex items-center justify-around px-10 py-8"
              style={{ maxWidth: 390 }}
            >
              <button
                onClick={handlePlay}
                title={isPlaying ? "Stop" : `Listen in ${targetLanguage}`}
                className="transition-opacity hover:opacity-60"
                style={{
                  color: (isPlaying || isLoadingAudio) ? "var(--color-warm-accent)" : "var(--color-warm-muted)",
                  opacity: (isPlaying || isLoadingAudio) ? 1 : 0.7,
                }}
              >
                {isLoadingAudio ? (
                  <Loader2 size={17} strokeWidth={1.4} className="animate-spin" />
                ) : isPlaying ? (
                  <Square size={17} fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play size={17} strokeWidth={1.4} />
                )}
              </button>
              <button
                onClick={handleStartEdit}
                title="Edit"
                className="transition-opacity hover:opacity-60"
                style={{ color: "var(--color-warm-muted)", opacity: 0.7 }}
              >
                <Pencil size={16} strokeWidth={1.4} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                title="Delete"
                className="transition-opacity hover:opacity-60"
                style={{ color: "var(--color-warm-muted)", opacity: 0.7 }}
              >
                <Trash2 size={16} strokeWidth={1.4} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
