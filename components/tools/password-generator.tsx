'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { trackToolExecution } from '@/lib/analytics';
import {
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sliders,
  ShieldAlert,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface CharacterOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = new Set(['O', '0', 'l', '1', 'I']);

// Cryptographically secure random integer in range [0, max)
function getSecureRandomInt(max: number): number {
  if (max <= 1) return 0;
  const array = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  let rand: number;
  do {
    window.crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= limit);

  return rand % max;
}

export function PasswordGenerator() {
  const [length, setLength] = useState<number>(18);
  const [options, setOptions] = useState<CharacterOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate password using CSPRNG
  const generatePassword = useCallback(() => {
    let pool = '';
    const guaranteedChars: string[] = [];

    // Filter sets if excludeAmbiguous is active
    const filterAmbiguous = (str: string) =>
      options.excludeAmbiguous ? str.split('').filter((c) => !AMBIGUOUS_CHARS.has(c)).join('') : str;

    const upper = filterAmbiguous(UPPERCASE_CHARS);
    const lower = filterAmbiguous(LOWERCASE_CHARS);
    const nums = filterAmbiguous(NUMBER_CHARS);
    const syms = filterAmbiguous(SYMBOL_CHARS);

    if (options.uppercase && upper.length > 0) {
      pool += upper;
      guaranteedChars.push(upper[getSecureRandomInt(upper.length)]);
    }
    if (options.lowercase && lower.length > 0) {
      pool += lower;
      guaranteedChars.push(lower[getSecureRandomInt(lower.length)]);
    }
    if (options.numbers && nums.length > 0) {
      pool += nums;
      guaranteedChars.push(nums[getSecureRandomInt(nums.length)]);
    }
    if (options.symbols && syms.length > 0) {
      pool += syms;
      guaranteedChars.push(syms[getSecureRandomInt(syms.length)]);
    }

    // Fallback if no sets are selected
    if (pool.length === 0) {
      pool = filterAmbiguous(LOWERCASE_CHARS);
      guaranteedChars.push(pool[getSecureRandomInt(pool.length)]);
    }

    const resultChars: string[] = [...guaranteedChars];

    // Fill remaining length
    while (resultChars.length < length) {
      const idx = getSecureRandomInt(pool.length);
      resultChars.push(pool[idx]);
    }

    // Fisher-Yates CSPRNG shuffle
    for (let i = resultChars.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(i + 1);
      const temp = resultChars[i];
      resultChars[i] = resultChars[j];
      resultChars[j] = temp;
    }

    setPassword(resultChars.slice(0, length).join(''));
  }, [length, options]);

  // Generate initial password on client mount
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Calculate Entropy & Strength
  const strengthInfo = useMemo(() => {
    let poolSize = 0;
    if (options.uppercase) poolSize += 26;
    if (options.lowercase) poolSize += 26;
    if (options.numbers) poolSize += 10;
    if (options.symbols) poolSize += 26;
    if (options.excludeAmbiguous) poolSize -= 5;
    poolSize = Math.max(poolSize, 1);

    // Entropy E = L * log2(R)
    const entropy = Math.round(length * Math.log2(poolSize));

    if (entropy < 36) {
      return {
        level: 'Weak',
        entropy,
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        badgeBg: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        percent: 25,
        crackTime: 'Instant / Minutes',
        icon: ShieldAlert,
      };
    }
    if (entropy < 60) {
      return {
        level: 'Medium',
        entropy,
        color: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        percent: 50,
        crackTime: 'Several Months',
        icon: Shield,
      };
    }
    if (entropy < 80) {
      return {
        level: 'Strong',
        entropy,
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        percent: 75,
        crackTime: 'Millions of Years',
        icon: ShieldCheck,
      };
    }
    return {
      level: 'Very Strong',
      entropy,
      color: 'bg-emerald-600',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
      percent: 100,
      crackTime: 'Trillions of Centuries',
      icon: Lock,
    };
  }, [length, options]);

  // Copy password to clipboard
  const handleCopyPassword = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolExecution('password-generator');
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const toggleOption = (key: keyof CharacterOptions) => {
    // Prevent unchecking all core characters
    const isCore = ['uppercase', 'lowercase', 'numbers', 'symbols'].includes(key);
    if (isCore) {
      const activeCoreCount = ['uppercase', 'lowercase', 'numbers', 'symbols'].filter(
        (k) => options[k as keyof CharacterOptions]
      ).length;
      if (activeCoreCount === 1 && options[key]) {
        return; // Keep at least one active
      }
    }
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const StrengthIcon = strengthInfo.icon;

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs font-medium text-amber-800 dark:text-amber-300 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Zero Server Uploads:</strong> Generated exclusively in device memory via Web Crypto CSPRNG (crypto.getRandomValues).
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
          Hardware Randomness
        </span>
      </div>

      {/* Massive Output Display Panel */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>Generated Password</span>
          </span>
          <span
            className={`text-[11px] font-extrabold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${strengthInfo.badgeBg}`}
          >
            <StrengthIcon className="w-3.5 h-3.5" />
            <span>
              {strengthInfo.level} • {strengthInfo.entropy} bits entropy
            </span>
          </span>
        </div>

        {/* Password Output Field */}
        <div className="relative rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-x-auto select-all scrollbar-none py-1">
            <span className="text-lg sm:text-2xl md:text-3xl font-mono font-black tracking-tight text-slate-950 dark:text-white break-all leading-snug">
              {password || 'Generating...'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Quick Regenerate Button */}
            <button
              type="button"
              onClick={generatePassword}
              aria-label="Generate new password"
              className="min-h-[46px] min-w-[46px] flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Prominent One-Tap Copy Button */}
            <button
              type="button"
              onClick={handleCopyPassword}
              className={`min-h-[46px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md inline-flex items-center gap-2 active:scale-95 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                  : 'bg-slate-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-600 text-white dark:text-slate-900 dark:hover:text-white shadow-slate-900/10'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Password</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Visual Strength Meter (Color-Coded Progress Bar) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Entropy Strength:{' '}
              <strong className={strengthInfo.textColor}>{strengthInfo.level}</strong>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Crack time: {strengthInfo.crackTime}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color}`}
              style={{ width: `${strengthInfo.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Controls & Options Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Length Slider & Presets */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Password Length
                </h3>
              </div>
              <span className="text-sm font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-0.5 rounded-lg border border-amber-200/80 dark:border-amber-800/80">
                {length} characters
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-3 pt-1">
              <input
                type="range"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>8 (Minimum)</span>
                <span>32 (Optimal)</span>
                <span>64 (Extreme)</span>
                <span>128 (Ultra)</span>
              </div>
            </div>

            {/* Quick Length Preset Chips */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Standard Presets
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { len: 12, label: '12' },
                  { len: 16, label: '16' },
                  { len: 24, label: '24' },
                  { len: 32, label: '32' },
                ].map((preset) => (
                  <button
                    key={preset.len}
                    type="button"
                    onClick={() => setLength(preset.len)}
                    className={`min-h-[42px] px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                      length === preset.len
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {preset.label} chars
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Character Rules & Toggles */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Character Rule Toggles
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Min 44px Taps</span>
            </div>

            {/* Toggles Grid (Min 44px tap targets for mobile) */}
            <div className="space-y-2.5">
              {[
                {
                  id: 'uppercase' as const,
                  label: 'Uppercase Letters',
                  example: 'A B C D E F G',
                  checked: options.uppercase,
                },
                {
                  id: 'lowercase' as const,
                  label: 'Lowercase Letters',
                  example: 'a b c d e f g',
                  checked: options.lowercase,
                },
                {
                  id: 'numbers' as const,
                  label: 'Numbers',
                  example: '0 1 2 3 4 5 6 7 8 9',
                  checked: options.numbers,
                },
                {
                  id: 'symbols' as const,
                  label: 'Symbols & Specials',
                  example: '! @ # $ % ^ & * ( ) _ +',
                  checked: options.symbols,
                },
                {
                  id: 'excludeAmbiguous' as const,
                  label: 'Exclude Ambiguous Characters',
                  example: 'Excludes: 0, O, 1, l, I',
                  checked: options.excludeAmbiguous,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleOption(item.id)}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left cursor-pointer active:scale-[0.99] ${
                    item.checked
                      ? 'border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/30'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 opacity-70'
                  }`}
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {item.example}
                    </div>
                  </div>

                  {/* Custom Checkbox Toggle */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      item.checked
                        ? 'bg-amber-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 bg-transparent'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Refresh CTA Button (Massive & Obvious) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={generatePassword}
                className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm sm:text-base font-black shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                <span>Generate New Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
