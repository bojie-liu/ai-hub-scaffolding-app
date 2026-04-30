'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isGuest } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-amber-500 mb-2" />
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please log in to access this page.
            </p>
            <Button onClick={() => router.push('/login')} variant="outline">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-2" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You do not have permission to access this page. This area is
              restricted to users with the &ldquo;{requiredRole}&rdquo; role.
            </p>
            <p className="text-sm text-muted-foreground">
              Your current role: <span className="font-medium">{isGuest ? 'Guest' : user.role}</span>
            </p>
            <Button onClick={() => router.push('/login')} variant="outline">
              Sign In for Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
