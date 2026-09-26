import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Home, Grid3x3, X, Droplets,
} from 'lucide-react';
import { SLIDES } from './slides';

export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const [showOverview, setShowOverview] = useState(false);

  const total = SLIDES.length;
  const SlideComponent = SLIDES[current].component;

  const goNext = useCallback(() => {
    setCurrent(c => Math.min(c + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent(c => Math.max(c - 1, 0));
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    setShowOverview(false);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        setShowOverview(false);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrent(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrent(total - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, total]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-xs font-semibold"
          >
            <Home className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">JalDrishti</span>
            <span className="text-xs text-slate-500 hidden sm:inline">System Presentation</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverview(!showOverview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-xs font-semibold"
          >
            <Grid3x3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">All Slides</span>
          </button>
          <span className="text-xs text-slate-400 font-mono px-2">
            {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-2 lg:p-4">
          <div className="w-full h-full max-w-[1400px] max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white">
            <SlideComponent />
          </div>
        </div>

        {/* Nav arrows */}
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-cyan-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          disabled={current === total - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-cyan-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
            {SLIDES[current].title}
          </span>
        </div>
        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Overview modal */}
      {showOverview && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-30 flex flex-col p-4 lg:p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">All Slides</h2>
            <button
              onClick={() => setShowOverview(false)}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto w-full">
            {SLIDES.map((slide, i) => {
              const SlidePreview = slide.component;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                    i === current ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="aspect-video bg-white overflow-hidden">
                    <div className="scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none">
                      <SlidePreview />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-2">
                    <p className="text-[10px] font-semibold text-white">
                      {String(i + 1).padStart(2, '0')}. {slide.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
