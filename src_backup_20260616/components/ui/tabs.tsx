'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within Tabs');
  return ctx;
}

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue = '', value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const onChange = (newValue: string) => {
    if (value === undefined) setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-xl',
        className
      )}
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, icon }: { value: string; children: ReactNode; icon?: ReactNode }) {
  const { value: currentValue, onChange } = useTabs();
  const isActive = currentValue === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'inline-flex items-center gap-2 px-4 h-9 text-sm font-medium rounded-md transition-all',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-white'
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: currentValue } = useTabs();
  if (currentValue !== value) return null;
  return <div className={cn('mt-4 animate-fade-in', className)}>{children}</div>;
}