export * from './types';
export { es } from './es';
export { ar } from './ar';
import { es } from './es';
import { ar } from './ar';
import type { LocaleDictionary, PilotLocale } from './types';

const DICTIONARIES: Record<PilotLocale, LocaleDictionary> = { es, ar };

export function getDictionary(locale: PilotLocale): LocaleDictionary {
  return DICTIONARIES[locale];
}

export const PILOT_LOCALES: PilotLocale[] = ['es', 'ar'];
