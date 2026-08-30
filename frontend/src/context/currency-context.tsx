"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Currency = "IDR" | "USD";

// Benchmark conversion exchange rate (1 USD ≈ 16,200 IDR)
export const USD_TO_IDR_RATE = 16200;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatMoney: (amount: number, baseCurrency?: Currency) => string;
  convertAmount: (amount: number, from: Currency, to: Currency) => number;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to Indonesian Rupiah ('IDR')
  const [currency, setCurrencyState] = useState<Currency>("IDR");

  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem("app_currency") as Currency | null;
      if (savedCurrency === "IDR" || savedCurrency === "USD") {
        setCurrencyState(savedCurrency);
      } else {
        const match = document.cookie.match(/(?:^|;\s*)app_currency=([^;]+)/);
        if (match && (match[1] === "IDR" || match[1] === "USD")) {
          setCurrencyState(match[1] as Currency);
        }
      }
    } catch {
      // Fallback silently to IDR
    }
  }, []);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem("app_currency", newCurrency);
      document.cookie = `app_currency=${newCurrency}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn("Could not save currency preference:", e);
    }
  }, []);

  const convertAmount = useCallback((amount: number, from: Currency, to: Currency): number => {
    if (isNaN(amount) || amount === 0) return 0;
    if (from === to) return amount;
    if (from === "USD" && to === "IDR") return amount * USD_TO_IDR_RATE;
    if (from === "IDR" && to === "USD") return amount / USD_TO_IDR_RATE;
    return amount;
  }, []);

  /**
   * Format money depending on the active currency.
   * If baseCurrency is provided (e.g. amount is 35 USD or 1,500,000 IDR),
   * it converts and formats it according to the active global currency preference.
   * Default baseCurrency is 'IDR'.
   */
  const formatMoney = useCallback(
    (amount: number, baseCurrency: Currency = "IDR"): string => {
      if (isNaN(amount)) return currency === "IDR" ? "Rp 0" : "$0";
      const targetAmount = convertAmount(amount, baseCurrency, currency);

      if (currency === "IDR") {
        return `Rp ${Math.round(targetAmount).toLocaleString("id-ID")}`;
      } else {
        // USD format
        const hasDecimals = targetAmount % 1 !== 0;
        return `$${targetAmount.toLocaleString("en-US", {
          minimumFractionDigits: hasDecimals ? 2 : 0,
          maximumFractionDigits: 2,
        })}`;
      }
    },
    [currency, convertAmount]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatMoney,
        convertAmount,
        rate: USD_TO_IDR_RATE,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
