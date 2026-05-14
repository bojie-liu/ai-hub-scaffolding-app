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
import { LayoutDashboard, LogOut, BookOpen, User, FileText, Presentation, MessageSquare, ClipboardList } from 'lucide-react';

const navLinks = [
  { href: '/lesson', label: 'Lesson', icon: FileText },
  { href: '/slides', label: 'Slides', icon: Presentation, hideForGuest: true },
  { href: '/quizzes', label: 'Quizzes', icon: ClipboardList, hideForGuest: true },
  { href: '/discussion', label: 'Discussion', icon: MessageSquare, hideForGuest: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiredRole: 'TEACHER' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isGuest, logout } = useUser();

  // Hide navbar on login page
  if (pathname === '/login') return null;

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
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <Link href="/lesson" className="flex items-center gap-2 shrink-0">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">AI</span>
            <span className="font-semibold text-slate-800 text-sm hidden sm:block">The Modern Software Developer</span>
          </Link>
          <div className="hidden md:flex items-center gap-0.5">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile nav links */}
          <div className="flex md:hidden items-center gap-0.5">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7">
                    <Icon className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              );
            })}
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 h-7 rounded-md px-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className={`text-xs ${isGuest ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                    {(user.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-xs">{user.username}</span>
                {isGuest ? (
                  <Badge variant="outline" className="text-xs px-1 py-0">Guest</Badge>
                ) : (
                  <Badge variant={user.role === 'TEACHER' ? 'default' : 'secondary'} className="text-xs px-1 py-0">
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

export default Navbar;
