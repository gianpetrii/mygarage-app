import {
  VEHICLE_CATALOG,
  VEHICLE_MAKES,
  OTHER_MAKE_VALUE,
  OTHER_MODEL_VALUE,
  OTHER_VARIANT_VALUE,
  getVariantsForModel,
} from '@/constants/vehicles';

const UPPERCASE_WORDS = new Set(['BMW', 'BYD', 'RAM', 'DS', 'JAC', 'MG', 'HB20']);

function titleCase(value: string): string {
  if (UPPERCASE_WORDS.has(value.toUpperCase())) {
    return value.toUpperCase();
  }
  return value
    .split(' ')
    .map((word) => {
      if (word.length <= 4 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function normalizeMake(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  const known = VEHICLE_MAKES.find((m) => m.toLowerCase() === trimmed.toLowerCase());
  if (known) return known;
  return titleCase(trimmed);
}

export function normalizeModel(value: string, make: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  const models = getModelsForMake(make);
  const known = models.find((m) => m.toLowerCase() === trimmed.toLowerCase());
  if (known) return known;
  return titleCase(trimmed);
}

export function isKnownMake(make: string): boolean {
  return VEHICLE_MAKES.some((m) => m.toLowerCase() === make.trim().toLowerCase());
}

export function getModelsForMake(make: string): string[] {
  const entry = VEHICLE_MAKES.find((m) => m.toLowerCase() === make.trim().toLowerCase());
  if (!entry) return [];
  return VEHICLE_CATALOG[entry] ?? [];
}

export function isKnownModel(make: string, model: string): boolean {
  const models = getModelsForMake(make);
  return models.some((m) => m.toLowerCase() === model.trim().toLowerCase());
}

export function getTrimOptions(make: string, model: string): string[] {
  return getVariantsForModel(make, model);
}

export function isKnownTrim(make: string, model: string, trim: string): boolean {
  const variants = getTrimOptions(make, model);
  return variants.some((v) => v.toLowerCase() === trim.trim().toLowerCase());
}

export function normalizeTrim(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  return trimmed
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export { OTHER_MAKE_VALUE, OTHER_MODEL_VALUE, OTHER_VARIANT_VALUE };
