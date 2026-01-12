import { FC, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Book, 
  Layers, 
  Code2, 
  FileCode, 
  ChevronRight,
  ChevronDown,
  Home,
  ExternalLink,
  Menu,
  X,
  Zap,
  Shield,
  BarChart3,
  Gamepad2,
  Coins,
  Cloud,
  Package,
  GraduationCap,
  Terminal,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import axisLogo from '@/assets/axis-logo.png';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { markUserThemePreference } from '@/hooks/useAutoTheme';

interface NavItem {
  title: string;
  href?: string;
  icon?: typeof Book;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    icon: Book,
    children: [
      { title: 'Introduction', href: '/docs/intro' },
      { title: 'Quick Start', href: '/docs/quickstart' },
    ],
  },
  {
    title: 'Core Concepts',
    icon: Layers,
    children: [
      { title: 'Architecture', href: '/docs/architecture' },
      { title: 'Data Flow', href: '/docs/data-flow' },
      { title: 'Trust Model', href: '/docs/trust-model' },
      { title: 'Oracle Lifecycle', href: '/docs/lifecycle' },
    ],
  },
  {
    title: 'Data Modules',
    icon: BarChart3,
    children: [
      { title: 'Global Crypto', href: '/docs/modules/crypto' },
      { title: 'Esports', href: '/docs/modules/esports' },
      { title: 'Token Analytics', href: '/docs/modules/memecoins' },
      { title: 'RWA & Event Settlement', href: '/docs/modules/weather-sports' },
    ],
  },
  {
    title: 'Developer Guide',
    icon: Code2,
    children: [
      { title: 'Installation', href: '/docs/developers/installation' },
      { title: 'TypeScript SDK', href: '/docs/integration' },
      { title: 'Rust / Anchor', href: '/docs/developers/rust-integration' },
      { title: 'Building a DApp', href: '/docs/developers/tutorial' },
      { title: 'Error Codes', href: '/docs/developers/errors' },
    ],
  },
  {
    title: 'Reference',
    icon: FileCode,
    children: [
      { title: 'API Reference', href: '/docs/api-reference' },
      { title: 'Program Overview', href: '/docs/contracts' },
      { title: 'Account Structures', href: '/docs/accounts' },
    ],
  },
];

const NavSection: FC<{ item: NavItem; level?: number; onNavigate?: () => void }> = ({ item, level = 0, onNavigate }) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === location.pathname;
  const hasActiveChild = item.children?.some(child => child.href === location.pathname);
  const [isOpen, setIsOpen] = useState<boolean>(hasActiveChild || true);

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            "text-foreground/70 hover:text-foreground hover:bg-muted/50",
            hasActiveChild && "text-foreground bg-muted/30"
          )}
        >
          {item.icon && <item.icon className="h-4 w-4 text-primary/70" />}
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-90"
          )} />
        </button>
        <div className={cn(
          "ml-4 mt-1 space-y-0.5 border-l border-border/40 pl-3 overflow-hidden transition-all duration-200",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}>
          {item.children?.map((child) => (
            <NavSection key={child.href || child.title} item={child} level={level + 1} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.href || '#'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[1px] pl-[11px]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )
      }
    >
      {item.title}
    </NavLink>
  );
};

const DocsLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isDark = theme === 'dark';

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center px-4 lg:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 mr-6 group">
            <img src={axisLogo} alt="AXIS" className="h-6 w-auto transition-transform group-hover:scale-105" />
            <span className="font-semibold text-foreground">Docs</span>
          </NavLink>

          {/* Header nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink 
              to="/docs/intro" 
              className={({ isActive }) => cn(
                "px-3 py-1.5 rounded-lg transition-colors",
                isActive 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Guides
            </NavLink>
            <NavLink 
              to="/docs/api-reference" 
              className={({ isActive }) => cn(
                "px-3 py-1.5 rounded-lg transition-colors",
                isActive 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              API Reference
            </NavLink>
            <NavLink 
              to="/docs/developers/tutorial" 
              className={({ isActive }) => cn(
                "px-3 py-1.5 rounded-lg transition-colors",
                isActive 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Tutorials
            </NavLink>
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => {
                  markUserThemePreference();
                  setTheme(checked ? 'dark' : 'light');
                }}
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <NavLink to="/app">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Zap className="h-4 w-4" />
                Launch App
              </Button>
            </NavLink>
            <a 
              href="https://github.com/axis-oracle" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="gap-2">
                GitHub
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-14 z-40 h-[calc(100vh-3.5rem)] w-72 shrink-0 border-r border-border/40 bg-background",
            "transition-transform duration-300 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <ScrollArea className="h-full pb-20">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <NavSection key={item.title} item={item} onNavigate={closeSidebar} />
              ))}
            </nav>
          </ScrollArea>

          {/* Version badge */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-background">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">v1.0.0</span>
              <span>Solana Mainnet</span>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={closeSidebar}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-10 lg:px-8 animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>

        {/* Right sidebar (Quick Links) */}
        <aside className="hidden xl:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-l border-border/40">
          <div className="p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <div className="space-y-2 text-sm">
              <NavLink to="/docs/quickstart" className="block text-muted-foreground hover:text-foreground transition-colors">
                Quick Start Guide
              </NavLink>
              <NavLink to="/docs/developers/installation" className="block text-muted-foreground hover:text-foreground transition-colors">
                Installation
              </NavLink>
              <NavLink to="/docs/developers/tutorial" className="block text-muted-foreground hover:text-foreground transition-colors">
                Build a DApp
              </NavLink>
              <a 
                href="https://github.com/axis-oracle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DocsLayout;
