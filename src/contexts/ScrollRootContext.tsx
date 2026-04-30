'use client';

import { createContext, useContext, useRef, ReactNode, RefObject } from 'react';

interface ScrollRootContextValue {
  scrollRootRef: RefObject<HTMLDivElement | null>;
}

const ScrollRootContext = createContext<ScrollRootContextValue | undefined>(undefined);

export function ScrollRootProvider({ children }: { children: ReactNode }) {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  return (
    <ScrollRootContext.Provider value={{ scrollRootRef }}>
      <div ref={scrollRootRef} className="flex flex-col h-screen">
        {children}
      </div>
    </ScrollRootContext.Provider>
  );
}

export function useScrollRoot() {
  const context = useContext(ScrollRootContext);
  if (context === undefined) {
    throw new Error('useScrollRoot must be used within a ScrollRootProvider');
  }
  return context.scrollRootRef;
}
