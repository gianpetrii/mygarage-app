/** URLs públicas de documentación legal (desplegar carpeta `legal/` en Vercel). */
export const LEGAL_BASE_URL = 'https://mygarage-legal.vercel.app';

export const LEGAL_URLS = {
  home: LEGAL_BASE_URL,
  privacy: `${LEGAL_BASE_URL}/privacy`,
  support: `${LEGAL_BASE_URL}/support`,
  terms: `${LEGAL_BASE_URL}/terms`,
} as const;

export const SUPPORT_EMAIL = 'gianluca.petri.98@icloud.com';
