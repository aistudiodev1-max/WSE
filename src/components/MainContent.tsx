/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EstudySuiteRouteKey, buildSuiteReaderSrc } from '../utils/estudyUrls';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../features/auth/useAuthStore';
import { useSessions } from '../features/sessions/hooks';
import { usePlans } from '../features/plans/hooks';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WISDOM_STUDY_ENGINE = 'Wisdom Study Engine';

export const MainContent: React.FC = () => {
  const { 
    activeNav, 
    suiteRouteKey, 
    suitePassageOverride,
    selectedPlanId,
    selectedSessionOrder,
    setSelectedSessionOrder,
    hasInteractedWithVerse,
    setEstudyLauncher
  } = useUIStore();

  const { token } = useAuthStore();

  const { data: sessions = [] } = useSessions(selectedPlanId);
  const currentSession = useMemo(() => sessions.find(s => s.order === selectedSessionOrder) || sessions[0], [sessions, selectedSessionOrder]);

  const currentIndex = useMemo(() => sessions.findIndex(s => s.session_id === currentSession?.session_id), [sessions, currentSession]);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < sessions.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setSelectedSessionOrder(sessions[currentIndex - 1].order);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setSelectedSessionOrder(sessions[currentIndex + 1].order);
    }
  };

  const showStudySuite = activeNav === WISDOM_STUDY_ENGINE;
  const passage = suitePassageOverride ?? currentSession?.primary_verse ?? '';

  const suiteEmbedSrc = useMemo(
    () => buildSuiteReaderSrc(suiteRouteKey as EstudySuiteRouteKey, passage, token),
    [suiteRouteKey, passage, token],
  );

  const shouldShowPrompt = !hasInteractedWithVerse;

  return (
    <div
      className={`relative min-h-0 flex-1 bg-white ${
        (showStudySuite && !shouldShowPrompt) ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {shouldShowPrompt ? (
        <div className="flex min-h-full flex-col items-center justify-center bg-zinc-100 p-4 text-center">
          <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 border border-zinc-200">
             <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
             </div>
             <h3 className="text-xl font-black text-brand-dark mb-2">Interact with Verses</h3>
             <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
               Select an interactive verse reference from your reader to explore contexts, parallel translations, and original languages.
             </p>
             <button
               onClick={() => setEstudyLauncher({ open: true, verseRef: '' })}
               className="w-full bg-brand-dark text-white font-bold py-4 px-6 rounded-2xl hover:bg-brand-dark/90 transition transform active:scale-95 shadow-lg shadow-brand-dark/20"
             >
               Open Study Suite
             </button>
          </div>
        </div>
      ) : showStudySuite ? (
        <div className="absolute inset-0 flex flex-col">
          <iframe
            key={suiteEmbedSrc}
            src={suiteEmbedSrc}
            title="Wisdom Bible Study Suite"
            className="flex-1 w-full border-0"
            allow="clipboard-read; clipboard-write; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <div className="flex items-center justify-between p-4 bg-white border-t border-zinc-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
            <button 
              onClick={handlePrev} 
              disabled={!hasPrev} 
              className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm font-semibold text-zinc-400 capitalize hidden sm:block">{currentSession?.title}</span>
            <button 
              onClick={handleNext} 
              disabled={!hasNext} 
              className="px-4 py-2 flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-brand-sepia px-8 py-12 text-center">
          <p className="text-sm text-zinc-600">
            Select <span className="font-semibold text-brand-dark">Wisdom Study Engine</span> in the header to open the
            embedded app.
          </p>
        </div>
      )}
    </div>
  );
};
