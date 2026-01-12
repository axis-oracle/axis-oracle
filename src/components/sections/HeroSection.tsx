import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { WalletButton } from '@/components/wallet/WalletButton';
import heroBgVideo from '@/assets/hero-bg.mp4';

const AXIS_CONTRACT_ADDRESS = 'AwzfqJMb9SQ9zPyfVQAFTtG5ePiWfB7ZDjM6fbDTpump';

export const HeroSection: FC = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const goToApp = () => {
    navigate('/app');
  };

  const copyContractAddress = () => {
    navigator.clipboard.writeText(AXIS_CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-32 md:py-40 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover blur-sm"
      >
        <source src={heroBgVideo} type="video/mp4" />
      </video>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-foreground"
          >
            THE REFERENCE POINT.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-foreground mb-14 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md"
          >
            The Permissionless Oracle Layer on Solana.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            {!connected ? (
              <WalletButton />
            ) : (
              <Button 
                variant="gold" 
                size="lg" 
                onClick={goToApp}
                className="text-base px-8 py-6 h-auto"
              >
                Launch App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            <Button 
              variant="goldOutline" 
              size="lg"
              onClick={goToApp}
              className="text-base px-8 py-6 h-auto bg-background/80 backdrop-blur-sm"
            >
              Explore Oracles
            </Button>
          </motion.div>

          {/* Contract Address */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={copyContractAddress}
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90 transition-colors group"
            >
              <span className="text-sm text-muted-foreground font-medium">$AXIS CA:</span>
              <code className="text-sm font-mono text-foreground">
                {AXIS_CONTRACT_ADDRESS.slice(0, 6)}...{AXIS_CONTRACT_ADDRESS.slice(-4)}
              </code>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-12 text-muted-foreground"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">0.02 SOL</p>
              <p className="text-sm font-medium tracking-wide uppercase mt-1">Per Oracle</p>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">5+</p>
              <p className="text-sm font-medium tracking-wide uppercase mt-1">Data Sources</p>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">Instant</p>
              <p className="text-sm font-medium tracking-wide uppercase mt-1">Deployment</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};