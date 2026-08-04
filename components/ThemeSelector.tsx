"use client";

import { useEffect, useState } from "react";
import { DAISY_THEMES, type DaisyTheme } from "@/lib/types";
import { Palette } from "lucide-react";

const STORAGE_KEY = "concert-cost-theme";
const DEFAULT_THEME: DaisyTheme = "cupcake";

export function applyTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeSelector({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<string>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const next = saved && DAISY_THEMES.includes(saved as DaisyTheme) ? saved : DEFAULT_THEME;
    setTheme(next);
    applyTheme(next);
  }, []);

  function onChange(next: string) {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <Palette className="h-4 w-4 opacity-70" aria-hidden />
      <span className="sr-only sm:not-sr-only sm:text-sm sm:opacity-70">Theme</span>
      <select
        className="select select-bordered select-sm w-full max-w-[11rem]"
        value={theme}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Choose theme"
      >
        {DAISY_THEMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ThemeInitScript() {
  const code = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}')||'${DEFAULT_THEME}';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
