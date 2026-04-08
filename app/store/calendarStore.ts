import { DateSelection, SelectionState } from '../types';

export let globalSelection: SelectionState = { start: null, end: null };
export let globalHover: DateSelection | null = null;
export const eventTarget = typeof window !== 'undefined' ? new EventTarget() : null;

export function loadGlobalSelection() {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem('calendar-selection');
  if (saved) {
    try {
      globalSelection = JSON.parse(saved);
      eventTarget?.dispatchEvent(new Event('calendar-selection'));
    } catch {}
  }
}

export function updateSelection(day: number, mIdx: number) {
  if (!globalSelection.start || (globalSelection.start && globalSelection.end)) {
    globalSelection = { start: { mIdx, day }, end: null };
  } else {
    const startVal = globalSelection.start.mIdx * 100 + globalSelection.start.day;
    const currentVal = mIdx * 100 + day;
    if (currentVal < startVal) {
      globalSelection = { start: { mIdx, day }, end: globalSelection.start };
    } else {
      globalSelection = { start: globalSelection.start, end: { mIdx, day } };
    }
  }
  localStorage.setItem('calendar-selection', JSON.stringify(globalSelection));
  eventTarget?.dispatchEvent(new Event('calendar-selection'));
}

export function updateHover(day: number | null, mIdx: number | null) {
  if (day !== null && mIdx !== null) {
    if (globalHover?.day === day && globalHover?.mIdx === mIdx) return;
    globalHover = { mIdx, day };
  } else {
    if (globalHover === null) return;
    globalHover = null;
  }
  eventTarget?.dispatchEvent(new Event('calendar-hover'));
}

export function clearSelection() {
  globalSelection = { start: null, end: null };
  globalHover = null;
  localStorage.setItem('calendar-selection', JSON.stringify(globalSelection));
  eventTarget?.dispatchEvent(new Event('calendar-selection'));
  eventTarget?.dispatchEvent(new Event('calendar-hover'));
}
