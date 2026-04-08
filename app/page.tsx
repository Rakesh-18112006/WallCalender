'use client';

import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';

const MONTHS_DATA = [
  { name: 'January', num: '01', days: 31, offset: 4, theme: '#B3C3D9', heroImg: 'https://images.unsplash.com/photo-1478719059408-592965723cbc?q=80&w=800' },
  { name: 'February', num: '02', days: 28, offset: 0, theme: '#D9C8B3', heroImg: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800' },
  { name: 'March', num: '03', days: 31, offset: 0, theme: '#B5D9B3', heroImg: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800' },
  { name: 'April', num: '04', days: 30, offset: 3, theme: '#D9B3C8', heroImg: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=800' },
  { name: 'May', num: '05', days: 31, offset: 5, theme: '#B3D9D2', heroImg: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=800' },
  { name: 'June', num: '06', days: 30, offset: 1, theme: '#D9D9B3', heroImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800' },
  { name: 'July', num: '07', days: 31, offset: 3, theme: '#C8B3D9', heroImg: 'https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=800' },
  { name: 'August', num: '08', days: 31, offset: 6, theme: '#D9BEB3', heroImg: 'https://images.unsplash.com/photo-1473283147055-e39c51470700?q=80&w=800' },
  { name: 'September', num: '09', days: 30, offset: 2, theme: '#D9AC8B', heroImg: 'https://images.unsplash.com/photo-1444465693019-aa0b6392460a?q=80&w=800' },
  { name: 'October', num: '10', days: 31, offset: 4, theme: '#D98B2A', heroImg: 'https://images.unsplash.com/photo-1508344928928-7137b29de218?q=80&w=800' },
  { name: 'November', num: '11', days: 30, offset: 0, theme: '#A69E96', heroImg: 'https://images.unsplash.com/photo-1511268594014-0e9d3ea5c33b?q=80&w=800' },
  { name: 'December', num: '12', days: 31, offset: 2, theme: '#A6BBD9', heroImg: 'https://images.unsplash.com/photo-1512349581898-1e42841074e5?q=80&w=800' }
];

// --- Global Date & Range Selection Store ---
type DateSelection = { mIdx: number; day: number };
type SelectionState = { start: DateSelection | null; end: DateSelection | null };

let globalSelection: SelectionState = { start: null, end: null };
let globalHover: DateSelection | null = null;
const eventTarget = typeof window !== 'undefined' ? new EventTarget() : null;

function loadGlobalSelection() {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem('calendar-selection');
  if (saved) {
    try {
      globalSelection = JSON.parse(saved);
      eventTarget?.dispatchEvent(new Event('calendar-selection'));
    } catch {}
  }
}

function updateSelection(day: number, mIdx: number) {
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

function updateHover(day: number | null, mIdx: number | null) {
  if (day !== null && mIdx !== null) {
    if (globalHover?.day === day && globalHover?.mIdx === mIdx) return;
    globalHover = { mIdx, day };
  } else {
    if (globalHover === null) return;
    globalHover = null;
  }
  eventTarget?.dispatchEvent(new Event('calendar-hover'));
}

function getSelectionRangeLabel(sel: SelectionState): string {
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

// --- Note CRUD types ---
interface NoteItem {
  id: string;
  text: string;
  dateRange: string;
  createdAt: number;
}

function loadNotes(mIdx: number): NoteItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(`cal-notes-${mIdx}`);
  if (raw) { try { return JSON.parse(raw); } catch {} }
  return [];
}

function saveNotes(mIdx: number, notes: NoteItem[]) {
  localStorage.setItem(`cal-notes-${mIdx}`, JSON.stringify(notes));
}

// --- Shared Month Calendar Component ---
const MonthContent = ({ mIdx }: { mIdx: number }) => {
  const mData = MONTHS_DATA[mIdx];
  const [sel, setSel] = useState<SelectionState>(globalSelection);
  const [hover, setHover] = useState<DateSelection | null>(globalHover);
  const notesRef = useRef<HTMLElement>(null);

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newText, setNewText] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const el = notesRef.current;
    if (el) {
      const stop = (e: Event) => e.stopPropagation();
      el.addEventListener('mousedown', stop);
      el.addEventListener('touchstart', stop);
      el.addEventListener('pointerdown', stop);
      el.addEventListener('wheel', stop);
      return () => {
        el.removeEventListener('mousedown', stop);
        el.removeEventListener('touchstart', stop);
        el.removeEventListener('pointerdown', stop);
        el.removeEventListener('wheel', stop);
      };
    }
  }, []);

  useEffect(() => {
    setNotes(loadNotes(mIdx));
    const onSel = () => setSel({ ...globalSelection });
    const onHover = () => setHover(globalHover ? { ...globalHover } : null);
    eventTarget?.addEventListener('calendar-selection', onSel);
    eventTarget?.addEventListener('calendar-hover', onHover);
    return () => {
      eventTarget?.removeEventListener('calendar-selection', onSel);
      eventTarget?.removeEventListener('calendar-hover', onHover);
    };
  }, [mIdx]);

  const flashSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1800);
  };

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    const item: NoteItem = {
      id: Date.now().toString(),
      text: trimmed,
      dateRange: getSelectionRangeLabel(sel),
      createdAt: Date.now(),
    };
    const updated = [...notes, item];
    setNotes(updated);
    saveNotes(mIdx, updated);
    setNewText('');
    flashSaved();
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(mIdx, updated);
  };

  const handleEditStart = (n: NoteItem) => {
    setEditId(n.id);
    setEditText(n.text);
  };

  const handleEditSave = () => {
    if (!editId) return;
    const updated = notes.map((n) =>
      n.id === editId ? { ...n, text: editText.trim() || n.text } : n
    );
    setNotes(updated);
    saveNotes(mIdx, updated);
    setEditId(null);
    setEditText('');
    flashSaved();
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditText('');
  };

  const getDayClass = (day: number, index: number) => {
    const isWeekend = index % 7 === 0;
    const dateVal = mIdx * 100 + day;
    const startVal = sel.start ? sel.start.mIdx * 100 + sel.start.day : null;
    const endVal = sel.end ? sel.end.mIdx * 100 + sel.end.day : null;
    const hoverVal = hover ? hover.mIdx * 100 + hover.day : null;

    let c = 'day-cell';
    const now = new Date();
    if (mIdx === now.getMonth() && day === now.getDate()) c += ' current-day';
    if (isWeekend) c += ' weekend';
    if (startVal === dateVal) c += ' start-date';
    if (endVal === dateVal) c += ' end-date';

    if (startVal && endVal && dateVal > startVal && dateVal < endVal) {
      c += ' in-range';
    } else if (startVal && !endVal && hoverVal) {
      if (dateVal > startVal && dateVal <= hoverVal) c += ' in-range';
      if (dateVal < startVal && dateVal >= hoverVal) c += ' in-range';
    }
    return c;
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]" style={{ '--theme-color': mData.theme } as React.CSSProperties}>
      <header className="relative h-[140px] sm:h-[220px] min-h-[140px] sm:min-h-[220px] bg-cover bg-center z-10" style={{ backgroundImage: `url(${mData.heroImg})` }} />
      
      <main className="flex flex-col px-4 pt-2 pb-4 flex-1 min-h-0 overflow-hidden relative select-none">
        <div className="flex justify-between items-baseline pb-2 mb-2 sm:mb-4 border-b border-[var(--grid-border)] z-10">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className="text-3xl sm:text-4xl font-light text-[#c9bcaa] leading-[0.8]">{mData.num}</span>
            <span className="text-base sm:text-xl font-bold text-[var(--text-main)]">{mData.name}</span>
          </div>
          <div className="text-sm sm:text-lg font-bold text-[var(--text-main)]">2026</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 flex-1 min-h-0 overflow-hidden">
          {/* Calendar Grid */}
          <section className="flex-[1.5] flex flex-col min-h-0 overflow-hidden">
            <div className="grid grid-cols-7 text-center font-semibold text-[10px] sm:text-xs text-[var(--text-main)] mb-1 sm:mb-2">
              <span className="text-[var(--accent)]">Su</span>
              <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            
            <div className="grid grid-cols-7 grid-rows-6 border-t border-l border-[var(--grid-border)] bg-[var(--bg-primary)] flex-1 min-h-[140px] sm:min-h-[160px]">
              {Array.from({ length: mData.offset }).map((_, i) => (
                <div key={`e-${i}`} className="day-cell empty" />
              ))}
              {Array.from({ length: mData.days }).map((_, i) => {
                const day = i + 1;
                const dow = (mData.offset + i) % 7;
                return (
                  <div
                    key={`d-${day}`}
                    className={getDayClass(day, dow)}
                    onClick={(e) => { e.stopPropagation(); updateSelection(day, mIdx); }}
                    onMouseEnter={() => updateHover(day, mIdx)}
                    onMouseLeave={() => updateHover(null, null)}
                  >
                    {day}
                  </div>
                );
              })}
              {Array.from({ length: 42 - (mData.offset + mData.days) }).map((_, i) => (
                <div key={`ee-${i}`} className="day-cell empty" />
              ))}
            </div>
          </section>

          {/* Notes Section */}
          <aside className="flex-[1.5] flex flex-col border border-[var(--grid-border)] bg-[#FEFCF5] rounded shadow-sm p-2 sm:p-3 relative gap-1 sm:gap-2 overflow-hidden min-h-[100px] sm:min-h-[120px]" ref={notesRef}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 -rotate-1 w-12 h-4 bg-white/70 shadow-sm rounded-sm hidden sm:block" />
            <div className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider border-b border-black/5 pb-1">Notes</div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-1">
              {notes.length === 0 && (
                <p className="text-[10px] text-[var(--text-muted)] italic text-center py-2">No notes yet.</p>
              )}
              {notes.map((n) => (
                <div key={n.id} className="relative group p-1.5 border-b border-dashed border-black/5 flex flex-col gap-1">
                  {editId === n.id ? (
                    <div className="flex flex-col gap-1">
                      <input
                        className="w-full text-xs font-['Caveat'] p-1 border border-[var(--grid-border)] rounded outline-none"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                        autoFocus
                      />
                      <div className="flex gap-1 justify-end">
                        <button className="w-5 h-5 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded" onClick={handleEditSave}>✓</button>
                        <button className="w-5 h-5 flex items-center justify-center bg-red-50 text-red-600 rounded" onClick={handleEditCancel}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {n.dateRange && (
                        <span className="text-[8px] font-bold text-[var(--selection-main)] bg-[var(--selection-bg)] px-1.5 py-0.5 rounded w-fit">{n.dateRange}</span>
                      )}
                      <p className="text-xs text-[var(--text-main)] leading-tight font-['Caveat'] pr-8 truncate overflow-hidden whitespace-normal">{n.text}</p>
                      <div className="flex gap-1 absolute right-1 top-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button className="w-4 h-4 flex items-center justify-center bg-black/5 hover:bg-black/10 rounded text-[10px]" onClick={() => handleEditStart(n)}>✎</button>
                        <button className="w-4 h-4 flex items-center justify-center bg-black/5 hover:bg-red-50 hover:text-red-500 rounded text-[10px]" onClick={() => handleDelete(n.id)}>🗑</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1 sm:gap-2 mt-auto pt-2 border-t border-black/5">
              <textarea
                className="w-full text-xs p-1.5 border border-black/10 rounded outline-none focus:border-[var(--selection-main)] resize-none"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Write a note…"
                rows={1}
              />
              <div className="flex justify-between items-center">
                <span className={`text-[9px] text-emerald-500 font-bold transition-opacity ${savedToast ? 'opacity-100' : 'opacity-0'}`}>✓ Saved!</span>
                <button className="px-3 py-1 bg-[var(--selection-main)] text-white text-[10px] font-bold rounded hover:bg-[#D45A44] transition-colors" onClick={handleAdd}>Save</button>
              </div>
            </div>
          </aside>
        </div>

        <div className="text-[10px] text-[var(--text-muted)] mt-2 sm:mt-4 ml-1">
          {mIdx === 0 && "Jan 1: New Year's Day"}
          {mIdx === 1 && "Feb 14: Valentine's Day"}
          {mIdx === 10 && "Nov 26: Thanksgiving"}
          {mIdx === 11 && "Dec 25: Christmas Day"}
        </div>
      </main>
    </div>
  );
};

// --- Desktop Page (flipbook leaf) ---
const DesktopPageUI = forwardRef((props: any, ref: any) => (
  <div className="calendar-flipbook-page" ref={ref} data-density="soft">
    <div className="flipbook-derotated-page">
      <MonthContent mIdx={props.mIdx} />
    </div>
  </div>
));
DesktopPageUI.displayName = 'DesktopPageUI';

// --- Easing function for JS animation ---
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ===================================================
// MOBILE FLIPBOOK — Custom CSS 3D (no library needed)
// Same animation quality as desktop, touch swipe support.
// ===================================================


// ===================================================
// MAIN ENTRY — Desktop uses react-pageflip,
// Mobile/Tablet uses custom CSS 3D flipbook.
// ===================================================
export default function CalendarPage() {
  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wheelLock = useRef<boolean>(false);
  const pageRef = useRef<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  // For backward flip: show old month as animated overlay
  const [prevAnim, setPrevAnim] = useState<number | null>(null);
  const animRef = useRef(false);

  useEffect(() => {
    loadGlobalSelection();
    setIsMounted(true);
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-page-turn-single-1104.mp3');
    audioRef.current.volume = 0.5;
    const checkView = () => setIsMobileView(window.innerWidth <= 768);
    checkView();
    window.addEventListener('resize', checkView);
    return () => window.removeEventListener('resize', checkView);
  }, []);

  const playFlipSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const onFlip = useCallback((e: any) => {
    pageRef.current = e.data;
    setCurrentPage(e.data);
  }, []);

  const onChangeState = useCallback((e: any) => {
    if (e.data === 'flipping') playFlipSound();
  }, [playFlipSound]);

  // FORWARD: use react-pageflip flipNext
  const goNext = useCallback(() => {
    if (pageRef.current >= MONTHS_DATA.length - 1) return;
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

  // BACKWARD: Overlay old page + turnToPrevPage + CSS peel animation
  const goPrev = useCallback(() => {
    if (animRef.current || pageRef.current <= 0) return;
    animRef.current = true;
    playFlipSound();
    const oldPageIdx = pageRef.current;
    setPrevAnim(oldPageIdx);
    const pf = bookRef.current?.pageFlip();
    if (pf) {
      pf.turnToPrevPage();
      pageRef.current = oldPageIdx - 1;
      setCurrentPage(oldPageIdx - 1);
    }
    setTimeout(() => {
      setPrevAnim(null);
      animRef.current = false;
    }, 850);
  }, [playFlipSound]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (wheelLock.current) return;
    if (Math.abs(e.deltaY) < 30) return;
    wheelLock.current = true;
    setTimeout(() => { wheelLock.current = false; }, 900);
    if (e.deltaY > 0) goNext();
    else goPrev();
  }, [goNext, goPrev]);

  return (
    <>
      <div className="room-environment" />
      <div className="room-lighting" />

      <div className="wall-calendar-wrapper" onWheel={handleWheel}>
        <div className="spiral-binding-top" />
        <div className="calendar-flipbook-container">
          {prevAnim !== null && (
            <div className="prev-flip-overlay">
              <div className="prev-flip-page">
                <MonthContent mIdx={prevAnim} />
              </div>
            </div>
          )}
          <div className="flipbook-rotated-wrapper">
            {isMounted && (
              /* @ts-ignore */
              <HTMLFlipBook
                width={510} height={340} size="fixed"
                minWidth={510} maxWidth={510} minHeight={340} maxHeight={340}
                showCover={false} usePortrait={true}
                drawShadow={true} flippingTime={1000} maxShadowOpacity={0.5}
                mobileScrollSupport={false} style={{}}
                startPage={0} startZIndex={0} autoSize={false}
                clickEventForward={true} useMouseEvents={!isMobileView}
                swipeDistance={30} showPageCorners={true}
                disableFlipByClick={true}
                onFlip={onFlip} onChangeState={onChangeState}
                ref={bookRef} className="flipbook-engine"
              >
                {MONTHS_DATA.map((_, i) => (
                  <DesktopPageUI key={`dp-${i}`} mIdx={i} />
                ))}
              </HTMLFlipBook>
            )}
          </div>
        </div>

        {/* Improved Mobile Navigation (Attached below calendar) */}
        <div className="flex md:hidden mt-10 mb-20 items-center justify-between gap-5 bg-white/95 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-[var(--grid-border)] w-[280px] self-center">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[var(--grid-border)] text-[var(--text-main)] active:scale-90 transition-transform disabled:opacity-30"
            onClick={goPrev}
            disabled={pageRef.current <= 0}
          >
            <span className="rotate-180">▼</span>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Month</span>
            <span className="text-sm font-bold min-w-[80px] text-center">
              {MONTHS_DATA[currentPage]?.name}
            </span>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[var(--grid-border)] text-[var(--text-main)] active:scale-90 transition-transform disabled:opacity-30"
            onClick={goNext}
            disabled={pageRef.current >= MONTHS_DATA.length - 1}
          >▼</button>
        </div>
      </div>
    </>
  );
}
