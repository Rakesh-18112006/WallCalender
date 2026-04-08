export type DateSelection = { mIdx: number; day: number };
export type SelectionState = { start: DateSelection | null; end: DateSelection | null };

export interface NoteItem {
  id: string;
  text: string;
  dateRange: string;
  createdAt: number;
}

export interface GeometricHeroProps {
  monthName: string;
  monthNum: string;
  heroImg: string;
  themeColor: string;
}