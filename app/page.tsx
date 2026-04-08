'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { MONTHS_DATA } from './mocks/monthsData';
import { loadGlobalSelection } from './store/calendarStore';
import DesktopPageUI from './components/DesktopPageUI';
import MonthContent from './components/MonthContent';

export default function CalendarPage() {
  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTimeoutRef = useRef<any>(null);
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
    audioRef.current = new Audio('/audio.wav');
    audioRef.current.volume = 1.0;
    const checkView = () => setIsMobileView(window.innerWidth <= 768);
    checkView();
    window.addEventListener('resize', checkView);
    return () => window.removeEventListener('resize', checkView);
  }, []);

  const playFlipSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = setTimeout(() => {
        if (audioRef.current) audioRef.current.pause();
      }, 700);
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
    <main className="calendar-scene-container">
      <div className="room-environment" />
      <div className="scene-vignette" />

      <div className="calendar-wrapper" onWheel={handleWheel}>
        {/* Physical Attachment System */}
        <div className="attachment-system">
          <div className="metallic-nail nail-left" />
          <div className="metallic-nail nail-right" />
          <div className="coil-spring-binding" />
          <div className="hanging-tether tether-left" />
          <div className="hanging-tether tether-right" />
        </div>

        <div className="wall-calendar-wrapper">
          {prevAnim !== null && (
            <div className="prev-flip-overlay">
              <div className="prev-flip-page">
                <MonthContent mIdx={prevAnim} />
              </div>
            </div>
          )}
          <div className="calendar-flipbook-container">
            <div className="flipbook-rotated-wrapper">
              {isMounted && (
                /* @ts-ignore */
                <HTMLFlipBook
                  width={510} 
                  height={340} 
                  size="fixed"
                  minWidth={510}
                  maxWidth={510} 
                  minHeight={340}
                  maxHeight={340}
                  showCover={false}
                  usePortrait={true}
                  drawShadow={true}
                  flippingTime={800}
                  maxShadowOpacity={0.2}
                  mobileScrollSupport={true}
                  style={{ background: 'transparent' }}
                  startPage={0}
                  startZIndex={0}
                  autoSize={false}
                  clickEventForward={true}
                  useMouseEvents={!isMobileView}
                  swipeDistance={30}
                  showPageCorners={true}
                  disableFlipByClick={true}
                  onFlip={onFlip}
                  onChangeState={onChangeState}
                  ref={bookRef}
                  className="flipbook-engine"
                >
                  {MONTHS_DATA.map((_, i) => (
                    <DesktopPageUI key={`dp-${i}`} mIdx={i} />
                  ))}
                </HTMLFlipBook>
              )}
            </div>
          </div>
        </div>

        {/* Improved Mobile Navigation (Attached below calendar) */}
        {!isMobileView ? null : (
          <div className="flex mt-10 mb-20 items-center justify-between gap-5 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/30 w-[280px]">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white active:scale-90 transition-transform disabled:opacity-30"
              onClick={goPrev}
              disabled={pageRef.current <= 0}
            >
              <span className="rotate-180">▼</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[8px] uppercase tracking-widest text-white/60 font-bold">Month</span>
              <span className="text-sm font-bold min-w-[80px] text-center text-white">
                {MONTHS_DATA[currentPage]?.name}
              </span>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white active:scale-90 transition-transform disabled:opacity-30"
              onClick={goNext}
              disabled={pageRef.current >= MONTHS_DATA.length - 1}
            >▼</button>
          </div>
        )}
      </div>
    </main>
  );
}
