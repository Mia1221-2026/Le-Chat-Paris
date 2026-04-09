"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { MemoryCard } from "@/lib/mockData";
import { mockProfile } from "@/lib/mockData";

// ── Profile settings ─────────────────────────────────────────────────────────

export interface ProfileSettings {
  name: string;
  location: string;
  languageLevel: string;
  selectedCat: string;
}

const DEFAULT_PROFILE: ProfileSettings = {
  name: mockProfile.name,
  location: mockProfile.location,
  languageLevel: "B1",
  selectedCat: "/chat/chat-kitty-1.png",
};

// ── Session store ────────────────────────────────────────────────────────────

interface SessionStore {
  memories: MemoryCard[];
  addMemory: (card: MemoryCard) => void;
  updateMemory: (id: string, updates: Partial<MemoryCard>) => void;
  deleteMemory: (id: string) => void;
  profile: ProfileSettings;
  updateProfile: (updates: Partial<ProfileSettings>) => void;
}

const SessionContext = createContext<SessionStore | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState<MemoryCard[]>([]);
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);

  // Load profile from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("userProfile");
      if (saved) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(saved) });
    } catch {
      // ignore parse errors
    }
  }, []);

  function addMemory(card: MemoryCard) {
    setMemories((prev) => [card, ...prev]);
  }

  function updateMemory(id: string, updates: Partial<MemoryCard>) {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }

  function deleteMemory(id: string) {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }

  function updateProfile(updates: Partial<ProfileSettings>) {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem("userProfile", JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  return (
    <SessionContext.Provider
      value={{ memories, addMemory, updateMemory, deleteMemory, profile, updateProfile }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionStore {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
