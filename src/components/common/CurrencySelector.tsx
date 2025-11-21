"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const currencyOptions = React.useMemo(() => {
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

    return Object.entries(currencies).map(([code, name]) => ({
      code,
      name,
      isPopular: popularCurrencies.includes(code),
    }));
  }, []);

  const filteredCurrencies = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    return currencyOptions.filter(
      (curr) =>
        curr.code.toLowerCase().includes(searchLower) ||
        curr.name.toLowerCase().includes(searchLower)
    );
  }, [currencyOptions, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Search currency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="max-h-[300px] overflow-auto p-1">
          {filteredCurrencies.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No currency found.
            </div>
          ) : (
            filteredCurrencies.map((curr) => (
              <button
                key={curr.code}
                type="button"
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === curr.code && "bg-accent"
                )}
                onClick={() => {
                  onChange(curr.code);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === curr.code ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1 text-left">
                  <div className="font-medium">{curr.code}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {curr.name}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
