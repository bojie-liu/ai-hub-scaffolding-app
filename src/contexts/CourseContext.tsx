'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Course } from '@/lib/types';

interface CourseContextValue {
  course: Course | null;
  setCourse: (course: Course | null) => void;
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [course, setCourse] = useState<Course | null>(null);

  return (
    <CourseContext.Provider value={{ course, setCourse }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
