'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { useMyPlans, useMyProgress } from '../../features/member/hooks/useMyQueries';
import { initialSessions } from '../../data';
import { ChevronDown, ChevronUp, BookOpen, Check } from 'lucide-react';
import { Progress } from '../../types';

export const MyPlans: React.FC = () => {
  const { appUser } = useAuthStore();
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);
  const [optimisticProgress, setOptimisticProgress] = useState<Progress[]>([]);

  const { data: myPlansItems = [] } = useMyPlans();
  const { data: serverProgress = [] } = useMyProgress();

  const handleMarkComplete = (groupId: string, sessionId: string) => {
    if (!appUser) return;
    
    const newProgress: Progress = {
      progress_id: `p_local_${Date.now()}`,
      user_id: appUser.user_id,
      group_id: groupId,
      session_id: sessionId,
      status: 'completed',
      completed_at: new Date().toISOString()
    };
    
    setOptimisticProgress(prev => [...prev, newProgress]);
    setShowToast(true);
  };

  const combinedProgress = useMemo(() => {
    // combine server + optimistic client state
    return [...serverProgress, ...optimisticProgress];
  }, [serverProgress, optimisticProgress]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const assignmentsWithDetails = useMemo(() => {
    if (!appUser) return [];

    const result = [];
    
    for (const item of myPlansItems) {
      const { plan, group } = item;

      const sessions = (initialSessions[plan.plan_id] || []).sort((a, b) => a.order - b.order);
      const completedSessions = sessions.filter(s => 
        combinedProgress.some(p => 
          p.group_id === group.group_id && 
          p.session_id === s.session_id && 
          p.status === 'completed'
        )
      );

      const progressPct = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;
      
      let nextNotStartedFound = false;
      const sessionsWithStatus = sessions.map(s => {
        const isCompleted = completedSessions.some(cs => cs.session_id === s.session_id);
        let status: 'completed' | 'in-progress' | 'not-started';
        
        if (isCompleted) {
          status = 'completed';
        } else if (!isCompleted && !nextNotStartedFound) {
          status = 'in-progress';
          nextNotStartedFound = true;
        } else {
          status = 'not-started';
        }
        
        return { ...s, status };
      });

      result.push({
        id: `${plan.plan_id}_${group.group_id}`,
        plan,
        group,
        sessions: sessionsWithStatus,
        completedCount: completedSessions.length,
        totalCount: sessions.length,
        progressPct
      });
    }

    return result.sort((a, b) => b.progressPct - a.progressPct);
  }, [appUser, myPlansItems, combinedProgress]);

  const toggleExpand = (id: string) => {
    setExpandedPlans(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!appUser) return null;
  const isObserver = appUser.role === 'observer';

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-brand-dark drop-shadow-sm">My Plans</h1>
        <p className="text-zinc-500 font-medium">All active study plans across your groups.</p>
      </div>

      {assignmentsWithDetails.length > 0 ? (
        <div className="space-y-6">
          {assignmentsWithDetails.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-brand-dark">{item.plan.title}</h3>
                    <p className="text-zinc-500 mt-1">{item.group.group_name} • {item.plan.duration_weeks} Weeks</p>
                  </div>
                  <span className="text-xs font-bold text-brand-orange bg-orange-50 px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.completedCount}/{item.totalCount} Sessions
                  </span>
                </div>
                
                <div className="w-full bg-zinc-200 rounded-full h-2 mt-2">
                  <div className="bg-brand-orange h-2 rounded-full transition-all duration-500" style={{ width: `${item.progressPct}%` }} />
                </div>
              </div>

              <div className="border-t border-zinc-100">
                <button 
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-zinc-500 hover:text-brand-dark hover:bg-zinc-50 transition-colors"
                >
                  {expandedPlans[item.id] ? (
                    <>Hide Sessions <ChevronUp size={16} /></>
                  ) : (
                    <>Show Sessions <ChevronDown size={16} /></>
                  )}
                </button>

                {expandedPlans[item.id] && (
                  <div className="p-6 pt-0 bg-zinc-50/50">
                    <ul className="space-y-3 mt-4">
                      {item.sessions.map(session => (
                        <li key={session.session_id} className={`flex items-center justify-between p-4 rounded-xl border ${session.status === 'completed' ? 'bg-white border-zinc-200' : 'bg-white border-zinc-200 shadow-sm'}`}>
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center">
                              {session.status === 'completed' && <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white"><Check size={10} /></div>}
                              {session.status === 'in-progress' && <div className="w-4 h-4 rounded-full border-2 border-brand-orange flex items-center justify-center"><div className="w-1.5 h-1.5 bg-brand-orange rounded-full" /></div>}
                              {session.status === 'not-started' && <div className="w-4 h-4 rounded-full border-2 border-zinc-300" />}
                            </div>
                            <div>
                               <p className={`font-semibold ${session.status === 'completed' ? 'text-zinc-500 line-through' : 'text-brand-dark'}`}>
                                 {session.title}
                               </p>
                               <div className="flex gap-3 text-xs mt-1">
                                 <span className="text-brand-orange font-bold">Week {session.week}</span>
                                 {session.primary_verse && <span className="text-zinc-500 italic">{session.primary_verse}</span>}
                               </div>
                            </div>
                          </div>
                          
                          {session.status === 'in-progress' && !isObserver && (
                            <button 
                              onClick={() => handleMarkComplete(item.group.group_id, session.session_id)}
                              className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg shadow-sm hover:bg-orange-600 transition-colors active:scale-95"
                            >
                              Mark Completed
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-400 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No plans assigned yet.</p>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-brand-dark text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check size={16} className="text-green-400" /> Session marked complete
        </div>
      )}

    </div>
  );
};
