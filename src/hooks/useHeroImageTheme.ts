"use client";

import { useEffect } from "react";
import { useImmersiveTheme } from "@/contexts/immersive-theme";
import {
  buildImmersiveTheme,
  extractAverageColorFromImage,
  FALLBACK_IMMERSIVE_THEME,
} from "@/lib/image-color";
import { imageSrcCandidates } from "@/lib/image-paths";

export function useHeroImageTheme(heroImage: string) {
  const { setTheme } = useImmersiveTheme();

  useEffect(() => {
    let cancelled = false;
    const candidates = imageSrcCandidates(heroImage);

    const tryLoad = (index: number) => {
      if (cancelled || index >= candidates.length) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";

      img.onload = () => {
        if (cancelled) return;
        try {
          const rgb = extractAverageColorFromImage(img);
          setTheme(buildImmersiveTheme(rgb));
        } catch {
          setTheme(FALLBACK_IMMERSIVE_THEME);
        }
      };

      img.onerror = () => tryLoad(index + 1);
      img.src = candidates[index]!;
    };

    setTheme(FALLBACK_IMMERSIVE_THEME);
    tryLoad(0);

    return () => {
      cancelled = true;
    };
  }, [heroImage, setTheme]);
}
