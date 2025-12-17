// src/components/LanguageToggle.tsx
import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANG_OPTIONS, type Lang } from "@/lib/i18n";

type Props = {
  value: Lang;
  onChange: (lang: Lang) => void;
};

export function LanguageToggle({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-lang-toggle]")) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="relative" data-lang-toggle>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
      >
        <Languages className="w-5 h-5" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-28 rounded-md border bg-white shadow-md dark:bg-slate-900 dark:border-slate-800 z-50">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                onChange(opt.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 ${
                value === opt.code
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
