"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useSession } from "@/lib/sessionStore";

const TOUCH_MAP: Record<string, string> = {
  "/chat/chat-bai.png":     "/chat/chat-bai-touch.png",
  "/chat/chat-jim.png":     "/chat/chat-jim-touch.png",
  "/chat/chat-kitty-1.png": "/chat/chat-kitty-touch.png",
  "/chat/chat-kiwi.png":    "/chat/chat-kiwi-touch.png",
  "/chat/chat-qiuqiu.png":  "/chat/chat-qiuqiu-touch.png",
  "/chat/chat-teo.png":     "/chat/chat-teo-touch.png",
};

interface CatCompanionProps {
  size?: number;
  opacity?: number;
}

export default function CatCompanion({ size = 50, opacity = 0.78 }: CatCompanionProps) {
  const { profile } = useSession();
  const [touched, setTouched] = useState(false);
  // Ref guard — synchronous, avoids double-fire from touchstart + mousedown
  const activeRef = useRef(false);

  function handlePointerDown() {
    if (activeRef.current) return;
    activeRef.current = true;
    setTouched((prev) => !prev);
    // Release guard after pointer event settles (prevents double-fire)
    setTimeout(() => { activeRef.current = false; }, 50);
  }

  const defaultSrc = profile.selectedCat;
  const touchSrc = TOUCH_MAP[defaultSrc];
  const displaySrc = touched && touchSrc ? touchSrc : defaultSrc;

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        width: size,
        height: size,
        cursor: "default",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <Image
        src={displaySrc}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="object-contain pointer-events-none"
        style={{ width: size, height: size, opacity }}
      />
    </div>
  );
}
