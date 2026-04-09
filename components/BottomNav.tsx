"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, BookOpen, User } from "lucide-react";

const tabs = [
  { href: "/moments", label: "Moments", icon: Camera },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--color-warm-border)",
      }}
    >
      {/* Constrained to same 390px as the app shell */}
      <div
        className="mx-auto flex items-center"
        style={{ maxWidth: 390 }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 transition-all duration-200 select-none"
              style={{
                color: isActive
                  ? "var(--color-warm-accent)"
                  : "var(--color-warm-muted)",
                paddingTop: 12,
                paddingBottom: 16,
              }}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.0 : 1.6}
                className="transition-all duration-200"
                style={{ transform: isActive ? "scale(1.1)" : "scale(1)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.67rem",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
