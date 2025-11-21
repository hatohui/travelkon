"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import currencies from "@/../public/currency.json";

interface CurrencySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CurrencySelector({
  value,
  onChange,
  disabled,
}: CurrencySelectorProps) {
  const currencyEntries = Object.entries(currencies);

  // Popular currencies to show first
  const popularCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CNY",
    "AUD",
    "CAD",
    "SGD",
    "HKD",
    "INR",
  ];

  const popularOptions = popularCurrencies
    .filter((code) => currencies[code as keyof typeof currencies])
    .map((code) => ({
      code,
      name: currencies[code as keyof typeof currencies],
    }));

  const otherOptions = currencyEntries
    .filter(([code]) => !popularCurrencies.includes(code))
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code));

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Popular
        </div>
        {popularOptions.map(({ code, name }) => (
          <SelectItem key={code} value={code}>
            {code} - {name}
          </SelectItem>
        ))}
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
          All Currencies
        </div>
        {otherOptions.map(({ code, name }) => (
          <SelectItem key={code} value={code}>
            {code} - {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
