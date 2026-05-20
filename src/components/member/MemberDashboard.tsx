'use client';

import React, { useMemo } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  initialGroups, 
  initialAssignments, 
  initialProgress, 
  initialNotes, 
  initialSessions, 
  initialStudyPlans 
} from '../../data';
import { CheckCircle, NotepadText, ArrowRight, Play, LayoutDashboard } from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const { appUser } = useAuthStore();
  const { setSelectedGroupId } = useUIStore();

  const firstName = appUser?.user_name?.split(' ')[0] || 'Member';

  // Computed data
  const myGroupsList = useMemo(() => {
    if (!appUser) return [];
    return initialGroups.filter(
      (g) => g.members.includes(appUser.user_id) && g.church_id === appUser.church_id
    );
  }, [appUser]);

  const groupIds = useMemo(() => myGroupsList.map(g => g.group_id), [myGroupsList]);

  const myAssignments = useMemo(() => {
    return initialAssignments.filter((a) => groupIds.includes(a.group_id));
  }, [groupIds]);

  const activePlanIds = useMemo(() => {
    const ids = new Set(myAssignments.map(a => a.plan_id));
    return Array.from(ids);
  }, [myAssignments]);

  const completedSessionsCount = useMemo(() => {
    if (!appUser) return 0;
    return initialProgress.filter((p) => p.user_id === appUser.user_id && p.status === 'completed').length;
  }, [appUser]);

  const myNotesCount = useMemo(() => {
    if (!appUser) return 0;
    return initialNotes.filter((n) => n.user_id === appUser.user_id).length;
  }, [appUser]);

  // Find next sessions
  const nextSessions = useMemo(() => {
    if (!appUser) return [];
    const sessions = [];
    
    // Sort assignments by date desc to get recent ones first
    const sortedAssignments = [...myAssignments].sort(
      (a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
    );

    for (const assignment of sortedAssignments) {
      const planSessions = initialSessions[assignment.plan_id] || [];
      const plan = initialStudyPlans.find(p => p.plan_id === assignment.plan_id);
      const group = myGroupsList.find(g => g.group_id === assignment.group_id);
      
      if (!plan || !group) continue;
      
      const sortedPlanSessions = [...planSessions].sort((a, b) => a.order - b.order);
      
      for (const session of sortedPlanSessions) {
        const isCompleted = initialProgress.some(
          p => p.user_id === appUser.user_id && 
               p.group_id === group.group_id && 
               p.session_id === session.session_id && 
               p.status === 'completed'
        );
        
        if (!isCompleted) {
          sessions.push({ session, plan, group });
          break; // Only push the first not-started session for this plan+group combo
        }
      }
    }
    return sessions;
  }, [appUser, myAssignments, myGroupsList]);

  const continueSession = nextSessions[0];
  const upcomingSessionsList = nextSessions.slice(1, 4);

  // Recent activity
  const recentActivity = useMemo(() => {
    if (!appUser) return [];
    
    const myRecentNotes = initialNotes
      .filter(n => n.user_id === appUser.user_id)
      .map(n => ({
        id: n.note_id,
        type: 'note' as const,
        title: 'Added a note',
        date: new Date(n.created_at),
        icon: NotepadText,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
      
    const myRecentProgress = initialProgress
      .filter(p => p.user_id === appUser.user_id && p.status === 'completed' && p.completed_at)
      .map(p => {
        let sessionTitle = 'a session';
        // Try to find session title
        for (const planId in initialSessions) {
          const s = initialSessions[planId].find(ss => ss.session_id === p.session_id);
          if (s) {
            sessionTitle = s.title;
            break;
          }
        }
        return {
          id: p.progress_id,
          type: 'progress' as const,
          title: `Completed ${sessionTitle}`,
          date: new Date(p.completed_at!),
          icon: CheckCircle,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
      
    return [...myRecentNotes, ...myRecentProgress]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [appUser]);

  if (!appUser) return null;

  const isObserver = appUser.role === 'observer';

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
      {isObserver && (
        <div className="bg-brand-teal/20 border border-brand-teal text-sm text-zinc-700 rounded-xl p-4">
          You have observer access — progress tracking and notes are not available.
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
          Welcome back, {firstName}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-brand-orange uppercase tracking-wider">
            {appUser.role}
          </span>
        </h1>
        <p className="text-zinc-500 font-medium">{appUser.church_name}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-6">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Sessions Completed</p>
          <div className="text-3xl font-bold text-brand-dark">{completedSessionsCount}</div>
          <p className="text-sm text-zinc-500 mt-1">Total recorded</p>
        </div>
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-6">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">Active Plans</p>
          <div className="text-3xl font-bold text-brand-dark">{activePlanIds.length}</div>
          <p className="text-sm text-zinc-500 mt-1">Across all groups</p>
        </div>
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-6">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">My Groups</p>
          <div className="text-3xl font-bold text-brand-dark">{myGroupsList.length}</div>
          <p className="text-sm text-zinc-500 mt-1">Currently enrolled</p>
        </div>
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-6">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">My Notes</p>
          <div className="text-3xl font-bold text-brand-dark">{myNotesCount}</div>
          <p className="text-sm text-zinc-500 mt-1">Saved reflections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Where You Left Off */}
          <div>
            <h2 className="text-lg font-bold text-brand-dark mb-4 drop-shadow-sm">Continue Where You Left Off</h2>
            {continueSession ? (
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Play size={120} />
                </div>
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-widest">{continueSession.plan.title} • Week {continueSession.session.week}</span>
                    <h3 className="text-2xl font-bold text-brand-dark mt-1">{continueSession.session.title}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{continueSession.group.group_name}</p>
                  </div>
                  
                  {continueSession.session.primary_verse && (
                    <div className="bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-100 italic text-sm text-zinc-600">
                      Primary Verse: <span className="font-semibold not-italic">{continueSession.session.primary_verse}</span>
                    </div>
                  )}

                  {!isObserver ? (
                    <button 
                      onClick={() => setSelectedGroupId(continueSession.group.group_id)}
                      className="mt-2 bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand-orange/20 transition-all flex items-center gap-2"
                    >
                      Enter Study <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className="mt-2 text-sm font-semibold text-zinc-400 bg-zinc-100 px-4 py-2 rounded-lg">
                      Read-Only — Observer
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-10 text-center text-zinc-400">
                <LayoutDashboard size={40} className="mx-auto mb-3 opacity-40" />
                <p>No active sessions found.</p>
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-lg font-bold text-brand-dark mb-4 drop-shadow-sm">Upcoming Sessions</h2>
            {upcomingSessionsList.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 overflow-hidden">
                <ul className="divide-y divide-zinc-100">
                  {upcomingSessionsList.map((item, idx) => (
                    <li key={idx} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div>
                        <h4 className="font-semibold text-brand-dark">{item.session.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.plan.title} • {item.group.group_name}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-orange bg-orange-50 px-2 py-1 rounded-md whitespace-nowrap">Week {item.session.week}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-8 text-center text-zinc-400 text-sm">
                No upcoming sessions.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-brand-dark mb-4 drop-shadow-sm">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-5">
              <ul className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent hidden"></ul>
              <ul className="space-y-6">
                {recentActivity.map((act) => {
                  const Icon = act.icon;
                  return (
                    <li key={act.id} className="relative flex gap-4">
                      <div className="absolute left-0 top-1 bottom-0 w-px bg-zinc-100 -translate-x-[11px] translate-y-6 last:hidden" />
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${act.type === 'note' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                        <Icon size={14} />
                      </div>
                      <div className="pt-1.5 flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-dark truncate">{act.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{act.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-8 text-center text-zinc-400 text-sm">
              No recent activity.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
