import React from 'react';
import { useMyGroups } from '../features/groups/hooks';
import { useUIStore } from '../store/useUIStore';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export const GroupSelection: React.FC = () => {
  const { data: myGroups = [], isLoading } = useMyGroups();
  const { setSelectedGroupId } = useUIStore();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/bible/1920/1080?blur=10')" }}>
      <div className="absolute inset-0 bg-zinc-50/90 pointer-events-none" />
      <div className="max-w-4xl w-full z-10 relative">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark mb-4 drop-shadow-sm">Select Your Study Group</h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">Choose a group to enter the Wisdom Study Engine and continue your guided sessions.</p>
        </div>

        {myGroups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-semibold text-brand-dark mb-2">No Groups Found</h3>
            <p className="text-zinc-500">You are not currently a member of any study group. Please contact your institution administrator to get assigned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <motion.button
                key={group.group_id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGroupId(group.group_id)}
                className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-zinc-100 transition-all text-left flex flex-col items-start group"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-orange group-hover:text-white transition-colors text-brand-orange">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{group.group_name}</h3>
                <p className="text-sm font-medium text-zinc-500 flex items-center gap-1.5 line-clamp-2">
                   <Users size={14} className="opacity-70" /> {group.members?.length || 0} Member{group.members?.length !== 1 ? 's' : ''}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
