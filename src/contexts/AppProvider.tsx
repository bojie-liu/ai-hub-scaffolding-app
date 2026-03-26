'use client';

import { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { CourseProvider } from './CourseContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <CourseProvider>
        {children}
      </CourseProvider>
    </UserProvider>
  );
}
