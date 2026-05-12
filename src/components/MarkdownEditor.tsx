import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Heading, Maximize2, Minimize2, List, ListOrdered, Quote, Code, Link, Eye, Edit3, Columns } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  isFullscreen,
  onToggleFullscreen
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('preview');

  useEffect(() => {
    setMounted(true);
  }, []);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (viewMode === 'preview') {
      setViewMode('edit');
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = value.substring(start, end);
    
    const newValue = value.substring(0, start) + before + selection + after + value.substring(end);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const editorContent = (
    <div className={`flex flex-col bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-4 md:inset-10 z-[9999] shadow-2xl bg-white' : 'h-64 relative'}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-zinc-200 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => insertText('# ')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Heading">
            <Heading size={14} />
          </button>
          <button onClick={() => insertText('**', '**')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Bold">
            <Bold size={14} />
          </button>
          <button onClick={() => insertText('*', '*')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Italic">
            <Italic size={14} />
          </button>
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          <button onClick={() => insertText('- ')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Bullet List">
            <List size={14} />
          </button>
          <button onClick={() => insertText('1. ')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Numbered List">
            <ListOrdered size={14} />
          </button>
          <button onClick={() => insertText('> ')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Quote">
            <Quote size={14} />
          </button>
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          <button onClick={() => insertText('`', '`')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Code">
            <Code size={14} />
          </button>
          <button onClick={() => insertText('[', '](url)')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Link">
            <Link size={14} />
          </button>
        </div>
        
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <div className="flex items-center bg-zinc-100 rounded-lg p-0.5">
            <button 
              onClick={() => setViewMode('edit')} 
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'edit' ? 'bg-white text-brand-dark shadow-sm' : 'text-zinc-500 hover:text-brand-dark'}`}
              title="Write Mode"
            >
              <Edit3 size={14} />
            </button>
            <button 
              onClick={() => setViewMode('preview')} 
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white text-brand-dark shadow-sm' : 'text-zinc-500 hover:text-brand-dark'}`}
              title="Preview Mode"
            >
              <Eye size={14} />
            </button>
            <button 
              onClick={() => setViewMode('split')} 
              className={`p-1.5 rounded-md transition-colors hidden sm:block ${viewMode === 'split' ? 'bg-white text-brand-dark shadow-sm' : 'text-zinc-500 hover:text-brand-dark'}`}
              title="Split View"
            >
              <Columns size={14} />
            </button>
          </div>
          <div className="w-px h-4 bg-zinc-200 mx-1" />
          <button onClick={onToggleFullscreen} className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-orange hover:bg-orange-50 transition-colors" title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Capture your reflection here..."
            className={`p-4 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-orange/10 text-sm font-serif placeholder:italic bg-transparent leading-relaxed ${viewMode === 'split' ? 'w-1/2 border-r border-zinc-200' : 'w-full'}`}
          />
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div 
            className={`p-4 overflow-y-auto bg-white ${viewMode === 'split' ? 'w-1/2' : 'w-full'} ${viewMode === 'preview' ? 'cursor-text' : ''}`}
            onClick={() => {
              if (viewMode === 'preview') setViewMode('edit');
            }}
          >
            {value ? (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-400 italic text-sm">
                Click here to start capturing your reflection...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (!isFullscreen) {
    return editorContent;
  }

  return mounted ? createPortal(
    <>
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm" onClick={onToggleFullscreen} />
      {editorContent}
    </>,
    document.body
  ) : null;
};
