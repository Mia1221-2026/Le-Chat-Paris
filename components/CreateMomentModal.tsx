"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, Loader2, Play, Pause, Pencil, Check } from "lucide-react";
import Image from "next/image";
import { mockMemories, mockProfile } from "@/lib/mockData";
import { useSession } from "@/lib/sessionStore";
import type { MemoryCard } from "@/lib/mockData";
import CatCompanion from "@/components/CatCompanion";

const MOCK_GENERATED: MemoryCard = mockMemories[4];

interface CreateMomentModalProps {
  date?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

type ViewState = "input" | "loading" | "result";

export default function CreateMomentModal({
  date,
  onClose,
  onSaved,
}: CreateMomentModalProps) {
  const { addMemory, profile } = useSession();
  const [viewState, setViewState] = useState<ViewState>("input");
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [story, setStory] = useState<MemoryCard | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Translation state
  const [translationEn, setTranslationEn] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showVoiceHint, setShowVoiceHint] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<{ text: string; url: string } | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioCacheRef.current) URL.revokeObjectURL(audioCacheRef.current.url);
    };
  }, []);

  const { targetLanguage } = mockProfile;
  const { languageLevel } = profile;
  const today = new Date().toISOString().split("T")[0];
  const targetDate = date ?? today;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function blobUrlToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    setIsLoadingAudio(false);
  }

  async function handleGenerate() {
    if (!caption.trim()) return;

    setViewState("loading");
    setStory(null);
    setSaved(false);
    setIsPlaying(false);
    setIsEditing(false);
    setIsRefining(false);
    setIsGenerating(true);
    setTranslationEn(null);
    setShowTranslation(false);
    stopAudio();

    try {
      const image = preview ? await blobUrlToBase64(preview) : null;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, targetLanguage, languageLevel, image }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const data = await response.json();
      const generatedText = data.story ?? "";

      const generated: MemoryCard = {
        ...MOCK_GENERATED,
        id: crypto.randomUUID(),
        image: preview ?? MOCK_GENERATED.image,
        date: targetDate,
        storyFr: targetLanguage === "French" ? generatedText : MOCK_GENERATED.storyFr,
        storyEn: targetLanguage === "French" ? MOCK_GENERATED.storyEn : generatedText,
      };

      setStory(generated);
      setEditedText(generatedText);
      setViewState("result");
    } catch (error) {
      console.error("Generate error:", error);
      setViewState("input");
    } finally {
      setIsGenerating(false);
    }
  }

  // Called when user confirms their edit — auto-triggers AI refinement
  async function handleEditSave() {
    setIsEditing(false);
    setIsRefining(true);
    setTranslationEn(null);
    setShowTranslation(false);
    stopAudio();

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedText, targetLanguage, languageLevel }),
      });

      if (response.ok) {
        const data = await response.json();
        setEditedText(data.story ?? editedText);
      }
    } catch (error) {
      console.error("Refine error:", error);
      // Keep user's edited text on failure
    } finally {
      setIsRefining(false);
    }
  }

  function handleEditToggle() {
    if (isEditing) {
      handleEditSave();
    } else {
      stopAudio();
      setIsEditing(true);
    }
  }

  async function handleTranslate() {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    // Use cached translation if available
    if (translationEn !== null) {
      setShowTranslation(true);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedText }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslationEn(data.translation ?? "");
        setShowTranslation(true);
      }
    } catch (error) {
      console.error("Translate error:", error);
    } finally {
      setIsTranslating(false);
    }
  }

  function handleSave() {
    if (!story || saved) return;
    addMemory({
      ...story,
      id: crypto.randomUUID(),
      date: targetDate,
      storyFr: targetLanguage === "French" ? editedText : story.storyFr,
      storyEn: targetLanguage === "French" ? story.storyEn : editedText,
    });
    setSaved(true);
    setTimeout(onSaved, 500);
  }

  function handleReset() {
    stopAudio();
    setViewState("input");
    setStory(null);
    setPreview(null);
    setCaption("");
    setSaved(false);
    setIsPlaying(false);
    setIsEditing(false);
    setEditedText("");
    setIsRefining(false);
    setTranslationEn(null);
    setShowTranslation(false);
    setIsTranslating(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleVoiceHint() {
    setShowVoiceHint(true);
    setTimeout(() => setShowVoiceHint(false), 2000);
  }

  async function handlePlay() {
    if (isPlaying || isLoadingAudio) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);
    try {
      let url: string;
      if (audioCacheRef.current?.text === editedText) {
        url = audioCacheRef.current.url;
      } else {
        const res = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editedText }),
        });
        if (!res.ok) throw new Error("Speech failed");
        const blob = await res.blob();
        if (audioCacheRef.current) URL.revokeObjectURL(audioCacheRef.current.url);
        url = URL.createObjectURL(blob);
        audioCacheRef.current = { text: editedText, url };
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); audioRef.current = null; };
      audio.onerror = () => { setIsPlaying(false); setIsLoadingAudio(false); audioRef.current = null; };
      setIsLoadingAudio(false);
      setIsPlaying(true);
      await audio.play();
    } catch (err) {
      console.error("[speech] play error:", err);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: "var(--color-warm-bg)" }}
    >
      <div
        className="mx-auto flex flex-col min-h-dvh"
        style={{ maxWidth: 390 }}
      >

        {/* Cat companion — quiet presence while writing */}
        {viewState === "input" && (
          <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-[60]" style={{ paddingBottom: 80 }}>
            <div className="relative mx-auto" style={{ maxWidth: 390 }}>
              <div className="absolute bottom-0 right-5 pointer-events-auto">
                <CatCompanion size={100} opacity={0.72} />
              </div>
            </div>
          </div>
        )}

        {/* ── INPUT ── */}
        {viewState === "input" && (
          <>
            <div className="flex items-center px-5 pt-12 pb-8 flex-shrink-0">
              <button
                onClick={onClose}
                className="transition-opacity hover:opacity-60"
                style={{ color: "var(--color-warm-muted)", opacity: 0.5 }}
              >
                <X size={18} strokeWidth={1.4} />
              </button>
              <h2
                className="flex-1 text-center"
                style={{
                  fontFamily: "var(--font-crimson), Georgia, serif",
                  fontSize: "1.05rem",
                  fontWeight: 500,
                  color: "var(--color-warm-text)",
                  marginRight: 18,
                }}
              >
                New Moment
              </h2>
            </div>

            <div className="flex-1 flex flex-col px-5 pb-12">
              {/* Image area */}
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-2xl overflow-hidden transition-opacity active:opacity-80 flex-shrink-0"
                style={{
                  minHeight: 220,
                  border: "1px solid var(--color-warm-border)",
                  background: "var(--color-warm-card)",
                }}
              >
                {preview ? (
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={preview}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="390px"
                    />
                    <div
                      className="absolute inset-0 flex items-end px-4 pb-4"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 50%)",
                      }}
                    >
                      <span className="text-xs text-white opacity-70">Tap to change</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center gap-3" style={{ minHeight: 220 }}>
                    <Camera
                      size={22}
                      strokeWidth={1.2}
                      style={{ color: "var(--color-warm-muted)", opacity: 0.4 }}
                    />
                    <p style={{ fontSize: "0.8rem", color: "var(--color-warm-muted)", opacity: 0.45 }}>
                      Add a photo
                    </p>
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

              {/* Caption */}
              <div className="mt-8">
                <p
                  style={{
                    fontSize: "0.6rem",
                    color: "var(--color-warm-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                    opacity: 0.5,
                    marginBottom: "0.6rem",
                  }}
                >
                  Caption
                </p>
                <div className="flex items-end gap-3">
                  <textarea
                    rows={2}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="A few words about this moment..."
                    className="flex-1 resize-none outline-none bg-transparent leading-relaxed"
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--color-warm-text)",
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      borderBottom: "1px solid var(--color-warm-border)",
                      paddingBottom: "0.5rem",
                    }}
                  />
                  <button
                    onClick={handleVoiceHint}
                    title="Voice — coming soon"
                    className="flex-shrink-0 pb-2 transition-opacity active:opacity-40"
                    style={{ color: "var(--color-warm-muted)", opacity: 0.45 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </button>
                </div>
                {showVoiceHint && (
                  <p
                    className="mt-1 text-right"
                    style={{ fontSize: "0.72rem", color: "var(--color-warm-muted)", opacity: 0.5 }}
                  >
                    Voice input — coming soon
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !caption.trim()}
                  className="transition-opacity active:opacity-50"
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "var(--color-warm-text)",
                    opacity: isGenerating || !caption.trim() ? 0.3 : 0.6,
                  }}
                >
                  Generate →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── LOADING ── */}
        {viewState === "loading" && (
          <>
            <div className="flex items-center justify-end px-5 pt-12 pb-8 flex-shrink-0">
              <button
                onClick={onClose}
                className="transition-opacity hover:opacity-60"
                style={{ color: "var(--color-warm-muted)", opacity: 0.45 }}
              >
                <X size={18} strokeWidth={1.4} />
              </button>
            </div>
            <div className="flex-1 flex flex-col">
              {preview && (
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image src={preview} alt="" fill className="object-cover" sizes="390px" />
                  <div className="absolute inset-0" style={{ background: "rgba(250,249,247,0.55)" }} />
                </div>
              )}
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2
                  size={18}
                  strokeWidth={1.5}
                  className="animate-spin"
                  style={{ color: "var(--color-warm-muted)" }}
                />
                <p className="text-sm" style={{ color: "var(--color-warm-muted)" }}>
                  Writing in {targetLanguage}…
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── RESULT ── */}
        {viewState === "result" && story && (
          <>
            <div className="flex items-center justify-between px-5 pt-12 pb-8 flex-shrink-0">
              <button
                onClick={handleReset}
                className="text-xs transition-opacity hover:opacity-60"
                style={{ color: "var(--color-warm-muted)", opacity: 0.55 }}
              >
                ← New
              </button>
              <button
                onClick={onClose}
                className="transition-opacity hover:opacity-60"
                style={{ color: "var(--color-warm-muted)", opacity: 0.45 }}
              >
                <X size={18} strokeWidth={1.4} />
              </button>
            </div>

            <div className="flex-1 flex flex-col pb-16">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={story.image}
                  alt={story.caption}
                  fill
                  className="object-cover"
                  sizes="390px"
                />
              </div>

              {/* Content */}
              <div className="px-5 pt-6">
                {story.location && (
                  <p
                    className="text-xs mb-5"
                    style={{ color: "var(--color-warm-muted)", letterSpacing: "0.04em", opacity: 0.6 }}
                  >
                    {story.location}
                  </p>
                )}

                {/* Story text */}
                {isRefining ? (
                  <div className="flex items-center gap-3 py-4">
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
                ) : isEditing ? (
                  <>
                    <textarea
                      autoFocus
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full resize-none outline-none bg-transparent leading-relaxed"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: "1.65",
                        color: "var(--color-warm-text)",
                        fontFamily: "var(--font-inter), system-ui, sans-serif",
                        fontWeight: 400,
                        borderBottom: "1px solid var(--color-warm-border)",
                        paddingBottom: "0.75rem",
                        minHeight: 120,
                      }}
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={handleVoiceHint}
                        aria-label="Voice input"
                        className="transition-opacity active:opacity-40"
                        style={{ color: "var(--color-warm-muted)", opacity: 0.45 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      </button>
                    </div>
                    {showVoiceHint && (
                      <p
                        className="text-right"
                        style={{ fontSize: "0.72rem", color: "var(--color-warm-muted)", opacity: 0.5 }}
                      >
                        Voice input — coming soon
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p
                      className="mb-4"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: "1.65",
                        color: "var(--color-warm-text)",
                        fontFamily: "var(--font-inter), system-ui, sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {editedText}
                    </p>

                    {/* Translation */}
                    {showTranslation && translationEn && (
                      <p
                        className="mb-4"
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

                {/* Actions row */}
                <div className="flex items-center gap-4 mt-4">
                  {/* Play / Pause */}
                  <button
                    onClick={handlePlay}
                    disabled={isRefining}
                    className="transition-opacity active:opacity-40"
                    style={{ color: "var(--color-warm-muted)", opacity: (isPlaying || isLoadingAudio) ? 0.8 : 0.45 }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isLoadingAudio
                      ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                      : isPlaying
                      ? <Pause size={14} strokeWidth={1.5} />
                      : <Play  size={14} strokeWidth={1.5} />
                    }
                  </button>

                  {/* Edit / Confirm */}
                  <button
                    onClick={handleEditToggle}
                    disabled={isRefining}
                    className="transition-opacity active:opacity-40"
                    style={{ color: "var(--color-warm-muted)", opacity: isEditing ? 0.8 : 0.45 }}
                    aria-label={isEditing ? "Done editing" : "Edit"}
                  >
                    {isEditing
                      ? <Check  size={14} strokeWidth={1.5} />
                      : <Pencil size={14} strokeWidth={1.5} />
                    }
                  </button>

                  <div className="flex-1" />

                  {/* Read in English / Hide English */}
                  {!isEditing && !isRefining && (
                    <button
                      onClick={handleTranslate}
                      className="transition-opacity active:opacity-40"
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-warm-muted)",
                        opacity: isTranslating ? 0.35 : 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {isTranslating && (
                        <Loader2 size={10} strokeWidth={1.5} className="animate-spin" />
                      )}
                      {showTranslation ? "Hide English" : "Read in English"}
                    </button>
                  )}

                  {/* Save */}
                  {!isEditing && !isRefining && (
                    <button
                      onClick={handleSave}
                      className="transition-opacity hover:opacity-70 active:opacity-40"
                      style={{
                        fontSize: "0.78rem",
                        color: saved ? "var(--color-warm-muted)" : "var(--color-warm-accent)",
                        opacity: saved ? 0.45 : 0.85,
                        textDecorationLine: saved ? "none" : "underline",
                        textUnderlineOffset: "3px",
                        textDecorationColor: "var(--color-warm-accent)",
                      }}
                    >
                      {saved ? "Saved ✓" : "Save to journal"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
