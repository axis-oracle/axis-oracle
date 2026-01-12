import { FC, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: FC<CodeBlockProps> = ({ 
  code, 
  language, 
  filename,
  title,
  showLineNumbers = true 
}) => {
  const displayName = filename || title;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-[#1e1e1e] my-6">
      {/* Header with filename and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-border/50">
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          {displayName && (
            <span className="text-xs text-zinc-400 font-mono ml-2">{displayName}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all",
            "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50",
            copied && "text-green-400"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
          fontFamily: "'JetBrains Mono', monospace",
        }}
        lineNumberStyle={{
          color: '#4a4a4a',
          paddingRight: '1rem',
          minWidth: '2.5rem',
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

// Inline code component
export const InlineCode: FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-sm">
    {children}
  </code>
);

// Callout component for notes, warnings, etc.
interface CalloutProps {
  type?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const Callout: FC<CalloutProps> = ({ type = 'info', title, className, children }) => {
  const styles = {
    info: 'border-blue-500/30 bg-blue-500/5 text-blue-700',
    warning: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-700',
    danger: 'border-red-500/30 bg-red-500/5 text-red-700',
    success: 'border-green-500/30 bg-green-500/5 text-green-700',
  };

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    danger: '🚨',
    success: '✅',
  };

  return (
    <div className={cn("rounded-lg border p-4 my-6", styles[type], className)}>
      <div className="flex gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div>
          {title && <p className="font-semibold mb-1">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
};
