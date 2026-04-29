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

const WISDOM_STUDY_ENGINE = 'Wisdom Study Engine';

export const MainContent: React.FC = () => {
  const { 
    activeNav, 
    suiteRouteKey, 
    suitePassageOverride,
    selectedPlanId,
    selectedSessionOrder
  } = useUIStore();

  const { token } = useAuthStore();

  const { data: sessions = [] } = useSessions(selectedPlanId);
  const currentSession = useMemo(() => sessions.find(s => s.order === selectedSessionOrder) || sessions[0], [sessions, selectedSessionOrder]);

  const showStudySuite = activeNav === WISDOM_STUDY_ENGINE;
  const passage = suitePassageOverride ?? currentSession?.primary_verse ?? '';

  const suiteEmbedSrc = useMemo(
    () => buildSuiteReaderSrc(suiteRouteKey as EstudySuiteRouteKey, passage, token),
    [suiteRouteKey, passage, token],
  );

  return (
    <div
      className={`relative min-h-0 flex-1 bg-white ${
        showStudySuite ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {showStudySuite ? (
        <iframe
          key={suiteEmbedSrc}
          src={suiteEmbedSrc}
          title="Wisdom Bible Study Suite"
          className="absolute inset-0 block h-full w-full border-0"
          allow="clipboard-read; clipboard-write; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
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
