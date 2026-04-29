import { create } from 'zustand';
import { EstudySuiteRouteKey } from '../utils/estudyUrls';
import { NoteType, Visibility } from '../types';

interface UIState {
  activeNav: string;
  isNotesCollapsed: boolean;
  selectedPlanId: string;
  selectedSessionOrder: number;
  selectedGroupId: string;
  activeNoteType: NoteType;
  noteContent: string;
  noteVisibility: Visibility;
  estudyLauncher: { open: boolean; verseRef: string };
  suiteRouteKey: EstudySuiteRouteKey;
  suitePassageOverride: string | null;
  hasInteractedWithVerse: boolean;

  setActiveNav: (nav: string) => void;
  setNotesCollapsed: (collapsed: boolean) => void;
  setSelectedPlanId: (id: string) => void;
  setSelectedSessionOrder: (order: number) => void;
  setSelectedGroupId: (id: string) => void;
  setActiveNoteType: (type: NoteType) => void;
  setNoteContent: (content: string) => void;
  setNoteVisibility: (visibility: Visibility) => void;
  setEstudyLauncher: (launcher: { open: boolean; verseRef: string }) => void;
  setSuiteRouteKey: (key: EstudySuiteRouteKey) => void;
  setSuitePassageOverride: (override: string | null) => void;
  setHasInteractedWithVerse: (interacted: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeNav: 'Wisdom Study Engine',
  isNotesCollapsed: false,
  selectedPlanId: '8_Week_Prayer',
  selectedSessionOrder: 1,
  selectedGroupId: 'g_new_01',
  activeNoteType: 'session',
  noteContent: '',
  noteVisibility: 'private',
  estudyLauncher: { open: false, verseRef: '' },
  suiteRouteKey: 'parallelBible',
  suitePassageOverride: null,
  hasInteractedWithVerse: false,

  setActiveNav: (activeNav) => set({ activeNav }),
  setNotesCollapsed: (isNotesCollapsed) => set({ isNotesCollapsed }),
  setSelectedPlanId: (selectedPlanId) => set({ selectedPlanId }),
  setSelectedSessionOrder: (selectedSessionOrder) => set({ selectedSessionOrder }),
  setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),
  setActiveNoteType: (activeNoteType) => set({ activeNoteType }),
  setNoteContent: (noteContent) => set({ noteContent }),
  setNoteVisibility: (noteVisibility) => set({ noteVisibility }),
  setEstudyLauncher: (estudyLauncher) => set({ estudyLauncher }),
  setSuiteRouteKey: (suiteRouteKey) => set({ suiteRouteKey }),
  setSuitePassageOverride: (suitePassageOverride) => set({ suitePassageOverride }),
  setHasInteractedWithVerse: (hasInteractedWithVerse) => set({ hasInteractedWithVerse }),
}));
