'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, BookOpen, User, FileText, HelpCircle, MessageSquare } from 'lucide-react';

const navLinks = [
  { href: '/lesson', label: 'Lesson Plan', icon: FileText },
  { href: '/slides', label: 'Slides', icon: BookOpen, hideForGuest: false },
  { href: '/quiz', label: 'Quiz', icon: HelpCircle, hideForGuest: true },
  { href: '/discussion', label: 'Discussion', icon: MessageSquare, hideForGuest: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredRole: 'TEACHER' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest, logout } = useUser();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const visibleLinks = navLinks.filter((link) => {
    if (link.requiredRole && user?.role !== link.requiredRole) return false;
    if (link.hideForGuest && isGuest) return false;
    return true;
  });

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/lesson" className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AI</span>
            <span className="font-semibold text-slate-800 text-sm hidden sm:block">AI in Software Engineering</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile nav links */}
          <div className="flex sm:hidden items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8">
                    <Icon className="h-4 w-4" />
                  </Button>
                </Link>
              );
            })}
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 h-7 rounded-md px-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className={`text-xs ${isGuest ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                    {(user.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user.username}</span>
                {isGuest ? (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">Guest</Badge>
                ) : (
                  <Badge variant={user.role === 'TEACHER' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">
                    {user.role}
                  </Badge>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isGuest ? (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/login')}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Exit Guest Mode
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem disabled>
                      <User className="h-4 w-4 mr-2" />
                      {user.username} ({user.role})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
