import { useEffect, useId, useState } from 'react';
import { clampNonNegative, numberForInput, parseNonNegativeNumber } from '../lib/formatting';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper?: string;
  prefix?: string;
  suffix?: string;
  step?: string;
  placeholder?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  helper,
  prefix,
  suffix,
  step = 'any',
  placeholder = '0',
}: NumberInputProps) {
  const inputId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState(numberForInput(value));

  useEffect(() => {
    if (!isFocused) {
      setDraft(numberForInput(value));
    }
  }, [isFocused, value]);

  const handleChange = (nextValue: string) => {
    setDraft(nextValue);
    if (nextValue.trim() === '') {
      onChange(0);
      return;
    }

    onChange(parseNonNegativeNumber(nextValue));
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDraft(numberForInput(clampNonNegative(value)));
  };

  return (
    <label htmlFor={inputId} className="block">
      <span className="control-label">{label}</span>
      <div className="group mt-1 flex items-center border-4 border-slate-950 bg-white px-3 shadow-[4px_4px_0_rgba(15,23,42,0.72)] transition focus-within:bg-cyan-50 dark:border-cyan-200 dark:bg-[#0f172a] dark:shadow-[4px_4px_0_rgba(103,232,249,0.22)] dark:focus-within:bg-[#172033]">
        {prefix ? <span className="mr-2 text-sm text-slate-500 dark:text-slate-400">{prefix}</span> : null}
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          step={step}
          min="0"
          value={draft}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onChange={(event) => handleChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-black text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
        />
        {suffix ? <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{suffix}</span> : null}
      </div>
      {helper ? <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{helper}</span> : null}
    </label>
  );
}
