'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { 
  initialNotes, 
  initialGroups, 
  initialStudyPlans, 
  initialSessions, 
  initialAssignments
} from '../../data';
import { AppNote, NoteType, Visibility } from '../../types';
import { StickyNote, Plus, Lock, Globe, Trash2, Edit2, X, Check } from 'lucide-react';

export const MyNotes: React.FC = () => {
  const { appUser } = useAuthStore();
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Add form state
  const [addGroup, setAddGroup] = useState('');
  const [addPlan, setAddPlan] = useState('');
  const [addSession, setAddSession] = useState('');
  const [addVisibility, setAddVisibility] = useState<Visibility>('private');
  const [addContent, setAddContent] = useState('');

  useEffect(() => {
    if (appUser) {
      const userNotes = initialNotes.filter(n => n.user_id === appUser.user_id);
      setNotes(userNotes);
    }
  }, [appUser]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notes]);

  const myGroups = useMemo(() => {
    if (!appUser) return [];
    return initialGroups.filter(g => g.members.includes(appUser.user_id) && g.church_id === appUser.church_id);
  }, [appUser]);

  const availablePlans = useMemo(() => {
    if (!addGroup) return [];
    const groupAssignments = initialAssignments.filter(a => a.group_id === addGroup);
    return groupAssignments.map(a => initialStudyPlans.find(p => p.plan_id === a.plan_id)).filter(p => !!p);
  }, [addGroup]);

  const availableSessions = useMemo(() => {
    if (!addPlan) return [];
    return initialSessions[addPlan] || [];
  }, [addPlan]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.note_id !== id));
    triggerToast('Note deleted');
  };

  const handleStartEdit = (note: AppNote) => {
    setEditingId(note.note_id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (id: string) => {
    setNotes(prev => prev.map(n => n.note_id === id ? { ...n, content: editContent } : n));
    setEditingId(null);
    triggerToast('Note updated');
  };

  const handleSaveNew = () => {
    if (!appUser || !addGroup || !addPlan || !addContent.trim()) return;

    const noteType: NoteType = addSession ? 'session' : 'plan';
    
    const newNote: AppNote = {
      note_id: `n_local_${Date.now()}`,
      user_id: appUser.user_id,
      user_name: appUser.user_name,
      group_id: addGroup,
      plan_id: addPlan,
      session_id: addSession || null,
      note_type: noteType,
      content: addContent,
      verse_id: "",
      visibility: addVisibility,
      created_at: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setIsAdding(false);
    setAddGroup('');
    setAddPlan('');
    setAddSession('');
    setAddContent('');
    setAddVisibility('private');
    triggerToast('Note created');
  };

  if (!appUser) return null;
  const isObserver = appUser.role === 'observer';

  if (isObserver) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="bg-brand-teal/20 border border-brand-teal text-sm text-zinc-700 rounded-xl p-4 mb-6">
          You have observer access — notes are read-only.
        </div>
        {sortedNotes.length > 0 ? (
          <div className="space-y-4">
             {/* Render read-only list */}
             {sortedNotes.map(note => (
               <div key={note.note_id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-6 opacity-80">
                 <p className="text-sm text-zinc-700 whitespace-pre-wrap">{note.content}</p>
                 <div className="flex items-center gap-3 mt-4 text-xs text-zinc-400">
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-400 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100">
            <StickyNote size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No notes found.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-brand-dark drop-shadow-sm">My Notes</h1>
          <p className="text-zinc-500 font-medium">Your personal reflections and shared insights.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-brand-orange/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Note
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-brand-orange/20 p-6 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-brand-dark">Create New Note</h3>
            <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-zinc-600 p-1"><X size={20} /></button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Group</label>
                <select 
                  value={addGroup}
                  onChange={(e) => { setAddGroup(e.target.value); setAddPlan(''); setAddSession(''); }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow"
                >
                  <option value="">Select a group...</option>
                  {myGroups.map(g => <option key={g.group_id} value={g.group_id}>{g.group_name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Study Plan</label>
                <select 
                  value={addPlan}
                  onChange={(e) => { setAddPlan(e.target.value); setAddSession(''); }}
                  disabled={!addGroup}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow disabled:opacity-50"
                >
                  <option value="">Select a plan...</option>
                  {availablePlans.map(p => p && <option key={p.plan_id} value={p.plan_id}>{p.title}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Session (Optional)</label>
                <select 
                  value={addSession}
                  onChange={(e) => setAddSession(e.target.value)}
                  disabled={!addPlan}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow disabled:opacity-50"
                >
                  <option value="">Not session-specific</option>
                  {availableSessions.map(s => <option key={s.session_id} value={s.session_id}>Week {s.week}: {s.title}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Visibility</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddVisibility('private')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${addVisibility === 'private' ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                  >
                    <Lock size={14} /> Private
                  </button>
                  <button
                    onClick={() => setAddVisibility('shared_group')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${addVisibility === 'shared_group' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                  >
                    <Globe size={14} /> Group
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Note Content</label>
              <textarea 
                value={addContent}
                onChange={(e) => setAddContent(e.target.value)}
                placeholder="Write your reflection..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveNew}
                disabled={!addGroup || !addPlan || !addContent.trim()}
                className="px-5 py-2.5 text-sm font-bold bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {sortedNotes.length > 0 ? (
        <div className="space-y-4">
          {sortedNotes.map(note => {
            const groupName = initialGroups.find(g => g.group_id === note.group_id)?.group_name || 'Unknown Group';
            const planTitle = initialStudyPlans.find(p => p.plan_id === note.plan_id)?.title || 'Unknown Plan';
            const sessionTitle = note.session_id ? initialSessions[note.plan_id]?.find(s => s.session_id === note.session_id)?.title : null;

            return (
              <div key={note.note_id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100 p-6 flex flex-col group">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
                     note.note_type === 'session' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                     note.note_type === 'verse' ? 'bg-purple-50 border-purple-100 text-purple-600' : 
                     'bg-orange-50 border-orange-100 text-orange-600'
                   }`}>
                     {note.note_type}
                   </span>
                   {note.visibility === 'private' ? (
                     <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full"><Lock size={10} /> Private</span>
                   ) : (
                     <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Globe size={10} /> Shared</span>
                   )}
                   <span className="text-xs text-zinc-400 font-medium ml-auto">
                     {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                   </span>
                </div>

                {editingId === note.note_id ? (
                  <div className="mb-4">
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 rounded-md">Cancel</button>
                      <button onClick={() => handleSaveEdit(note.note_id)} className="px-4 py-1.5 text-xs font-bold bg-zinc-800 text-white rounded-md hover:bg-black">Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap mb-6">{note.content}</p>
                )}

                <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-brand-dark">{groupName} • {planTitle}</span>
                    {sessionTitle && <span className="text-[11px] text-zinc-400">{sessionTitle}</span>}
                  </div>
                  
                  {!editingId && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEdit(note)} className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(note.note_id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-400 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-100">
          <StickyNote size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No notes found.</p>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-brand-dark text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check size={16} className="text-green-400" /> {toastMsg}
        </div>
      )}
    </div>
  );
};
