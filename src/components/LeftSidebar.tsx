/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Sparkles, BookOpen, Library, CheckCircle2, BookMarked, ChevronRight, Layout } from 'lucide-react';
import { SidebarItem, Card, ProgressCircle } from './SidebarComponents';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlans, useAssignments } from '../features/plans/hooks';
import { useSessions } from '../features/sessions/hooks';
import { useProgress, useSaveProgress } from '../features/progress/hooks';
import { resolvePermissions } from '../utils/permissions';
import { getRoleInGroup } from '../utils/permissions';
import { Group } from '../types';
import { useGroups } from '../features/groups/hooks';

export const LeftSidebar: React.FC = () => {
  const { user, appUser } = useAuthStore();
  const { 
    selectedPlanId, setSelectedPlanId,
    selectedSessionOrder,
    selectedGroupId,
    setEstudyLauncher
  } = useUIStore();

  const { data: allPlans = [] } = usePlans();
  const { data: allAssignments = [] } = useAssignments();
  const { data: allGroups = [] } = useGroups();
  const { data: sessions = [] } = useSessions(selectedPlanId);
  const { data: userProgress = [] } = useProgress();
  const saveProgressMutation = useSaveProgress();

  // --- Computed ---
  const currentGroup = useMemo(() => allGroups.find(g => g.group_id === selectedGroupId) || allGroups[0], [allGroups, selectedGroupId]);

  const assignedPlans = useMemo(() => {
    const ids = allAssignments.filter(a => a.group_id === selectedGroupId).map(a => a.plan_id);
    return allPlans.filter(p => ids.includes(p.plan_id));
  }, [allAssignments, selectedGroupId, allPlans]);

  const currentPlan = useMemo(() => allPlans.find(p => p.plan_id === selectedPlanId) || assignedPlans[0] || allPlans[0], [selectedPlanId, assignedPlans, allPlans]);
  const session = useMemo(() => sessions.find(s => s.order === selectedSessionOrder) || sessions[0], [sessions, selectedSessionOrder]);

  const progressPercent = useMemo(() => {
    if (!sessions.length) return 0;
    const completed = userProgress.filter(p => 
      sessions.some(s => s.session_id === p.session_id) && 
      p.status === 'completed'
    ).length;
    return Math.round((completed / sessions.length) * 100);
  }, [userProgress, sessions]);

  const context = useMemo(() => ({
    role_in_group: (appUser && currentGroup) ? getRoleInGroup(appUser, currentGroup) : 'member',
    membership_level: appUser?.membership_level || 'Free',
    licensed: appUser?.licensed ?? true
  }), [appUser, currentGroup]);

  const permissions = useMemo(() => resolvePermissions(context), [context]);

  const handleComplete = async () => {
    if (!permissions.can_track_progress || !user || !session) return;
    const exists = userProgress.find(p => p.session_id === session.session_id);
    if (!exists) {
      saveProgressMutation.mutate({
        progress_id: `prog_${Date.now()}`,
        user_id: user.uid,
        group_id: selectedGroupId,
        session_id: session.session_id,
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }
  };

  const onOpenEstudyLauncher = (verseRef: string) => setEstudyLauncher({ open: true, verseRef });

  if (!session || !currentPlan) return null;
  return (
    <div className="z-10 flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-y-auto border-r border-zinc-200 bg-white no-scrollbar shadow-sm">
      {/* Session Progress Header */}
      <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
               <Sparkles className="text-brand-orange" size={18} />
               <h2 className="text-sm font-black uppercase tracking-tighter text-brand-dark">Study Session</h2>
            </div>
            <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">{currentPlan?.title || "No Plan"}</span>
          </div>
          <ProgressCircle percent={progressPercent} />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-emerald-50">
              <CheckCircle2 size={16} />
            </div>
            <div className="w-8 h-[2px] bg-emerald-200 mx-0.5" />
            <div className="w-7 h-7 border-2 border-zinc-200 rounded-full flex items-center justify-center text-xs font-black text-zinc-400 bg-white">
              2
            </div>
          </div>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-auto underline decoration-brand-orange decoration-2 underline-offset-4">Track Progress</span>
        </div>
      </div>

      <div className="flex-1">
        {/* Active Study Plan Selector */}
        <SidebarItem title="Assigned Study Plans" icon={Layout} count={assignedPlans.length} isOpen={true}>
          <div className="space-y-3 mt-2">
            {assignedPlans.length > 0 ? (
              assignedPlans.map(p => (
                <button
                  key={p.plan_id}
                  onClick={() => setSelectedPlanId(p.plan_id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all relative group ${
                    selectedPlanId === p.plan_id 
                      ? 'bg-brand-dark border-brand-dark text-white shadow-md' 
                      : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${selectedPlanId === p.plan_id ? 'text-brand-orange' : 'text-zinc-400'}`}>
                      {p.plan_type} Plan
                    </span>
                    <span className="text-xs font-bold leading-tight">{p.title}</span>
                  </div>
                  {selectedPlanId === p.plan_id ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center shadow-sm">
                      <ChevronRight size={14} className="text-white" />
                    </div>
                  ) : (
                    <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))
            ) : (
              <div className="text-xs text-zinc-400 py-4 text-center border border-dashed border-zinc-200 rounded-xl">No plans assigned</div>
            )}
          </div>
        </SidebarItem>

        <div className="p-4 space-y-4">
          <Card title="Primary Verse" icon={BookOpen} active={true}>
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-display font-black text-brand-dark">{session?.primary_verse || "N/A"}</h3>
              <p className="text-xs italic text-zinc-500 font-serif leading-relaxed mb-4">
                {session?.teaching ? `"${session.teaching.substring(0, 40)}..."` : "No teaching text available."}
              </p>
              <button
                type="button"
                onClick={() => onOpenEstudyLauncher(session?.primary_verse ?? '')}
                className="w-full bg-brand-orange hover:bg-orange-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-black text-xs shadow-lg shadow-brand-orange/20 active:scale-[0.98]"
              >
                <BookMarked size={16} />
                OPEN IN ESTUDY APP
              </button>
            </div>
          </Card>

          <SidebarItem title="Supporting Verses" count={session?.supporting_verses.length || 0} icon={Library} isOpen={true}>
             <div className="grid grid-cols-1 gap-2 mt-2">
                {session?.supporting_verses.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onOpenEstudyLauncher(v)}
                    className="text-left px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-600 hover:bg-brand-sepia hover:border-brand-orange transition-all shadow-sm active:scale-95"
                  >
                    {v}
                  </button>
                ))}
             </div>
          </SidebarItem>

          <SidebarItem title="Reflection Tool" icon={Sparkles}>
            <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-brand-orange/10 shadow-inner">
              <p className="text-xs italic text-zinc-700 font-serif leading-relaxed">
                {session?.reflection || "What stands out to you from this session?"}
              </p>
            </div>
          </SidebarItem>
        </div>
      </div>

      <div className="p-6 border-t border-zinc-200 bg-white">
        <button 
          onClick={handleComplete}
          className={`w-full py-4 rounded-full flex items-center justify-center gap-2 font-black transition-all group shadow-lg active:scale-95 ${
            progressPercent === 100 
              ? 'bg-emerald-100 text-emerald-700 cursor-default' 
              : 'bg-brand-teal hover:bg-[#86d4c5] text-[#1a5b4e] shadow-emerald-200/50'
          }`}
        >
          <CheckCircle2 size={20} className={progressPercent === 100 ? 'text-emerald-500' : ''} />
          {progressPercent === 100 ? 'SESSION COMPLETED' : 'MARK COMPLETED'}
          {progressPercent < 100 && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </div>
  );
};
