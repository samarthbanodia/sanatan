// Licensing ledger — the legal backbone for a commercial product.
// Every audio asset in the catalog references a ledger row by id. Nothing ships
// without one. This lets us swap sources (royalty-free → commissioned → label) with
// zero catalog rework, and survive a legal review.

export type LicenseType =
  | 'royalty-free' // Hoopr, Pixabay, Storyblocks, TunePocket
  | 'ai-generated' // Suno Pro / Udio (paid tier = commercial license)
  | 'public-domain' // archive.org, CC0
  | 'commissioned' // original studio recording we own outright
  | 'label-licensed'; // T-Series / Times / Saregama via IPRS/PPL

export type AllowedUse = {
  streaming: boolean;
  offline: boolean; // can the user download it (premium feature)?
  redistribution: boolean;
};

export type LicenseEntry = {
  id: string;
  asset: string; // human-readable label
  source: string; // where it came from
  licenseType: LicenseType;
  url?: string; // source URL or contract location
  contractRef?: string; // PO / contract / order id
  artist?: string;
  attributionRequired: boolean;
  allowedUse: AllowedUse;
  costInr?: number;
  acquiredOn?: string; // ISO date
  expiresOn?: string | null; // null = perpetual
  notes?: string;
};

// Seed rows are illustrative placeholders showing the required shape — real entries
// are added as each asset is actually acquired during M1.
export const ledger: LicenseEntry[] = [
  {
    id: 'lic-rf-ganesha-instrumental',
    asset: 'Ganesha aarti — instrumental bed',
    source: 'Hoopr.ai (devotional)',
    licenseType: 'royalty-free',
    url: 'https://hoopr.ai/genres/devotional',
    attributionRequired: false,
    allowedUse: { streaming: true, offline: true, redistribution: false },
    acquiredOn: undefined,
    expiresOn: null,
    notes: 'PLACEHOLDER — replace with the actual downloaded track + license id once acquired.',
  },
  {
    id: 'lic-pd-om-chant',
    asset: 'Om — ambient chant',
    source: 'archive.org (public domain)',
    licenseType: 'public-domain',
    attributionRequired: false,
    allowedUse: { streaming: true, offline: true, redistribution: true },
    expiresOn: null,
    notes: 'PLACEHOLDER — confirm public-domain status of the specific recording.',
  },
  // ── Suno Pro pilot batch (generate → QA pronunciation → host on R2 → fill url) ──
  {
    id: 'lic-ai-jai-ganesh-vocal',
    asset: 'Jai Ganesh Deva — aarti (sung)',
    source: 'Suno Pro',
    licenseType: 'ai-generated',
    attributionRequired: false,
    allowedUse: { streaming: true, offline: true, redistribution: false },
    expiresOn: null,
    notes: 'PILOT — generated under paid (commercial) Suno; set acquiredOn + contractRef (Suno gen URL) once rendered + QA-passed.',
  },
  {
    id: 'lic-ai-achyutam-vocal',
    asset: 'Achyutam Keshavam — bhajan (sung)',
    source: 'Suno Pro',
    licenseType: 'ai-generated',
    attributionRequired: false,
    allowedUse: { streaming: true, offline: true, redistribution: false },
    expiresOn: null,
    notes: 'Famous recorded bhajan — Suno flags it; LICENSED ROUTE later (royalty-free bed + own vocal). Not generated via Suno.',
  },

  // ── Clean Suno mantra pilot — each track ships a majestic + basic rendition ──
  ...sunoRendition('gayatri', 'Gayatri Mantra'),
  ...sunoRendition('ganapati', 'Ganapati Mantra (Om Gam Ganapataye Namah)'),
  ...sunoRendition('vasudeva', 'Vasudeva Mantra (Om Namo Bhagavate Vasudevaya)'),
];

// Two ledger rows (majestic + basic) for one Suno-generated mantra. Fill acquiredOn +
// contractRef (Suno generation URL) on each once the take is rendered and QA-passed.
function sunoRendition(slug: string, asset: string): LicenseEntry[] {
  return (['majestic', 'basic'] as const).map((r) => ({
    id: `lic-ai-${slug}-${r}`,
    asset: `${asset} — ${r} rendition`,
    source: 'Suno Pro',
    licenseType: 'ai-generated' as const,
    attributionRequired: false,
    allowedUse: { streaming: true, offline: true, redistribution: false },
    expiresOn: null,
    notes: 'PILOT — paid (commercial) Suno; set acquiredOn + contractRef (Suno gen URL) after render + pronunciation QA.',
  }));
}

export const licenseFor = (id: string): LicenseEntry | undefined =>
  ledger.find((e) => e.id === id);

// Dev-time guard: surface any audio referencing a missing ledger row.
// Call during catalog validation / tests — never let an unlicensed asset reach users.
export function assertLicensed(audio: { ledgerId?: string; url?: string }): boolean {
  if (!audio.ledgerId || !licenseFor(audio.ledgerId)) {
    if (__DEV__) {
      console.warn(`[licensing] audio "${audio.url ?? '?'}" has no valid ledger entry — must not ship.`);
    }
    return false;
  }
  return true;
}
