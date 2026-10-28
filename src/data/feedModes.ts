import type { FeedFilters, FeedMode } from '../types';

export const MODES: { id: FeedMode; label: string; description: string }[] = [
  { id: 'for-you', label: 'For you', description: 'Your interests, plus a deliberate share of adjacent and unfamiliar ideas.' },
  { id: 'serendipity', label: 'Serendipity', description: 'Only ideas outside your chosen interests — each one explains why it may still matter to you.' },
  { id: 'contrarian', label: 'Contrarian', description: 'Debates, myths and counterintuitive ideas, with facts, evidence and opinion kept separate.' },
  { id: 'connect', label: 'Connect the dots', description: 'Ideas that link two different fields.' },
];

export function countFilters(f: FeedFilters) {
  return f.topics.length + f.difficulties.length + f.formats.length;
}

