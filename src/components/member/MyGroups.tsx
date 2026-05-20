'use client';

import React, { useMemo, useState } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  initialGroups, 
  initialUsers,
  initialAssignments, 
  initialProgress, 
  initialSessions, 
  initialStudyPlans 
} from '../../data';
import { ChevronDown, ChevronUp, Users, ArrowRight } from 'lucide-react';

export const MyGroups: React.FC = () => {
  const { appUser } = useAuthStore();
  const { setSelectedGroupId } = useUIStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const groupsWithDetails = useMemo(() => {
    if (!appUser) return [];

    const myGroupsList = initialGroups.filter(
      (g) => g.members.includes(appUser.user_id) && g.church_id === appUser.church_id
    );

    const result = [];
    
    for (const group of myGroupsList) {
      // Find leader
      let leaderUser = null;
      if (group.role_overrides) {
        const leaderId = Object.keys(group.role_overrides).find(id => group.role_overrides[id] === 'leader');
        if (leaderId) {
          leaderUser = initialUsers.find(u => u.user_id === leaderId);
        }
      }

      // Member role
      const memberRole = group.role_overrides?.[appUser.user_id] || appUser.role;

      // Plans
      const groupAssignments = initialAssignments.filter(a => a.group_id === group.group_id);
      const plans = [];

      for (const assignment of groupAssignments) {
        const plan = initialStudyPlans.find(p => p.plan_id === assignment.plan_id);
        if (!plan) continue;

        const sessions = initialSessions[plan.plan_id] || [];
        const completedSessions = sessions.filter(s => 
          initialProgress.some(p => 
            p.user_id === appUser.user_id && 
            p.group_id === group.group_id && 
            p.session_id === s.session_id && 
            p.status === 'completed'
          )
        );

        const progressPct = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;

        plans.push({
          plan,
          completedCount: completedSessions.length,
          totalCount: sessions.length,
          progressPct
        });
      }

      result.push({
        group,
        leader: leaderUser,
        memberRole,
        plans
      });
    }

    return result;
  }, [appUser]);

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'leader': return 'bg-orange-100 text-brand-orange';
      case 'observer': return 'bg-zinc-100 text-zinc-600';
      case 'member':
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (!appUser) return null;
  const isObserver = appUser.role === 'observer';

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-brand-dark drop-shadow-sm">My Groups</h1>
        <p className="text-zinc-500 font-medium">Your active study communities and connections.</p>
      </div>

      {groupsWithDetails.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupsWithDetails.map(item => (
            <div key={item.group.group_id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-brand-dark">{item.group.group_name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${getRoleBadgeClasses(item.memberRole)}`}>
                    {item.memberRole}
                  </span>
                </div>
                
                <div className="space-y-1 mb-6">
                  <p className="text-sm text-zinc-500">{item.group.members.length} members</p>
                  <p className="text-sm text-zinc-500">
                    {item.leader ? `Led by ${item.leader.user_name}` : 'No leader assigned'}
                  </p>
                </div>

                {!isObserver && (
                  <button 
                    onClick={() => setSelectedGroupId(item.group.group_id)}
                    className="w-full bg-zinc-50 hover:bg-zinc-100 text-brand-dark font-semibold py-3 px-4 rounded-xl border border-zinc-200 transition-colors flex items-center justify-center gap-2 mb-4"
                  >
                    Enter Group <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {item.plans.length > 0 && (
                <div className="border-t border-zinc-100 mt-auto">
                  <button 
                    onClick={() => toggleExpand(item.group.group_id)}
                    className="w-full flex items-center justify-between px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-zinc-50 transition-colors"
                  >
                    <span>{item.plans.length} Assigned Plan{item.plans.length !== 1 && 's'}</span>
                    <span className="text-zinc-400">
                      {expandedGroups[item.group.group_id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {expandedGroups[item.group.group_id] && (
                    <div className="p-6 pt-2 bg-zinc-50/50 space-y-4">
                      {item.plans.map((pInfo, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-zinc-100">
                           <div className="flex justify-between items-center mb-1.5">
                             <span className="text-sm font-semibold text-zinc-700">{pInfo.plan.title}</span>
                             <span className="text-xs font-bold text-zinc-400">{pInfo.completedCount}/{pInfo.totalCount}</span>
                           </div>
                           <div className="w-full bg-zinc-200 rounded-full h-1.5">
                            <div className="bg-brand-teal h-1.5 rounded-full transition-all" style={{ width: `${pInfo.progressPct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-400 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">You are not in any groups.</p>
        </div>
      )}
    </div>
  );
};
