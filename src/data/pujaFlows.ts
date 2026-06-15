// Puja flows — ordered "do my whole pooja" experiences for an occasion.
// A flow is a sequence of ritual steps, each pointing at a catalog track or an inline mantra.
// Steps that still need a dedicated catalog track carry a `note` flagging it.

import { Occasion, RitualStep } from './taxonomy';

export type PujaFlowRef =
  | { kind: 'track'; trackId: string }
  | { kind: 'mantra'; text: string; transliteration?: string };

export type PujaFlowStep = {
  ritualStep: RitualStep;
  title: string;
  ref: PujaFlowRef;
  note?: string;
};

export type PujaFlow = {
  id: string;
  title: string;
  occasion: Occasion;
  deityId?: string;
  description: string;
  steps: PujaFlowStep[];
};

export const pujaFlows: PujaFlow[] = [
  {
    id: 'ganesh-chaturthi',
    title: 'Ganesh Chaturthi Puja',
    occasion: 'ganesh-chaturthi',
    deityId: 'ganesha',
    description: 'Welcome Bappa home — invocation, meditation, aarti, and a loving farewell.',
    steps: [
      {
        ritualStep: 'sankalp',
        title: 'Sankalp',
        ref: { kind: 'mantra', text: 'ॐ गं गणपतये नमः', transliteration: 'Om Gam Ganapataye Namah' },
        note: 'Set your intention with three repetitions.',
      },
      {
        ritualStep: 'dhyan',
        title: 'Dhyana Shloka',
        ref: {
          kind: 'mantra',
          text: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
          transliteration: 'Vakratunda Mahakaya Suryakoti Samaprabha\nNirvighnam Kuru Me Deva Sarvakaryeshu Sarvada',
        },
      },
      { ritualStep: 'aarti', title: 'Aarti', ref: { kind: 'track', trackId: 'jai-ganesh' } },
      {
        ritualStep: 'prasad',
        title: 'Prasad',
        ref: { kind: 'mantra', text: 'Offer modak and durva grass.' },
        note: 'Audio optional.',
      },
      {
        ritualStep: 'visarjan',
        title: 'Visarjan',
        ref: { kind: 'mantra', text: 'गणपति बाप्पा मोरया, पुढच्या वर्षी लवकर या' , transliteration: 'Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya' },
        note: 'Needs a dedicated visarjan track in the catalog.',
      },
    ],
  },
  {
    id: 'diwali-lakshmi-puja',
    title: 'Diwali · Lakshmi Puja',
    occasion: 'diwali',
    deityId: 'lakshmi',
    description: 'Invite Maa Lakshmi into a home of light — diya, mantra, and aarti.',
    steps: [
      {
        ritualStep: 'sankalp',
        title: 'Sankalp',
        ref: { kind: 'mantra', text: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद', transliteration: 'Om Shreem Hreem Shreem Kamale Kamalalaye Praseed Praseed' },
      },
      {
        ritualStep: 'dhyan',
        title: 'Lakshmi Beej Mantra',
        ref: { kind: 'mantra', text: 'ॐ श्रीं महालक्ष्म्यै नमः', transliteration: 'Om Shreem Mahalakshmyai Namah' },
        note: 'Needs a dedicated japa/chant track.',
      },
      {
        ritualStep: 'aarti',
        title: 'Aarti',
        ref: { kind: 'track', trackId: 'om-jai-jagdish' },
        note: 'Placeholder — replace with a dedicated "Om Jai Lakshmi Mata" aarti track.',
      },
    ],
  },
];

export const pujaFlowById = (id: string) => pujaFlows.find((f) => f.id === id);
export const pujaFlowsForOccasion = (o: Occasion) => pujaFlows.filter((f) => f.occasion === o);
