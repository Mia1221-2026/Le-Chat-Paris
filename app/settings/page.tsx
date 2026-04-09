"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { mockProfile } from "@/lib/mockData";
import { useSession } from "@/lib/sessionStore";

type ProfileField = "name" | "location" | "nativeLanguage" | "targetLanguage" | "languageLevel";

const FIELD_LABELS: Record<ProfileField, string> = {
  name: "Name",
  location: "Location",
  nativeLanguage: "Native language",
  targetLanguage: "Learning",
  languageLevel: "My level",
};

// These fields are locked — visible but not interactive
const DISABLED_FIELDS = new Set<ProfileField>(["nativeLanguage", "targetLanguage"]);

const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1"];

const CATS = [
  { src: "/chat/chat-bai.png",     name: "Bai",    meta: "boy · 6 years"      },
  { src: "/chat/chat-jim.png",     name: "Jim",    meta: "boy · 4 years"      },
  { src: "/chat/chat-kitty-1.png", name: "Kitty",  meta: "girl · age unknown" },
  { src: "/chat/chat-kiwi.png",    name: "Kiwi",   meta: "boy · 12 years"     },
  { src: "/chat/chat-qiuqiu.png",  name: "Qiuqiu", meta: "boy · 2 years"      },
  { src: "/chat/chat-teo.png",     name: "Teo",    meta: "boy · 3 years"      },
];

export default function SettingsPage() {
  const { profile, updateProfile } = useSession();

  const [editingField, setEditingField] = useState<ProfileField | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  // Combine persisted profile with fixed values from mockProfile
  function getDisplayValue(field: ProfileField): string {
    if (field === "nativeLanguage") return mockProfile.nativeLanguage;
    if (field === "targetLanguage") return mockProfile.targetLanguage;
    if (field === "name") return profile.name;
    if (field === "location") return profile.location;
    return profile.languageLevel;
  }

  function startEdit(field: ProfileField) {
    if (DISABLED_FIELDS.has(field)) return;
    if (field === "languageLevel") {
      setEditingField((prev) => (prev === field ? null : field));
      return;
    }
    setDraftValue(getDisplayValue(field));
    setEditingField(field);
  }

  function commitEdit() {
    if (!editingField || editingField === "languageLevel") return;
    const trimmed = draftValue.trim();
    if (trimmed) updateProfile({ [editingField]: trimmed });
    setEditingField(null);
    setDraftValue("");
  }

  function selectLevel(level: string) {
    updateProfile({ languageLevel: level });
    setEditingField(null);
  }

  function pickCat(src: string) {
    updateProfile({ selectedCat: src });
    setPickerOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") { setEditingField(null); setDraftValue(""); }
  }

  const fields = Object.keys(FIELD_LABELS) as ProfileField[];

  return (
    <div className="relative flex flex-col min-h-full pb-16 overflow-hidden">

      {/* Header */}
      <div className="flex items-center px-5 pt-10 pb-0">
        <Link
          href="/"
          className="transition-opacity hover:opacity-60"
          style={{ color: "var(--color-warm-text)", opacity: 0.5 }}
        >
          <X size={18} strokeWidth={1.5} />
        </Link>
        <h1
          className="flex-1 text-center"
          style={{
            fontFamily: "var(--font-crimson), Georgia, serif",
            fontSize: "1.15rem",
            fontWeight: 700,
            color: "var(--color-warm-text)",
            marginRight: 18,
          }}
        >
          Settings
        </h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center pt-6 pb-6">
        <button
          onClick={() => setPickerOpen(true)}
          className="focus:outline-none"
          aria-label="Choose your cat"
        >
          <Image
            src={profile.selectedCat}
            alt="Selected cat"
            width={96}
            height={96}
            className="object-contain"
            style={{ width: 96, height: 96 }}
          />
        </button>
        <p
          className="mt-2"
          style={{ fontSize: "0.85rem", color: "var(--color-warm-muted)", fontWeight: 400 }}
        >
          Chat
        </p>
      </div>

      {/* Fields list */}
      <div className="px-5">
        <p
          className="mb-4"
          style={{ fontSize: "0.82rem", color: "var(--color-warm-muted)", fontWeight: 400, opacity: 0.6 }}
        >
          Personal Information
        </p>

        <div style={{ height: "1px", background: "var(--color-warm-border)", opacity: 0.5 }} />

        {fields.map((field) => {
          const isEditing = editingField === field;
          const isLevel = field === "languageLevel";
          const isDisabled = DISABLED_FIELDS.has(field);

          return (
            <div key={field}>
              <div
                className={`flex items-center justify-between py-4 ${isDisabled ? "cursor-default" : "cursor-pointer"}`}
                onClick={() => !isEditing && startEdit(field)}
              >
                {/* Label */}
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--color-warm-muted)",
                    fontWeight: 400,
                    opacity: isDisabled ? 0.35 : 1,
                  }}
                >
                  {FIELD_LABELS[field]}
                </p>

                {/* Value or inline input */}
                {isEditing && !isLevel ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={draftValue}
                      onChange={(e) => setDraftValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={handleKeyDown}
                      className="outline-none bg-transparent text-right"
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--color-warm-text)",
                        fontFamily: "var(--font-inter), system-ui, sans-serif",
                        caretColor: "var(--color-warm-text)",
                        maxWidth: 180,
                      }}
                    />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); commitEdit(); }}
                      style={{ color: "var(--color-warm-text)", opacity: 0.5 }}
                    >
                      <Check size={13} strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 400,
                      color: "var(--color-warm-text)",
                      opacity: isDisabled ? 0.3 : 1,
                    }}
                  >
                    {getDisplayValue(field)}
                  </p>
                )}
              </div>

              {/* Level chips */}
              {isLevel && isEditing && (
                <div className="flex gap-2 pb-4" onClick={(e) => e.stopPropagation()}>
                  {LANGUAGE_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => selectLevel(level)}
                      className="flex-1 py-1.5 text-xs font-medium transition-all rounded"
                      style={{
                        background:
                          profile.languageLevel === level
                            ? "var(--color-warm-text)"
                            : "transparent",
                        color:
                          profile.languageLevel === level
                            ? "#fff"
                            : "var(--color-warm-muted)",
                        border: "1px solid var(--color-warm-border)",
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ height: "1px", background: "var(--color-warm-border)", opacity: 0.5 }} />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p
        className="text-xs text-center mt-12"
        style={{ color: "var(--color-warm-muted)", opacity: 0.35 }}
      >
        Le Chat à Paris · v1.0.0
      </p>

      {/* Cat Picker */}
      {pickerOpen && (
        <div
          className="absolute inset-0 z-50 flex flex-col"
          style={{ background: "var(--color-warm-bg)" }}
        >
          <div className="flex items-center px-5 pt-12 pb-0 shrink-0">
            <button
              onClick={() => setPickerOpen(false)}
              className="transition-opacity hover:opacity-60"
              style={{ color: "var(--color-warm-text)", opacity: 0.45 }}
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
            <h2
              className="flex-1 text-center"
              style={{
                fontFamily: "var(--font-crimson), Georgia, serif",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--color-warm-text)",
                marginRight: 18,
              }}
            >
              Choose your cat
            </h2>
          </div>

          <div className="overflow-y-auto flex-1 px-8 pt-6 pb-8">
            <div className="grid gap-x-6 gap-y-5" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {CATS.map((cat) => {
                const isSelected = cat.src === profile.selectedCat;
                return (
                  <button
                    key={cat.src}
                    onClick={() => pickCat(cat.src)}
                    className="flex flex-col items-center focus:outline-none"
                    style={{
                      background: "transparent",
                      opacity: isSelected ? 1 : 0.72,
                      transform: isSelected ? "scale(1.04)" : "scale(1)",
                      transition: "transform 0.15s ease, opacity 0.15s ease",
                    }}
                  >
                    <Image
                      src={cat.src}
                      alt={cat.name}
                      width={100}
                      height={100}
                      className="object-contain"
                      style={{ width: 100, height: 100 }}
                    />
                    <p
                      className="mt-1"
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--color-warm-text)",
                        fontFamily: "var(--font-crimson), Georgia, serif",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {cat.name}
                    </p>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-warm-muted)",
                        fontWeight: 400,
                        marginTop: "0.1rem",
                        opacity: 0.8,
                      }}
                    >
                      {cat.meta}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
