'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { MONTHS_DATA } from './mocks/monthsData';
import { loadGlobalSelection } from './store/calendarStore';
import DesktopPageUI from './components/DesktopPageUI';
import AttachmentSystem from './components/AttachmentSystem';
import SpiralRings from './components/SpiralRings';
import PrevFlipOverlay from './components/PrevFlipOverlay';
import MobileNavigation from './components/MobileNavigation';

export default function CalendarPage() {
  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTimeoutRef = useRef<any>(null);
  const wheelLock = useRef<boolean>(false);
  const pageRef = useRef<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
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

  const goNext = useCallback(() => {
    if (pageRef.current >= MONTHS_DATA.length - 1) return;
    bookRef.current?.pageFlip()?.flipNext();
  }, []);

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

  const touchStartY = useRef<number | null>(null);
  const touchLock = useRef<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null || touchLock.current) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;
    if (Math.abs(deltaY) < 40) return;
    touchLock.current = true;
    setTimeout(() => { touchLock.current = false; }, 900);
    if (deltaY > 0) goNext();
    else goPrev();
  }, [goNext, goPrev]);

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

      <div className="calendar-wrapper" onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <AttachmentSystem />
        <SpiralRings />

        <div className="wall-calendar-wrapper">
          <PrevFlipOverlay prevAnim={prevAnim} />
          
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
                  flippingTime={1200}
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

        {isMobileView && (
          <MobileNavigation
            currentPage={currentPage}
            canGoPrev={pageRef.current > 0}
            canGoNext={pageRef.current < MONTHS_DATA.length - 1}
            onGoPrev={goPrev}
            onGoNext={goNext}
          />
        )}
      </div>
    </main>
  );
}
