import { FC } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/WalletButton';
import axisLogo from '@/assets/axis-logo.png';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#modules', label: 'Create New' },
  { href: '#my-feeds', label: 'My Feeds' },
  { href: '#all-feeds', label: 'Explore' },
];

export const AppHeader: FC = () => {
  const location = useLocation();

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Docs Button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => window.open('https://docs.example.com', '_blank')}
            >
              Docs
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>

            {/* Wallet Button */}
            <WalletButton />
          </div>
        </div>
      </div>
    </motion.header>
  );
};
