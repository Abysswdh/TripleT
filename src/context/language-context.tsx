"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import idTranslations from "@/locales/id.json";
import enTranslations from "@/locales/en.json";

export type Locale = "id" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number> | string, optionsOrParams?: Record<string, string | number>) => string;
  isReady: boolean;
}

const translations: Record<Locale, Record<string, unknown>> = {
  id: idTranslations,
  en: enTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Indonesian ('id')
  const [locale, setLocaleState] = useState<Locale>("id");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // 1. Try reading from cookie or localStorage
      let initialLocale: Locale = "id";
      const stored = localStorage.getItem("app_locale") as Locale | null;

      if (stored === "id" || stored === "en") {
        initialLocale = stored;
      } else {
        const match = document.cookie.match(/(?:^|;\s*)app_locale=([^;]+)/);
        if (match && (match[1] === "id" || match[1] === "en")) {
          initialLocale = match[1] as Locale;
        }
      }

      setLocaleState(initialLocale);
      document.documentElement.lang = initialLocale;
    } catch {
      // Fail silently and keep default 'id'
    } finally {
      setIsReady(true);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("app_locale", newLocale);
      document.cookie = `app_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    } catch (e) {
      console.warn("Could not save locale preference:", e);
    }
  }, []);

  /**
   * Helper function to resolve dot-notated translation keys (e.g. "settings.title")
   * Supports parameter interpolation: {{key}}
   */
  const t = useCallback(
    (
      path: string,
      fallbackOrParams?: Record<string, string | number> | string,
      extraParams?: Record<string, string | number>
    ): string => {
      let fallback: string | undefined;
      let params: Record<string, string | number> | undefined;

      if (typeof fallbackOrParams === "string") {
        fallback = fallbackOrParams;
        params = extraParams;
      } else {
        params = fallbackOrParams;
      }

      const resolveValue = (dict: Record<string, unknown>, keys: string[]): string | undefined => {
        let current: unknown = dict;
        for (const k of keys) {
          if (current && typeof current === "object" && k in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[k];
          } else {
            return undefined;
          }
        }
        return typeof current === "string" ? current : undefined;
      };

      const keys = path.split(".");
      let text = resolveValue(translations[locale], keys);

      // Fallback to Indonesian if key not found in active locale
      if (text === undefined && locale !== "id") {
        text = resolveValue(translations.id, keys);
      }

      if (text === undefined) {
        text = fallback || path;
      }

      // Parameter interpolation for {{placeholder}}
      if (params && typeof text === "string") {
        for (const [pKey, pValue] of Object.entries(params)) {
          text = text.replace(new RegExp(`{{\\s*${pKey}\\s*}}`, "g"), String(pValue));
        }
      }

      return text;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}

export const useLanguage = useTranslation;

