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
    <div className="month-content" style={{ '--theme-color': mData.theme } as React.CSSProperties}>
      <header className="calendar-hero" style={{ backgroundImage: `url(${mData.heroImg})` }} />
      
      <main className="calendar-bottom">
        <div className="calendar-header">
          <div className="month-title">
            <span className="month-number">{mData.num}</span>
            <span className="month-name">{mData.name}</span>
          </div>
          <div className="year-title">2026</div>
        </div>

        <div className="calendar-body-layout">
          {/* Calendar Grid */}
          <section className="grid-section">
            <div className="weekdays">
              <span className="weekend-header">Su</span>
              <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            
            <div className="days-grid">
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
          <aside className="notes-section" ref={notesRef}>
            <div className="notes-title">Notes</div>
            
            <div className="notes-list">
              {notes.length === 0 && (
                <p className="notes-empty">No notes yet.</p>
              )}
              {notes.map((n) => (
                <div key={n.id} className="note-card group">
                  {editId === n.id ? (
                    <div className="note-edit-box">
                      <input
                        className="note-edit-input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                        autoFocus
                      />
                      <div className="note-edit-actions">
                        <button className="note-icon-btn save" onClick={handleEditSave}>✓</button>
                        <button className="note-icon-btn cancel" onClick={handleEditCancel}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {n.dateRange && <span className="note-date-badge">{n.dateRange}</span>}
                      <p className="note-text">{n.text}</p>
                      <div className="note-actions">
                        <button className="note-icon-btn" onClick={() => handleEditStart(n)}>✎</button>
                        <button className="note-icon-btn delete" onClick={() => handleDelete(n.id)}>🗑</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="note-add-area">
              <textarea
                className="note-textarea"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Write a note…"
                rows={1}
              />
              <div className="note-add-footer">
                <span className={`note-saved-toast ${savedToast ? 'visible' : ''}`}>✓ Saved!</span>
                <button className="note-save-btn" onClick={handleAdd}>Save</button>
              </div>
            </div>
          </aside>
        </div>

        <div className="holiday-text">
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
