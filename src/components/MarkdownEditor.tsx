import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Heading, Maximize2, Minimize2 } from 'lucide-react';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

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
    <div className={`flex flex-col bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-4 md:inset-10 z-[9999] shadow-2xl bg-white' : 'h-40 relative'}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-zinc-200 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => insertText('# ')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Heading">
            <Heading size={14} />
          </button>
          <button onClick={() => insertText('**', '**')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Bold">
            <Bold size={14} />
          </button>
          <button onClick={() => insertText('*', '*')} className="p-1.5 rounded-lg text-zinc-500 hover:text-brand-dark hover:bg-zinc-100 transition-colors" title="Italic">
            <Italic size={14} />
          </button>
        </div>
        <button onClick={onToggleFullscreen} className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-orange hover:bg-orange-50 transition-colors" title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Capture your reflection here..."
        className="flex-1 w-full p-4 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/10 text-sm font-serif placeholder:italic bg-transparent"
      />
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
