import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItemProps {
  question: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({ question, children, defaultOpen = false, className = '' }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-canvas rounded-md border-b border-hairline p-6 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left gap-4 cursor-pointer select-none group"
      >
        <span className="text-[18px] font-semibold leading-[1.40] text-ink group-hover:text-charcoal transition-colors">
          {question}
        </span>
        <span className="shrink-0 text-steel group-hover:text-ink transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {isOpen && (
        <div className="pt-4 text-[15px] leading-[1.55] text-charcoal">
          {children}
        </div>
      )}
    </div>
  );
}
