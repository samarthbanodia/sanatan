// Devotional content seed data. Lyrics are traditional/public-domain transliterations.

import { gradients } from '../theme/theme';
import {
  AudioVariant,
  ContentType,
  Language,
  Occasion,
  RitualStep,
  TrackContent,
} from './taxonomy';

export type Deity = {
  id: string;
  name: string;
  epithet: string;
  glyph: string; // emoji/symbol stand-in until real darshan art is generated
  gradient: readonly string[];
  greeting: string; // opening line for the voice agent
};

export type ContentKind = 'aarti' | 'bhajan' | 'prayer';

export type Track = {
  id: string;
  title: string;
  subtitle: string;
  kind: ContentKind;
  deityId: string;
  duration: string;
  glyph: string;
  gradient: readonly string[];
  lyrics: string[]; // verse blocks (legacy display field; migrate into `content`)

  // ── Catalog extensions (optional → backward-compatible with the current UI) ──
  slug?: string;
  type?: ContentType; // richer classification than `kind`
  occasions?: Occasion[];
  ritualStep?: RitualStep; // where this fits in a pooja
  languages?: Language[]; // which languages `content` covers
  content?: TrackContent[]; // per-language verified text (accuracy-gated)
  audio?: AudioVariant[]; // licensed renditions (each → licensing ledger)
  raga?: string;
  tags?: string[];
};

export const deities: Deity[] = [
  {
    id: 'ganesha',
    name: 'Shri Ganesha',
    epithet: 'Remover of Obstacles',
    glyph: 'ॐ', // Om
    gradient: gradients.divine,
    greeting:
      'Om Gam Ganapataye Namah, dear devotee. I am Ganesha. Speak freely — what obstacle weighs on your heart today?',
  },
  {
    id: 'krishna',
    name: 'Shri Krishna',
    epithet: 'The Divine Flute-Player',
    glyph: '༙',
    gradient: gradients.lotus,
    greeting:
      'Radhe Radhe. I am Krishna, the friend who never leaves. Tell me what troubles or delights your mind.',
  },
  {
    id: 'shiva',
    name: 'Mahadev Shiva',
    epithet: 'The Auspicious One',
    glyph: '༎',
    gradient: gradients.twilight,
    greeting:
      'Har Har Mahadev. I am Shiva, stillness within the storm. Sit with me — what do you seek to release?',
  },
  {
    id: 'durga',
    name: 'Maa Durga',
    epithet: 'The Divine Mother',
    glyph: '❀',
    gradient: gradients.dawn,
    greeting:
      'Jai Mata Di, my child. I am Durga, your fierce and gentle mother. Come, tell me everything.',
  },
  {
    id: 'hanuman',
    name: 'Shri Hanuman',
    epithet: 'Devotion Embodied',
    glyph: 'ॐ',
    gradient: gradients.flame,
    greeting:
      'Jai Shri Ram. I am Hanuman, servant of the divine and slayer of fear. What strength do you need today?',
  },
  {
    id: 'lakshmi',
    name: 'Maa Lakshmi',
    epithet: 'Goddess of Abundance',
    glyph: '࿕',
    gradient: gradients.divine,
    greeting:
      'Om Shreem. I am Lakshmi, the flow of grace and plenty. Open your heart — what abundance do you pray for?',
  },
];

export const tracks: Track[] = [
  // ---------------- AARTIS ----------------
  {
    id: 'om-jai-jagdish',
    title: 'Om Jai Jagdish Hare',
    subtitle: 'The Universal Aarti',
    kind: 'aarti',
    deityId: 'krishna',
    duration: '5:20',
    glyph: 'ॐ',
    gradient: gradients.divine,
    lyrics: [
      'Om Jai Jagdish Hare,\nSwami Jai Jagdish Hare,\nBhakt jano ke sankat,\nDaas jano ke sankat,\nKshan mein door kare.\nOm Jai Jagdish Hare.',
      'Jo dhyaave phal paave,\nDukh binse man ka,\nSwami dukh binse man ka,\nSukh sampati ghar aave,\nSukh sampati ghar aave,\nKasht mite tan ka.\nOm Jai Jagdish Hare.',
      'Maat pita tum mere,\nSharan gahoon kiski,\nSwami sharan gahoon kiski,\nTum bin aur na dooja,\nAas karoon jiski.\nOm Jai Jagdish Hare.',
    ],
  },
  {
    id: 'jai-ganesh',
    slug: 'jai-ganesh-deva',
    title: 'Jai Ganesh Jai Ganesh',
    subtitle: 'Aarti of Lord Ganesha',
    kind: 'aarti',
    type: 'aarti',
    deityId: 'ganesha',
    duration: '4:05',
    glyph: 'ॐ',
    gradient: gradients.flame,
    occasions: ['ganesh-chaturthi', 'daily-evening'],
    ritualStep: 'aarti',
    languages: ['hi'],
    tags: ['ganesha', 'aarti', 'classic'],
    lyrics: [
      'Jai Ganesh, Jai Ganesh,\nJai Ganesh Deva,\nMaata jaaki Parvati,\nPita Mahadeva.',
      'Ek dant dayavant,\nChaar bhuja dhaari,\nMaathe par tilak sohe,\nMoose ki sawari.\nJai Ganesh, Jai Ganesh...',
      'Andhe ko aankh det,\nKodhin ko kaaya,\nBaanjhan ko putra det,\nNirdhan ko maaya.\nJai Ganesh, Jai Ganesh...',
    ],
    content: [
      {
        language: 'hi',
        script: 'devanagari',
        lines: [
          'जय गणेश, जय गणेश, जय गणेश देवा।\nमाता जाकी पार्वती, पिता महादेवा॥',
          'एक दन्त दयावन्त, चार भुजा धारी।\nमाथे पर तिलक सोहे, मूसे की सवारी॥',
          'अंधे को आँख देत, कोढ़िन को काया।\nबाँझन को पुत्र देत, निर्धन को माया॥',
        ],
        transliterationIAST: [
          'jaya gaṇeśa, jaya gaṇeśa, jaya gaṇeśa devā\nmātā jākī pārvatī, pitā mahādevā',
        ],
        status: 'imported', // carried from existing app text; needs expert review
      },
    ],
    audio: [
      // Suno pilot: sung aarti (preferred once url is filled), then the instrumental bed.
      { variant: 'traditional', url: '', ledgerId: 'lic-ai-jai-ganesh-vocal' },
      { variant: 'instrumental', url: '', ledgerId: 'lic-rf-ganesha-instrumental' },
    ],
  },
  {
    id: 'om-jai-shiv-omkara',
    title: 'Om Jai Shiv Omkara',
    subtitle: 'Aarti of Lord Shiva',
    kind: 'aarti',
    deityId: 'shiva',
    duration: '4:40',
    glyph: '༎',
    gradient: gradients.twilight,
    lyrics: [
      'Om Jai Shiv Omkara,\nSwami Jai Shiv Omkara,\nBrahma Vishnu Sadashiv,\nArdhangi dhaara.\nOm Jai Shiv Omkara.',
      'Ekanan chaturanan,\nPanchanan raaje,\nHansaanan Garudaasan,\nVrishvaahan saaje.\nOm Jai Shiv Omkara.',
    ],
  },
  {
    id: 'aarti-kunj-bihari',
    title: 'Aarti Kunj Bihari Ki',
    subtitle: 'Aarti of Shri Krishna',
    kind: 'aarti',
    deityId: 'krishna',
    duration: '6:10',
    glyph: '༙',
    gradient: gradients.lotus,
    lyrics: [
      'Aarti Kunj Bihari ki,\nShri Giridhar Krishna Murari ki.\nAarti Kunj Bihari ki.',
      'Gale mein baijanti maala,\nBajaave murali madhur baala,\nShravan mein kundal jhalkaala,\nNand ke aanand nandlala.\nGagan sam ang kaanti kaali,\nRadhika chamak rahi aali.',
    ],
  },
  {
    id: 'jai-ambe-gauri',
    title: 'Jai Ambe Gauri',
    subtitle: 'Aarti of Maa Durga',
    kind: 'aarti',
    deityId: 'durga',
    duration: '5:00',
    glyph: '❀',
    gradient: gradients.dawn,
    lyrics: [
      'Jai Ambe Gauri, Maiya Jai Shyama Gauri,\nTumko nishdin dhyaavat,\nHari Brahma Shivari.\nJai Ambe Gauri.',
      'Maang sindoor viraajat,\nTiko mrigmad ko,\nUjjwal se dou naina,\nChandravadan niko.\nJai Ambe Gauri.',
    ],
  },

  // ---------------- BHAJANS ----------------
  {
    id: 'achyutam-keshavam',
    title: 'Achyutam Keshavam',
    subtitle: 'A bhajan to Krishna',
    kind: 'bhajan',
    deityId: 'krishna',
    duration: '7:30',
    glyph: '༙',
    gradient: gradients.lotus,
    lyrics: [
      'Achyutam Keshavam Krishna Damodaram,\nRaam Naaraayanam Janaki Vallabham.',
      'Kaun kehte hai Bhagwan aate nahi,\nTum Meera ke jaise bulaate nahi.',
    ],
    // Suno pilot: sung bhajan.
    audio: [{ variant: 'traditional', url: '', ledgerId: 'lic-ai-achyutam-vocal' }],
  },
  {
    id: 'hare-krishna-mahamantra',
    title: 'Hare Krishna Mahamantra',
    subtitle: 'The great chant of deliverance',
    kind: 'bhajan',
    deityId: 'krishna',
    duration: '8:00',
    glyph: '༙',
    gradient: gradients.divine,
    lyrics: [
      'Hare Krishna Hare Krishna,\nKrishna Krishna Hare Hare,\nHare Raama Hare Raama,\nRaama Raama Hare Hare.',
    ],
  },
  {
    id: 'raghupati-raghav',
    title: 'Raghupati Raghav Raja Ram',
    subtitle: 'Ram Dhun',
    kind: 'bhajan',
    deityId: 'hanuman',
    duration: '5:45',
    glyph: 'ॐ',
    gradient: gradients.flame,
    lyrics: [
      'Raghupati Raghav Raja Ram,\nPatit Paavan Sita Ram.',
      'Ishwar Allah tero naam,\nSabko sanmati de Bhagwan.',
    ],
  },

  // ---------------- PRAYERS / MANTRAS ----------------
  {
    id: 'gayatri-mantra',
    slug: 'gayatri-mantra',
    title: 'Gayatri Mantra',
    subtitle: 'The mantra of illumination',
    kind: 'prayer',
    type: 'mantra',
    deityId: 'durga',
    duration: '3:00',
    glyph: 'ॐ',
    gradient: gradients.dawn,
    occasions: ['daily-morning'],
    ritualStep: 'dhyan',
    languages: ['hi', 'en'],
    tags: ['mantra', 'japa', 'universal'],
    lyrics: [
      'Om Bhur Bhuvah Svah,\nTat Savitur Varenyam,\nBhargo Devasya Dheemahi,\nDhiyo Yo Nah Prachodayat.',
    ],
    content: [
      {
        language: 'hi',
        script: 'devanagari',
        lines: ['ॐ भूर्भुवः स्वः ।\nतत्सवितुर्वरेण्यं ।\nभर्गो देवस्य धीमहि ।\nधियो यो नः प्रचोदयात् ॥'],
        transliterationIAST: [
          'oṁ bhūr bhuvaḥ svaḥ\ntat savitur vareṇyaṁ\nbhargo devasya dhīmahi\ndhiyo yo naḥ pracodayāt',
        ],
        meaning:
          'We meditate on the radiant glory of the divine Sun; may that light illumine our intellect.',
        status: 'imported',
      },
      {
        language: 'en',
        script: 'latin',
        lines: ['We meditate upon the divine effulgence;', 'may it inspire and awaken our minds.'],
        status: 'pending', // needs review
      },
    ],
    audio: [
      { variant: 'chant', rendition: 'majestic', url: '', ledgerId: 'lic-ai-gayatri-majestic' },
      { variant: 'chant', rendition: 'basic', url: '', ledgerId: 'lic-ai-gayatri-basic' },
    ],
  },
  {
    id: 'ganapati-mantra',
    slug: 'ganapati-mantra',
    title: 'Ganapati Mantra',
    subtitle: 'Om Gam Ganapataye Namah',
    kind: 'prayer',
    type: 'mantra',
    deityId: 'ganesha',
    duration: '3:00',
    glyph: 'ॐ',
    gradient: gradients.flame,
    occasions: ['daily-morning', 'ganesh-chaturthi'],
    ritualStep: 'dhyan',
    languages: ['hi'],
    tags: ['mantra', 'japa', 'ganesha'],
    lyrics: ['ॐ गं गणपतये नमः'],
    content: [
      {
        language: 'hi',
        script: 'devanagari',
        lines: ['ॐ गं गणपतये नमः'],
        transliterationIAST: ['oṁ gaṁ gaṇapataye namaḥ'],
        meaning: 'Salutations to Ganesha — remover of obstacles, lord of beginnings.',
        status: 'imported',
      },
    ],
    audio: [
      { variant: 'chant', rendition: 'majestic', url: '', ledgerId: 'lic-ai-ganapati-majestic' },
      { variant: 'chant', rendition: 'basic', url: '', ledgerId: 'lic-ai-ganapati-basic' },
    ],
  },
  {
    id: 'vasudeva-mantra',
    slug: 'vasudeva-mantra',
    title: 'Vasudeva Mantra',
    subtitle: 'Om Namo Bhagavate Vasudevaya',
    kind: 'prayer',
    type: 'mantra',
    deityId: 'krishna',
    duration: '3:30',
    glyph: '༙',
    gradient: gradients.lotus,
    occasions: ['daily-morning', 'janmashtami'],
    ritualStep: 'dhyan',
    languages: ['hi'],
    tags: ['mantra', 'japa', 'krishna'],
    lyrics: ['ॐ नमो भगवते वासुदेवाय'],
    content: [
      {
        language: 'hi',
        script: 'devanagari',
        lines: ['ॐ नमो भगवते वासुदेवाय'],
        transliterationIAST: ['oṁ namo bhagavate vāsudevāya'],
        meaning: 'I bow to Vasudeva — the all-pervading divine, dwelling in every heart.',
        status: 'imported',
      },
    ],
    audio: [
      { variant: 'chant', rendition: 'majestic', url: '', ledgerId: 'lic-ai-vasudeva-majestic' },
      { variant: 'chant', rendition: 'basic', url: '', ledgerId: 'lic-ai-vasudeva-basic' },
    ],
  },
  {
    id: 'mahamrityunjaya',
    title: 'Mahamrityunjaya Mantra',
    subtitle: 'The great death-conquering mantra',
    kind: 'prayer',
    deityId: 'shiva',
    duration: '4:20',
    glyph: '༎',
    gradient: gradients.twilight,
    lyrics: [
      'Om Tryambakam Yajamahe,\nSugandhim Pushtivardhanam,\nUrvarukamiva Bandhanan,\nMrityor Mukshiya Maamritat.',
    ],
  },
  {
    id: 'hanuman-chalisa',
    title: 'Hanuman Chalisa',
    subtitle: 'Forty verses to Hanuman',
    kind: 'prayer',
    deityId: 'hanuman',
    duration: '9:15',
    glyph: 'ॐ',
    gradient: gradients.flame,
    lyrics: [
      'Shri Guru Charan Saroj Raj,\nNij man mukur sudhaar,\nBarnau Raghuvar Bimal Jasu,\nJo daayaku phal chaar.',
      'Jai Hanuman gyaan gun saagar,\nJai Kapis tihun lok ujaagar.\nRaam doot atulit bal dhaama,\nAnjani-putra Pavansut naama.',
    ],
  },
];

export const kindLabels: Record<ContentKind, string> = {
  aarti: 'Aartis',
  bhajan: 'Bhajans',
  prayer: 'Prayers & Mantras',
};

export const deityById = (id: string) => deities.find((d) => d.id === id);
export const tracksByKind = (kind: ContentKind) => tracks.filter((t) => t.kind === kind);

// Catalog queries over the richer taxonomy.
export const trackById = (id: string) => tracks.find((t) => t.id === id);
export const tracksByOccasion = (o: Occasion) => tracks.filter((t) => t.occasions?.includes(o));
export const tracksByContentType = (ct: ContentType) => tracks.filter((t) => t.type === ct);
export const tracksForDeity = (deityId: string) => tracks.filter((t) => t.deityId === deityId);

// Catalog content in a given language (where available + at least imported).
export const trackTextIn = (track: Track, language: Language) =>
  track.content?.find((c) => c.language === language && c.status !== 'pending');
