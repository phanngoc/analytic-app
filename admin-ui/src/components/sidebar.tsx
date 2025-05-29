'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  BarChart3, 
  FolderOpen, 
  Settings, 
  Home, 
  Activity,
  Plus,
  Menu,
  X,
  Globe,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    description: 'Manage tracking projects'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'View detailed reports'
  },
  {
    title: 'Real-time',
    href: '/realtime',
    icon: Activity,
    description: 'Live tracking data'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration'
  }
];

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCollapsed = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="fixed top-4 left-4 z-50 h-10 w-10 p-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div className={cn(
        "flex flex-col h-full bg-background border-r border-border transition-all duration-300",
        isMobile ? (
          `sidebar-mobile ${isMobileOpen ? 'sidebar-mobile-open' : ''} w-64`
        ) : (
          isCollapsed ? "w-16" : "w-64"
        ),
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && !isMobile && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 analytics-gradient rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Analytics Hub</h2>
                <p className="text-xs text-muted-foreground">Professional Platform</p>
              </div>
            </div>
          )}
          {(!isMobile || isMobileOpen) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapsed}
              className="h-8 w-8 p-0"
            >
              {isCollapsed || isMobile ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3 text-left",
                  (isCollapsed && !isMobile) ? "px-2" : "px-3",
                  isActive && "bg-primary/10 text-primary border-primary/20"
                )}
                onClick={() => handleNavigation(item.href)}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  (isCollapsed && !isMobile) ? "mx-auto" : "mr-3"
                )} />
                {(!isCollapsed || isMobile) && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="default"
            className={cn(
              "w-full analytics-gradient hover:shadow-analytics-hover transition-all duration-200",
              (isCollapsed && !isMobile) ? "px-2" : "px-3"
            )}
            onClick={() => handleNavigation('/projects/create')}
          >
            <Plus className={cn(
              "h-4 w-4 flex-shrink-0",
              (isCollapsed && !isMobile) ? "mx-auto" : "mr-2"
            )} />
            {(!isCollapsed || isMobile) && "New Project"}
          </Button>

          {(!isCollapsed || isMobile) && (
            <div className="pt-2 space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Globe className="h-3 w-3 mr-2" />
                <span>Status: Online</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-2" />
                <span>Mode: Production</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
