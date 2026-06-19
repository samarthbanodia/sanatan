// "What day → what pooja" — deterministic weekday (vaar) guidance plus a curated
// major-festival calendar. The weekday map is always-correct (no panchang needed)
// and is the reliable backbone of the "Today" surface; festival dates follow the
// lunar calendar and are illustrative for the year — confirm the exact tithi
// annually (a panchang library is a planned upgrade). Reuses the Occasion taxonomy.

import { Occasion } from './taxonomy';

export type DayGuide = {
  weekday: number; // 0=Sun … 6=Sat (matches Date.getDay())
  deityName: string; // display name (some, e.g. Surya, aren't 1-on-1 chat deities)
  deityId?: string; // app deity (for art / darshan) when available
  title: string;
  blurb: string;
  trackIds: string[];
  mantra?: string;
};

export const weekdayGuides: DayGuide[] = [
  { weekday: 0, deityName: 'Surya', title: 'Sunday · Surya Dev', blurb: 'Begin the week honouring the Sun — health, vitality and clarity.', trackIds: ['gayatri-mantra'], mantra: 'ॐ सूर्याय नमः' },
  { weekday: 1, deityName: 'Shiva', deityId: 'shiva', title: 'Monday · Mahadev', blurb: 'Somvar belongs to Shiva — offer water, seek stillness and release.', trackIds: ['om-jai-shiv-omkara', 'mahamrityunjaya'], mantra: 'ॐ नमः शिवाय' },
  { weekday: 2, deityName: 'Hanuman', deityId: 'hanuman', title: 'Tuesday · Hanuman', blurb: 'Mangalwar for Hanuman & the Mother — courage, strength, protection.', trackIds: ['hanuman-chalisa'], mantra: 'ॐ हं हनुमते नमः' },
  { weekday: 3, deityName: 'Ganesha', deityId: 'ganesha', title: 'Wednesday · Ganesha', blurb: 'Budhwar for Ganesha — clear obstacles before new beginnings.', trackIds: ['ganapati-mantra', 'jai-ganesh'], mantra: 'ॐ गं गणपतये नमः' },
  { weekday: 4, deityName: 'Vishnu / Guru', deityId: 'krishna', title: 'Thursday · Vishnu', blurb: 'Guruvar for Vishnu and the guru — wisdom, gratitude, devotion.', trackIds: ['vasudeva-mantra', 'achyutam-keshavam'], mantra: 'ॐ नमो भगवते वासुदेवाय' },
  { weekday: 5, deityName: 'Lakshmi / Durga', deityId: 'lakshmi', title: 'Friday · Devi', blurb: 'Shukrawar for the Goddess — abundance, grace and the Divine Mother.', trackIds: ['jai-ambe-gauri'], mantra: 'ॐ श्रीं महालक्ष्म्यै नमः' },
  { weekday: 6, deityName: 'Shani / Hanuman', deityId: 'hanuman', title: 'Saturday · Shani', blurb: 'Shanivar for Shani & Hanuman — patience, discipline, letting go of fear.', trackIds: ['hanuman-chalisa', 'raghupati-raghav'], mantra: 'ॐ शं शनैश्चराय नमः' },
];

export const guideForWeekday = (weekday: number) =>
  weekdayGuides.find((g) => g.weekday === weekday) ?? weekdayGuides[0];

export type FestivalEntry = {
  occasion: Occasion;
  name: string;
  date: string; // 'YYYY-MM-DD' (illustrative for the year — confirm the tithi annually)
  deityId?: string;
  blurb: string;
  pujaFlowId?: string;
  trackIds?: string[];
};

export const festivals: FestivalEntry[] = [
  { occasion: 'maha-shivratri', name: 'Maha Shivratri', date: '2026-02-15', deityId: 'shiva', blurb: 'The great night of Shiva — fasting, a night-long vigil and abhishekam.', trackIds: ['om-jai-shiv-omkara', 'mahamrityunjaya'] },
  { occasion: 'ram-navami', name: 'Ram Navami', date: '2026-03-26', deityId: 'hanuman', blurb: 'The birth of Shri Ram — recitation, bhajan and a day of fasting.', trackIds: ['raghupati-raghav', 'hanuman-chalisa'] },
  { occasion: 'hanuman-jayanti', name: 'Hanuman Jayanti', date: '2026-04-02', deityId: 'hanuman', blurb: 'Hanuman’s appearance day — the Chalisa, sindoor and offerings of strength.', trackIds: ['hanuman-chalisa'] },
  { occasion: 'janmashtami', name: 'Krishna Janmashtami', date: '2026-09-04', deityId: 'krishna', blurb: 'Krishna’s midnight birth — jhanki, bhajan and a joyful fast.', trackIds: ['achyutam-keshavam', 'vasudeva-mantra'] },
  { occasion: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', date: '2026-09-14', deityId: 'ganesha', blurb: 'Welcome Bappa home — sthapana, daily aarti and a loving visarjan.', pujaFlowId: 'ganesh-chaturthi', trackIds: ['jai-ganesh', 'ganapati-mantra'] },
  { occasion: 'navratri', name: 'Sharad Navratri', date: '2026-10-11', deityId: 'durga', blurb: 'Nine nights of the Mother — Durga puja, fasting and Garba.', trackIds: ['jai-ambe-gauri'] },
  { occasion: 'diwali', name: 'Diwali · Lakshmi Puja', date: '2026-11-08', deityId: 'lakshmi', blurb: 'The festival of light — Lakshmi puja, rows of diyas and aarti.', pujaFlowId: 'diwali-lakshmi-puja', trackIds: ['om-jai-jagdish'] },
];

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;

export const festivalOn = (date = new Date()) => festivals.find((f) => f.date === dayKey(date));

// Composite "today" guidance: the always-correct weekday guide + any festival today.
export function todayGuide(date = new Date()) {
  return { weekday: guideForWeekday(date.getDay()), festival: festivalOn(date) };
}
