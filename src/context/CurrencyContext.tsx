"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  inr: "₹",
  dollars: "$",
  euro: "€",
  pkr: "₨",
  gbp: "£",
  cad: "C$",
  aud: "A$",
};

const CURRENCY_NAMES: { [key: string]: string } = {
  inr: "INR",
  dollars: "USD",
  euro: "EUR",
  pkr: "PKR",
  gbp: "GBP",
  cad: "CAD",
  aud: "AUD",
};

// Approximate exchange rates (for display purposes only)
const EXCHANGE_RATES: { [key: string]: number } = {
  inr: 1,
  dollars: 0.012, // 1 INR = 0.012 USD
  euro: 0.011, // 1 INR = 0.011 EUR
  pkr: 3.33, // 1 INR = 3.33 PKR
  gbp: 0.0095, // 1 INR = 0.0095 GBP
  cad: 0.016, // 1 INR = 0.016 CAD
  aud: 0.018, // 1 INR = 0.018 AUD
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency?: string) => number;
  formatCurrency: (amount: number, fromCurrency?: string) => string;
  getCurrencySymbol: (currency?: string) => string;
  CURRENCY_NAMES: { [key: string]: string };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  let amountInINR: number;
  if (fromCurrency === "inr") {
    amountInINR = amount;
  } else {
    const rateToINR = 1 / EXCHANGE_RATES[fromCurrency];
    amountInINR = amount * rateToINR;
  }
  
  if (toCurrency === "inr") {
    return amountInINR;
  } else {
    return amountInINR * EXCHANGE_RATES[toCurrency];
  }
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<string>("pkr"); // Default to PKR

  const convert = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    const targetCurrency = toCurrency || currency;
    return convertCurrency(amount, fromCurrency, targetCurrency);
  };

  const format = (amount: number, fromCurrency?: string): string => {
    const convertedAmount = fromCurrency ? convert(amount, fromCurrency) : amount;
    const symbol = CURRENCY_SYMBOLS[currency] || "₹";
    return `${symbol}${Math.round(convertedAmount).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getSymbol = (curr?: string): string => {
    const currToUse = curr || currency;
    return CURRENCY_SYMBOLS[currToUse] || "₹";
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertCurrency: convert,
        formatCurrency: format,
        getCurrencySymbol: getSymbol,
        CURRENCY_NAMES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

