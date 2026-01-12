import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlusCircle, Compass, ExternalLink, User, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import axisLogo from '@/assets/axis-logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { markUserThemePreference } from '@/hooks/useAutoTheme';

const navItems = [
  { 
    title: 'Create Oracle', 
    url: '/app/create', 
    icon: PlusCircle,
    exact: true 
  },
  { 
    title: 'Explore Oracles', 
    url: '/app/explore', 
    icon: Compass,
    exact: false 
  },
  { 
    title: 'Profile', 
    url: '/app/profile', 
    icon: User,
    exact: false 
  },
];

export const AppSidebar: FC = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const isActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-border/50">
      {/* Logo */}
      <SidebarHeader className="p-4 border-b border-border/30">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src={axisLogo} 
            alt="AXIS" 
            className="h-8 w-auto"
          />
          <span className="text-lg font-bold tracking-tight text-foreground">
            AXIS
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.url, item.exact);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={cn(
                        "transition-all duration-200",
                        active && "bg-primary/10 text-primary border-l-2 border-primary"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className={cn(
                          "h-4 w-4",
                          active ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "font-medium",
                          active ? "text-primary" : "text-foreground"
                        )}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Theme Toggle and Docs */}
      <SidebarFooter className="p-4 border-t border-border/30 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-secondary/50">
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium text-foreground">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => {
              markUserThemePreference();
              setTheme(checked ? 'dark' : 'light');
            }}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <a
          href="/docs"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/5"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Docs</span>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
};
