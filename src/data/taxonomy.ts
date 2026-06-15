// Catalog taxonomy — the shared vocabulary the whole content system hangs off.
// Scalar types + human labels for languages, content types, occasions, ritual steps,
// plus the per-language text + licensed-audio shapes referenced by Track.

// ── Languages (launch set: Hindi, English, Tamil, Telugu, Bengali, Marathi) ──
export type Language = 'hi' | 'en' | 'ta' | 'te' | 'bn' | 'mr';

export const LAUNCH_LANGUAGES: Language[] = ['hi', 'en', 'ta', 'te', 'bn', 'mr'];

export const languageLabels: Record<Language, string> = {
  hi: 'हिन्दी',
  en: 'English',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  mr: 'मराठी',
};

export type Script = 'devanagari' | 'latin' | 'tamil' | 'telugu' | 'bengali';

// ── Content types (superset of the legacy ContentKind) ──
export type ContentType =
  | 'aarti'
  | 'bhajan'
  | 'chalisa'
  | 'stotra'
  | 'mantra'
  | 'shloka'
  | 'katha'
  | 'dhun';

export const contentTypeLabels: Record<ContentType, string> = {
  aarti: 'Aarti',
  bhajan: 'Bhajan',
  chalisa: 'Chalisa',
  stotra: 'Stotra',
  mantra: 'Mantra',
  shloka: 'Shloka',
  katha: 'Katha',
  dhun: 'Dhun',
};

// ── Occasions / festivals ──
export type Occasion =
  | 'daily-morning'
  | 'daily-evening'
  | 'diwali'
  | 'navratri'
  | 'ganesh-chaturthi'
  | 'janmashtami'
  | 'maha-shivratri'
  | 'ram-navami'
  | 'hanuman-jayanti'
  | 'saraswati-puja'
  | 'satyanarayan-puja'
  | 'karva-chauth'
  | 'griha-pravesh';

export const occasionLabels: Record<Occasion, string> = {
  'daily-morning': 'Morning Devotion',
  'daily-evening': 'Evening Aarti',
  diwali: 'Diwali · Lakshmi Puja',
  navratri: 'Navratri · Durga Puja',
  'ganesh-chaturthi': 'Ganesh Chaturthi',
  janmashtami: 'Janmashtami',
  'maha-shivratri': 'Maha Shivratri',
  'ram-navami': 'Ram Navami',
  'hanuman-jayanti': 'Hanuman Jayanti',
  'saraswati-puja': 'Saraswati Puja',
  'satyanarayan-puja': 'Satyanarayan Puja',
  'karva-chauth': 'Karva Chauth',
  'griha-pravesh': 'Griha Pravesh',
};

// ── Puja ritual steps (the order of a traditional pooja) ──
export type RitualStep =
  | 'sankalp'
  | 'avahan'
  | 'dhyan'
  | 'upachar'
  | 'aarti'
  | 'mantra-pushpanjali'
  | 'prasad'
  | 'visarjan';

export const ritualStepLabels: Record<RitualStep, string> = {
  sankalp: 'Sankalp · Intention',
  avahan: 'Avahan · Invocation',
  dhyan: 'Dhyan · Meditation',
  upachar: 'Upachar · Offerings',
  aarti: 'Aarti',
  'mantra-pushpanjali': 'Mantra Pushpanjali',
  prasad: 'Prasad',
  visarjan: 'Visarjan · Farewell',
};

// ── Verification status for sacred text (accuracy is a hard gate) ──
// 'pending'  = field exists but not yet filled / checked — must NOT ship
// 'imported' = carried over from existing app text, not yet expert-reviewed
// 'verified' = checked by a named reviewer
export type VerificationStatus = 'pending' | 'imported' | 'verified';

// Per-language text for one track. Other languages start `pending` until verified —
// we never auto-ship machine-translated sacred text.
export type TrackContent = {
  language: Language;
  script: Script;
  lines: string[]; // verse blocks in the native script
  transliterationIAST?: string[];
  meaning?: string;
  translation?: string[];
  status: VerificationStatus;
  verifiedBy?: string;
};

// A licensed audio rendition. `ledgerId` MUST point at a row in src/data/licensing.ts —
// nothing plays without a license record.
export type AudioVariant = {
  variant: 'traditional' | 'modern' | 'instrumental' | 'chant';
  url: string;
  ledgerId: string;
  artist?: string;
  durationSec?: number;
};
