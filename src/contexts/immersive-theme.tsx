"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FALLBACK_IMMERSIVE_THEME,
  type ImmersiveTheme,
} from "@/lib/image-color";

type ImmersiveThemeContextValue = {
  theme: ImmersiveTheme;
  setTheme: (theme: ImmersiveTheme) => void;
};

const ImmersiveThemeContext = createContext<ImmersiveThemeContextValue | null>(
  null
);

export function ImmersiveThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ImmersiveTheme>(
    FALLBACK_IMMERSIVE_THEME
  );
  const setTheme = useCallback((next: ImmersiveTheme) => {
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme }),
    [theme, setTheme]
  );

  return (
    <ImmersiveThemeContext.Provider value={value}>
      {children}
    </ImmersiveThemeContext.Provider>
  );
}

export function useImmersiveTheme(): ImmersiveThemeContextValue {
  const context = useContext(ImmersiveThemeContext);
  if (!context) {
    return { theme: FALLBACK_IMMERSIVE_THEME, setTheme: () => {} };
  }
  return context;
}
