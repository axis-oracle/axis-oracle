import { FC } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { WalletButton } from '@/components/wallet/WalletButton';
import heroBgVideo from '@/assets/hero-bg.mp4';

export const HeroSection: FC = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  const goToApp = () => {
    navigate('/app');
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


          {/* Stats or Trust Indicators */}
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