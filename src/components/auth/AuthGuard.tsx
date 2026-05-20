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
            <CardTitle>需要登入</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              請登入以存取此頁面。
            </p>
            <Button onClick={() => router.push('/login')} variant="outline">
              前往登入
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
            <CardTitle>存取被拒</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              您沒有權限存取此頁面。此區域僅限「{requiredRole === 'TEACHER' ? '教師' : requiredRole}」角色使用。
            </p>
            <p className="text-sm text-muted-foreground">
              您目前的角色：<span className="font-medium">{isGuest ? '訪客' : user.role === 'TEACHER' ? '教師' : '學生'}</span>
            </p>
            <Button onClick={() => router.push('/login')} variant="outline">
              登入以取得存取權
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
