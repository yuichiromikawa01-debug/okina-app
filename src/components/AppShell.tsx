"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useImmersiveTheme } from "@/contexts/immersive-theme";
import { Drawer } from "./Drawer";
import { Composer } from "./Composer";

type AppShellProps = {
  children: React.ReactNode;
  collectionId?: string;
  workId?: string;
  threadId?: string;
  showComposer?: boolean;
  hideHeader?: boolean;
  className?: string;
  composerVariant?: "light" | "dark";
  immersive?: boolean;
};

export function AppShell({
  children,
  collectionId,
  workId,
  threadId,
  showComposer = true,
  hideHeader = false,
  className,
  composerVariant = "light",
  immersive = false,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme } = useImmersiveTheme();

  return (
    <div
      className={cn(
        "w-full min-h-screen md:mx-auto md:max-w-[390px] md:shadow-xl",
        immersive ? "md:shadow-black/20" : "bg-bg md:shadow-black/5",
        className
      )}
      style={
        immersive
          ? {
              backgroundColor: theme.background,
              transition: "background-color 600ms ease",
            }
          : undefined
      }
    >
      {!hideHeader && (
        <header className="sticky top-0 z-20 px-5 pt-12 pb-3 bg-bg/90 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="font-display text-[22px] font-normal tracking-tight text-ink"
            aria-label="メニューを開く"
          >
            Okina
          </button>
        </header>
      )}

      <main className={showComposer ? "pb-[calc(var(--composer-height)+var(--safe-bottom))]" : ""}>
        {children}
      </main>

      {showComposer && (
        <Composer
          key={threadId ?? "composer"}
          collectionId={collectionId}
          workId={workId}
          threadId={threadId}
          variant={composerVariant}
          immersiveTint={immersive ? theme.composerBackground : undefined}
        />
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
