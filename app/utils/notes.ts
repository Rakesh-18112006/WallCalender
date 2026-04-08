import { SelectionState, NoteItem } from '../types';
import { MONTHS_DATA } from '../mocks/monthsData';

export function getSelectionRangeLabel(sel: SelectionState): string {
  if (sel.start && sel.end) {
    const s = `${MONTHS_DATA[sel.start.mIdx].name.substring(0, 3)} ${sel.start.day}`;
    const e = `${MONTHS_DATA[sel.end.mIdx].name.substring(0, 3)} ${sel.end.day}`;
    return `${s} – ${e}`;
  }
  if (sel.start) {
    return `${MONTHS_DATA[sel.start.mIdx].name.substring(0, 3)} ${sel.start.day}`;
  }
  return '';
}

export function loadNotes(mIdx: number): NoteItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(`cal-notes-${mIdx}`);
  if (raw) { try { return JSON.parse(raw); } catch {} }
  return [];
}

export function saveNotes(mIdx: number, notes: NoteItem[]) {
  localStorage.setItem(`cal-notes-${mIdx}`, JSON.stringify(notes));
}
