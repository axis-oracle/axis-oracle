import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import axisLogo from '@/assets/axis-logo.png';

const navLinks = [
  { label: 'Modules', href: '#modules' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'FAQ', href: '#faq' },
];

const LandingNavbar: FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md border-b border-border/30' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 relative">
          {/* Left - Logo */}
          <a href="#" className="flex items-center gap-3 z-10">
            <img 
              src={axisLogo} 
              alt="AXIS" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-foreground tracking-tight">
              AXIS
            </span>
          </a>

          {/* Center - Navigation Links (absolutely centered) */}
          <div className="hidden md:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-5 py-2 rounded-full bg-background/50 backdrop-blur-md border border-primary/40 shadow-sm text-sm font-semibold text-foreground uppercase tracking-widest hover:bg-background hover:text-primary hover:border-primary/60 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right - Theme Toggle, Socials & Docs */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-primary/40 hover:bg-background hover:border-primary/60 transition-all">
              <ThemeToggle />
            </div>

            {/* Twitter/X Icon */}
            <a
              href="https://x.com/axis_oracle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-md bg-background/50 backdrop-blur-md border border-primary/40 shadow-sm text-foreground hover:bg-background hover:text-primary hover:border-primary/60 transition-all"
              aria-label="Twitter"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* GitHub Icon */}
            <a
              href="https://github.com/axis-oracle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-md bg-background/50 backdrop-blur-md border border-primary/40 shadow-sm text-foreground hover:bg-background hover:text-primary hover:border-primary/60 transition-all"
              aria-label="GitHub"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="h-4 w-4 fill-current"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>

            {/* Docs Button */}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-background/50 backdrop-blur-md border-primary/40 shadow-sm text-foreground font-semibold hover:text-primary hover:border-primary/60 transition-all"
            >
              <a href="/docs">
                Docs
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default LandingNavbar;
