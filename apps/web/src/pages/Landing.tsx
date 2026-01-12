import { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, Zap, Lock, Network, Globe, ChevronDown, 
  Code, Shield, Database, Clock, Server, ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axisLogo from '@/assets/axis-logo.png';
import heroBgVideo from '@/assets/hero-bg.mp4';
import LandingNavbar from '@/components/layout/LandingNavbar';
import bitcoinIcon from '@/assets/bitcoin-icon.png';
import pepeIcon from '@/assets/pepe-icon.png';
import weatherIcon from '@/assets/weather-icon.png';
import esportsIcon from '@/assets/esports-icon.png';

const faqs = [
  {
    question: 'What is AXIS?',
    answer: 'AXIS is a permissionless oracle factory on Solana. It allows anyone to create custom data feeds for crypto prices, memecoins, weather, esports results and more — all powered by Switchboard On-Demand infrastructure.',
  },
  {
    question: 'How much does it cost to create an oracle?',
    answer: 'Creating an oracle costs ~0.046 SOL which covers the Switchboard queue fee, oracle deployment, and protocol service fee. This is a one-time payment — no recurring fees.',
  },
  {
    question: 'What data sources are supported?',
    answer: 'We currently support: GeckoTerminal for Solana token prices, Open-Meteo for weather data, and PandaScore for esports match results. More sources are being added regularly.',
  },
  {
    question: 'How does settlement work?',
    answer: 'For event-based oracles (esports, weather), our automated settler service monitors resolution conditions and settles oracles on-chain when the event concludes. All settlements are verifiable on Solana.',
  },
  {
    question: 'Is the data secure?',
    answer: 'Yes. All data is verified through Switchboard TEE (Trusted Execution Environment) oracles before being written on-chain. The decentralized network of node operators ensures data integrity.',
  },
  {
    question: 'Can I integrate AXIS oracles into my dApp?',
    answer: 'Absolutely. Once deployed, each oracle has a unique public key that you can read from your Solana smart contract. We provide Rust/Anchor code examples in our documentation.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Select Module',
    description: 'Choose from Crypto, Memecoin, Weather, or Esports data modules.',
    detail: 'Each module connects to specialized APIs for accurate real-time data.',
  },
  {
    number: '02',
    title: 'Configure Feed',
    description: 'Set your parameters — token address, location, match, or price target.',
    detail: 'Define the exact data point you want to track on-chain.',
  },
  {
    number: '03',
    title: 'Deploy Oracle',
    description: 'Pay ~0.046 SOL and get your oracle deployed in seconds.',
    detail: 'Switchboard creates your feed and returns the on-chain public key.',
  },
];

const modules = [
  {
    icon: bitcoinIcon,
    title: 'Asset Price Feeds',
    description: 'Low-latency price resolution for any on-chain asset, regardless of liquidity.',
    api: 'Aggregated DEX Data',
    example: 'Universal SPL Support',
  },
  {
    icon: pepeIcon,
    title: 'Token Analytics',
    description: 'Verify Market Cap, Volume, and Bonding Curve progress for prediction markets.',
    api: 'Real-time Pool Data',
    example: 'Instant Curve Resolution',
  },
  {
    icon: weatherIcon,
    title: 'Parametric Data',
    description: 'Meteorological conditions for parametric insurance and global prediction markets.',
    api: 'Global Coverage',
    example: 'Temperature, Wind & Precipitation',
  },
  {
    icon: esportsIcon,
    title: 'Match Settlement',
    description: 'Trustless winner determination and score verification for competitive gaming.',
    api: 'Official Match APIs',
    example: 'Automated State Verification',
  },
];


const FAQItem: FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border-b border-border/50"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {question}
        </span>
        <ChevronDown 
          className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
};

const Landing: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroBgVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <img 
              src={axisLogo} 
              alt="AXIS" 
              className="h-24 md:h-32 w-auto mx-auto drop-shadow-lg"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tight text-foreground drop-shadow-md"
          >
            THE REFERENCE POINT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-foreground/90 mb-12 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md"
          >
            The Permissionless Oracle Layer on Solana.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/app">
              <Button 
                variant="gold" 
                size="lg" 
                className="text-base px-8 py-5 h-auto font-semibold shadow-gold"
              >
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button 
                variant="goldOutline" 
                size="lg"
                className="text-base px-8 py-5 h-auto"
              >
                Read Docs
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Data Modules Section */}
      <section id="modules" className="py-28 md:py-36 border-t border-border/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Data <span className="text-gradient-gold">Modules</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pre-built oracle templates for common use cases. Each module connects to verified data sources.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/40 transition-all hover:shadow-lg"
              >
                <div className="w-14 h-14 mb-5 rounded-xl bg-primary/10 border-2 border-primary/50 flex items-center justify-center">
                  <img src={module.icon} alt={module.title} className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {module.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {module.description}
                </p>
                <div className="space-y-2 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 text-xs">
                    <Database className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{module.api}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Code className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{module.example}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-28 md:py-36 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              The <span className="text-gradient-gold">Architecture</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              How AXIS connects off-chain data to Solana
            </p>
          </motion.div>

          {/* Architecture Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto mb-20"
          >
            <div className="p-8 rounded-2xl bg-card border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">External APIs</p>
                  <p className="text-xs text-muted-foreground">GeckoTerminal, Open-Meteo, PandaScore</p>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <Server className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Switchboard TEE</p>
                  <p className="text-xs text-muted-foreground">Trusted Execution Environment</p>
                </div>
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Solana</p>
                  <p className="text-xs text-muted-foreground">On-chain oracle account</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 p-8 md:p-10 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Solana Native.
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Built for speed. Atomic transactions with sub-second finality. All oracles are native Solana accounts you can read from any program.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Permissionless.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                No gatekeepers. No whitelists. Connect your wallet and deploy your oracle in seconds.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                TEE Secured.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Data verified in Trusted Execution Environments before reaching chain.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Auto-Settlement.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Event-based oracles (esports, weather) are automatically settled when conditions are met. Our Railway-hosted settler monitors and executes settlements 24/7.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 mb-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Switchboard Powered.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Built on Switchboard On-Demand infrastructure. Industry-standard decentralized oracle network with proven security track record.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-28 md:py-36">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              How It <span className="text-gradient-gold">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Three steps from idea to on-chain oracle.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              <div className="hidden md:block absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="text-center relative"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-primary/30 bg-background flex items-center justify-center relative z-10">
                      <span className="text-2xl font-bold text-gradient-gold">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      {step.description}
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      {step.detail}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-20"
          >
            <Link to="/app">
              <Button 
                variant="gold" 
                size="lg"
                className="text-base px-8 py-5 h-auto shadow-gold"
              >
                Create Your Oracle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="py-28 md:py-36 border-t border-border/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Protocol <span className="text-gradient-gold">FAQ</span>
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={faq.question} 
                question={faq.question} 
                answer={faq.answer} 
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 md:py-36 border-t border-border/30 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Ready to Build?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Deploy your first oracle in under a minute. No signup required — just connect your wallet.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/app">
                <Button 
                  variant="gold" 
                  size="lg"
                  className="text-base px-10 py-6 h-auto shadow-gold"
                >
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/docs/technical">
                <Button 
                  variant="goldOutline" 
                  size="lg"
                  className="text-base px-10 py-6 h-auto"
                >
                  Technical Docs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img src={axisLogo} alt="AXIS" className="h-8 w-auto" />
              <span className="font-bold text-foreground">AXIS Protocol</span>
            </div>

            <div className="flex items-center gap-8">
              <a 
                href="https://x.com/axis_oracle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                Twitter
              </a>
              <Link 
                to="/docs"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                Documentation
              </Link>
              <Link 
                to="/docs/technical"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
              >
                Technical Docs
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 AXIS Protocol. The Reference Point.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
