'use client';

import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { GroupSelection } from './GroupSelection';
import { MemberDashboard } from './member/MemberDashboard';
import { MyPlans } from './member/MyPlans';
import { MyGroups } from './member/MyGroups';
import { MyNotes } from './member/MyNotes';
import { LayoutDashboard, BookOpen, Users, StickyNote, Compass } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'plans', label: 'My Plans', icon: BookOpen },
  { id: 'groups', label: 'My Groups', icon: Users },
  { id: 'notes', label: 'My Notes', icon: StickyNote },
  { id: 'study-groups', label: 'Study Groups', icon: Compass },
] as const;

export const MemberHome: React.FC = () => {
  const { activeMemberTab, setActiveMemberTab } = useUIStore();

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Tab Navigation */}
      <nav className="bg-brand-dark border-b border-zinc-700 shrink-0 flex gap-0 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveMemberTab(id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeMemberTab === id
                ? 'text-brand-orange border-brand-orange'
                : 'text-zinc-400 border-transparent hover:text-white'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-zinc-100">
        {activeMemberTab === 'dashboard' && <MemberDashboard />}
        {activeMemberTab === 'plans' && <MyPlans />}
        {activeMemberTab === 'groups' && <MyGroups />}
        {activeMemberTab === 'notes' && <MyNotes />}
        {activeMemberTab === 'study-groups' && <GroupSelection />}
      </div>
    </div>
  );
};
