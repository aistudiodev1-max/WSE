/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect } from 'react';
import { Sparkles, BookOpen, Library, CheckCircle2, BookMarked, ChevronRight, ChevronLeft, Layout } from 'lucide-react';
import { SidebarItem, Card, ProgressCircle } from './SidebarComponents';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlans, useAssignments } from '../features/plans/hooks';
import { useSessions } from '../features/sessions/hooks';
import { useSaveProgress } from '../features/progress/hooks';
import { resolvePermissions } from '../utils/permissions';
import { getRoleInGroup } from '../utils/permissions';
import { useMyGroups } from '../features/groups/hooks';

export const LeftSidebar: React.FC = () => {
  const { user, appUser } = useAuthStore();
  const { 
    selectedPlanId, setSelectedPlanId,
    selectedSessionOrder, setSelectedSessionOrder,
    selectedGroupId, setSelectedGroupId,
    setEstudyLauncher
  } = useUIStore();

  const { data: allPlans = [] } = usePlans();
  const { data: allAssignments = [] } = useAssignments();
  const { data: myGroups = [] } = useMyGroups();
  const { data: sessions = [] } = useSessions(selectedPlanId);

  // --- Computed ---
  const currentGroup = useMemo(() => myGroups.find(g => String(g.group_id) === String(selectedGroupId)), [myGroups, selectedGroupId]);
  
  const assignedPlans = useMemo(() => {
    // If Assignments API returns plan data, we just map it here 

    // depending on your assignment interface mapping
    return allPlans.length > 0 ? allPlans : [];
  }, [allPlans]);

  const currentPlan = useMemo(() => allPlans.find(p => String(p.plan_id) === String(selectedPlanId)) || assignedPlans[0] || allPlans[0], [selectedPlanId, assignedPlans, allPlans]);

  useEffect(() => {
    if (currentPlan && currentPlan.plan_id !== selectedPlanId) {
       setSelectedPlanId(currentPlan.plan_id);
    }
  }, [currentPlan, selectedPlanId, setSelectedPlanId]);

  const session = useMemo(() => sessions.find(s => s.order === selectedSessionOrder) || sessions[0], [sessions, selectedSessionOrder]);
  const currentIndex = useMemo(() => sessions.findIndex(s => s.session_id === session?.session_id), [sessions, session]);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < sessions.length - 1;

  const handlePrev = () => {
    if (hasPrev) setSelectedSessionOrder(sessions[currentIndex - 1].order);
  };

  const handleNext = () => {
    if (hasNext) setSelectedSessionOrder(sessions[currentIndex + 1].order);
  };

  const completedCount = useMemo(() => {
    return sessions.filter(s => s.is_completed).length;
  }, [sessions]);

  const progressPercent = useMemo(() => {
    if (!sessions.length) return 0;
    return Math.round((completedCount / sessions.length) * 100);
  }, [completedCount, sessions]);
  
  const saveProgressMutation = useSaveProgress(sessions.length, completedCount);

  const context = useMemo(() => ({
    role_in_group: (appUser && currentGroup) ? getRoleInGroup(appUser, currentGroup) : 'member',
    membership_level: appUser?.membership_level || 'Free',
    licensed: appUser?.licensed ?? true
  }), [appUser, currentGroup]);

  const permissions = useMemo(() => resolvePermissions(context), [context]);

  const handleComplete = async () => {
    if (!permissions.can_track_progress || !user || !session || !selectedGroupId || !selectedPlanId) return;
    if (!session.is_completed) {
      saveProgressMutation.mutate({
        progress: {
          progress_id: `prog_${Date.now()}`,
          user_id: user.uid,
          group_id: selectedGroupId,
          session_id: session.session_id,
          status: 'completed',
          completed_at: new Date().toISOString()
        },
        planId: selectedPlanId
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
        
        <div className="flex items-center justify-center w-full pb-2">
          <div className="flex flex-wrap items-center justify-center gap-y-2">
            {sessions.map((s, idx) => {
              const isCompleted = s.is_completed;
              const isActive = s.session_id === session?.session_id;
              
              return (
                <React.Fragment key={s.session_id}>
                  <button
                    onClick={() => setSelectedSessionOrder(s.order)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-sm active:scale-95 ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                        : isActive
                          ? 'border-2 border-brand-orange text-brand-orange bg-brand-orange/10 ring-4 ring-orange-50'
                          : 'border-2 border-zinc-200 text-zinc-400 bg-white hover:border-zinc-300'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </button>
                  {idx < sessions.length - 1 && (
                     <div className={`w-4 sm:w-6 h-[2px] mx-0.5 ${isCompleted ? 'bg-emerald-200' : 'bg-zinc-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
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

          {session?.supporting_verses && session.supporting_verses.length > 0 && (
            <SidebarItem title="Supporting Verses" count={session.supporting_verses.length} icon={Library} isOpen={true}>
               <div className="grid grid-cols-1 gap-2 mt-2">
                  {session.supporting_verses.map((v: string) => (
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
          )}

          <SidebarItem title="Reflection Tool" icon={Sparkles}>
            <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-brand-orange/10 shadow-inner">
              <p className="text-xs italic text-zinc-700 font-serif leading-relaxed">
                {session?.reflection || "What stands out to you from this session?"}
              </p>
            </div>
          </SidebarItem>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 bg-white flex items-center gap-2">
        <button 
          onClick={handlePrev} 
          disabled={!hasPrev} 
          className="w-14 h-14 rounded-full flex items-center justify-center bg-zinc-50 border border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={handleComplete}
          className={`flex-1 h-14 rounded-full flex items-center justify-center gap-2 font-black transition-all group shadow-lg active:scale-95 ${
            session?.is_completed 
              ? 'bg-emerald-100 text-emerald-700 cursor-default' 
              : 'bg-brand-teal hover:bg-[#86d4c5] text-[#1a5b4e] shadow-emerald-200/50'
          }`}
        >
          <CheckCircle2 size={20} className={session?.is_completed ? 'text-emerald-500' : ''} />
          {session?.is_completed ? 'SESSION COMPLETED' : 'MARK COMPLETED'}
        </button>
        <button 
          onClick={handleNext} 
          disabled={!hasNext} 
          className="w-14 h-14 rounded-full flex items-center justify-center bg-zinc-50 border border-zinc-200 text-zinc-400 hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
