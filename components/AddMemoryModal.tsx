"use client";

import { useState, useRef } from "react";
import { X, ImagePlus, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { mockMemories } from "@/lib/mockData";
import { useSession } from "@/lib/sessionStore";
import type { MemoryCard } from "@/lib/mockData";

interface AddMemoryModalProps {
  date: string;
  onClose: () => void;
  onSaved: () => void;
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ModalState = "form" | "saving";

export default function AddMemoryModal({
  date,
  onClose,
  onSaved,
}: AddMemoryModalProps) {
  const { addMemory, memories } = useSession();
  const [state, setState] = useState<ModalState>("form");
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit() {
    setState("saving");
    setTimeout(() => {
      const mockIndex = memories.length % mockMemories.length;
      const base = mockMemories[mockIndex];
      const newCard: MemoryCard = {
        ...base,
        id: crypto.randomUUID(),
        date,
        image: image ?? base.image,
        caption: caption || base.caption,
      };
      addMemory(newCard);
      onSaved();
    }, 1000);
  }

  return (
    /* Full-screen overlay — z-50 sits above the drawer (z-40) */
    <div
      className="fixed inset-0 z-50"
      style={{ background: "var(--color-warm-bg)" }}
    >
      {/* Constrain to the same 390px shell as the rest of the app */}
      <div
        className="mx-auto flex flex-col min-h-dvh"
        style={{ maxWidth: 390 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-12 pb-5 flex-shrink-0">
          <div>
            <h2
              className="text-2xl tracking-tight mb-0.5"
              style={{
                fontFamily: "var(--font-crimson), Georgia, serif",
                color: "var(--color-warm-text)",
              }}
            >
              Add Memory
            </h2>
            <p className="text-sm" style={{ color: "var(--color-warm-muted)" }}>
              {formatDateFull(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full mt-1 flex-shrink-0 transition-colors"
            style={{
              background: "var(--color-warm-border)",
              color: "var(--color-warm-muted)",
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ── FORM ── */}
        {state === "form" && (
          <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-4">
            {/* Photo upload */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl overflow-hidden transition-all duration-200 active:opacity-90"
              style={{
                border: "2px dashed var(--color-warm-border)",
                background: image ? "transparent" : "var(--color-warm-card)",
                minHeight: image ? "auto" : 196,
              }}
            >
              {image ? (
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src={image}
                    alt="Memory photo"
                    fill
                    className="object-cover"
                    sizes="390px"
                  />
                  <div
                    className="absolute inset-0 flex items-end p-3"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)",
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      Tap to change photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "var(--color-warm-accent-light)" }}
                  >
                    <ImagePlus
                      size={26}
                      strokeWidth={1.6}
                      style={{ color: "var(--color-warm-accent)" }}
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-warm-text)" }}
                    >
                      Add a photo
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-warm-muted)" }}
                    >
                      Tap to upload from your library
                    </p>
                  </div>
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Unified input: textarea + mic button */}
            <div
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                border: "1px solid var(--color-warm-border)",
                background: "var(--color-warm-card)",
              }}
            >
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Say something about this moment."
                className="w-full px-4 pt-4 pb-2 text-sm resize-none outline-none bg-transparent leading-relaxed"
                style={{
                  color: "var(--color-warm-text)",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                }}
              />
              <div className="flex items-center justify-between px-3 pb-3 pt-1">
                <span
                  className="text-xs"
                  style={{ color: "var(--color-warm-muted)" }}
                >
                  {caption.length > 0 ? `${caption.length} chars` : ""}
                </span>
                {/* Voice button (coming soon) */}
                <button
                  disabled
                  title="Voice recording — coming soon"
                  className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-40"
                  style={{
                    background: "var(--color-warm-accent-light)",
                    color: "var(--color-warm-accent)",
                    cursor: "not-allowed",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]"
              style={{ background: "var(--color-warm-accent)", color: "#fff" }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add to Journal
            </button>
          </div>
        )}

        {/* ── SAVING ── */}
        {state === "saving" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2
              size={24}
              strokeWidth={2}
              className="animate-spin"
              style={{ color: "var(--color-warm-accent)" }}
            />
            <p className="text-sm" style={{ color: "var(--color-warm-muted)" }}>
              Saving memory…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
