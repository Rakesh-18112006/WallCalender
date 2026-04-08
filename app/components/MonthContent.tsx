import React, { useState, useRef, useEffect } from 'react';
import { MONTHS_DATA } from '../mocks/monthsData';
import { SelectionState, DateSelection, NoteItem } from '../types';
import { globalSelection, globalHover, eventTarget, updateSelection, updateHover } from '../store/calendarStore';
import { loadNotes, saveNotes, getSelectionRangeLabel } from '../utils/notes';

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
            
            <div className="grid grid-cols-7 grid-rows-6 border-t border-l border-[var(--grid-border)] bg-[var(--bg-primary)] flex-1 min-h-[120px] sm:min-h-[140px]">
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
                        className="w-full text-[10px] font-['Caveat'] p-1 border border-[var(--grid-border)] rounded outline-none"
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
                      <p className="text-[10px] text-[var(--text-main)] leading-tight font-['Caveat'] pr-8 truncate overflow-hidden whitespace-normal">{n.text}</p>
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
                className="w-full text-[10px] p-1.5 border border-black/10 rounded outline-none focus:border-[var(--selection-main)] resize-none"
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

        <div className="text-[10px] text-[var(--text-muted)] mt-2 sm:mt-3 ml-1 shrink-0 bg-[var(--bg-primary)] z-10 block">
          {mIdx === 0 && "Jan 1: New Year's Day"}
          {mIdx === 1 && "Feb 14: Valentine's Day"}
          {mIdx === 10 && "Nov 26: Thanksgiving"}
          {mIdx === 11 && "Dec 25: Christmas Day"}
        </div>
      </main>
    </div>
  );
};

export default MonthContent;
