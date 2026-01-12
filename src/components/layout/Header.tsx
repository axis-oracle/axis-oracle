import { FC } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/WalletButton';
import axisLogo from '@/assets/axis-logo.png';

export const Header: FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* AXIS Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <img 
              src={axisLogo} 
              alt="AXIS" 
              className="h-10 md:h-12 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground">
                AXIS
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Oracle Layer
              </span>
            </div>
          </motion.div>

          {/* Network Badge & Wallet */}
          <div className="flex items-center gap-4">
            {/* Docs Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                variant="goldOutline" 
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => window.open('https://docs.example.com', '_blank')}
              >
                Docs
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </motion.div>

            {/* Wallet Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <WalletButton />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};