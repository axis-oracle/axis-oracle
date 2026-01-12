import { FC } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { ModulesSection } from '@/components/sections/ModulesSection';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CreateNewView: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="py-8 px-4 md:px-6">
      {/* Hero Banner */}
      <section className="mb-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight"
          >
            Create Your <span className="text-gradient-gold">Oracle</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Select a data source module, configure your parameters, and deploy your oracle on Solana in seconds.
          </motion.p>
        </div>
      </section>

      {/* Wallet Warning */}
      {!connected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <Alert className="border-primary/30 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Connect your wallet to deploy oracles. The Deploy button will be enabled once your wallet is connected.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Modules */}
      <ModulesSection />
    </div>
  );
};

export default CreateNewView;
