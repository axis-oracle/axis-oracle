import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, Loader2, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useWalletVerification } from '@/hooks/useWalletVerification';

type ConnectionPhase = 'idle' | 'connecting' | 'signing' | 'complete';

export const WalletButton: FC = () => {
  const navigate = useNavigate();
  const { wallets, select, disconnect, connected, publicKey, connecting, signMessage } = useWallet();
  const { 
    isVerified, 
    balance, 
    clearVerification,
    setVerifiedFromExternalSign,
  } = useWalletVerification();
  
  const [isOpen, setIsOpen] = useState(false);
  const [connectionPhase, setConnectionPhase] = useState<ConnectionPhase>('idle');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  // Track if user manually disconnected to prevent modal from reopening
  const manualDisconnectRef = useRef(false);
  // Track if we're in the middle of a connect+sign flow
  const isSigningFlowRef = useRef(false);

  // Handle the signature after wallet connects
  const performSignature = useCallback(async (): Promise<boolean> => {
    if (!signMessage || !publicKey) {
      console.log('Cannot sign: wallet not ready');
      return false;
    }

    try {
      const message = new TextEncoder().encode(
        "Welcome to AXIS. Sign to verify ownership."
      );
      
      await signMessage(message);
      return true;
    } catch (error: any) {
      console.error('Signature failed:', error);
      return false;
    }
  }, [signMessage, publicKey]);

  // Effect to handle signing once wallet connects
  useEffect(() => {
    const handlePostConnect = async () => {
      if (connected && publicKey && isSigningFlowRef.current && connectionPhase === 'connecting') {
        setConnectionPhase('signing');
        
        const signSuccess = await performSignature();
        
        if (signSuccess) {
          // Mark as verified
          setVerifiedFromExternalSign(publicKey.toBase58());
          setConnectionPhase('complete');
          isSigningFlowRef.current = false;
          setIsOpen(false);
          setSelectedWallet(null);
          
          toast({
            title: "Wallet Connected",
            description: "Your wallet is verified and ready.",
          });
        } else {
          // Signature rejected - disconnect and reset
          isSigningFlowRef.current = false;
          setConnectionPhase('idle');
          setSelectedWallet(null);
          
          await disconnect();
          
          toast({
            title: "Verification Required",
            description: "Verification signature is required.",
            variant: "destructive",
          });
        }
      }
    };

    handlePostConnect();
  }, [connected, publicKey, connectionPhase, performSignature, disconnect, setVerifiedFromExternalSign]);

  // Handle wallet selection - starts the connect+sign flow
  const handleWalletSelect = useCallback(async (walletName: string) => {
    const wallet = wallets.find(w => w.adapter.name === walletName);
    if (!wallet) return;

    manualDisconnectRef.current = false;
    isSigningFlowRef.current = true;
    setSelectedWallet(walletName);
    setConnectionPhase('connecting');

    try {
      // Select and connect - the useEffect above handles the signing
      select(wallet.adapter.name);
      // Connection happens automatically after select for most wallets
    } catch (error: any) {
      console.error('Connection failed:', error);
      setConnectionPhase('idle');
      setSelectedWallet(null);
      isSigningFlowRef.current = false;
    }
  }, [wallets, select]);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    manualDisconnectRef.current = true;
    clearVerification();
    await disconnect();
    setConnectionPhase('idle');
    setSelectedWallet(null);
    
    toast({
      title: "Logged Out",
      description: "Your wallet has been disconnected.",
    });
  }, [clearVerification, disconnect]);

  // Open modal only on manual click
  const openModal = useCallback(() => {
    if (manualDisconnectRef.current) {
      manualDisconnectRef.current = false;
    }
    setConnectionPhase('idle');
    setSelectedWallet(null);
    setIsOpen(true);
  }, []);

  // Close modal - also reset state if closing during flow
  const closeModal = useCallback(() => {
    // Don't allow closing during active signing flow
    if (connectionPhase === 'signing') {
      return;
    }
    
    setIsOpen(false);
    setConnectionPhase('idle');
    setSelectedWallet(null);
    isSigningFlowRef.current = false;
  }, [connectionPhase]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 5)}...`;
  };

  // Get phase status text
  const getPhaseText = () => {
    switch (connectionPhase) {
      case 'connecting':
        return 'Connecting...';
      case 'signing':
        return 'Waiting for signature...';
      default:
        return '';
    }
  };

  // VERIFIED STATE: Connected and verified - show Create Oracle + wallet dropdown
  if (connected && publicKey && isVerified) {
    return (
      <div className="flex items-center gap-2">
        {/* Create Oracle Button */}
        <Button
          variant="gold"
          size="sm"
          onClick={() => navigate('/app/create')}
          className="flex items-center gap-2 text-white"
        >
          Create Oracle
        </Button>

        {/* Wallet Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-card border-border hover:bg-card/80"
            >
              <span className="font-mono text-sm">
                {truncateAddress(publicKey.toBase58())}
              </span>
              <span className="text-muted-foreground">
                {balance !== null ? `${balance.toFixed(2)} SOL` : '--'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem 
              onClick={() => navigate('/app/profile')}
              className="cursor-pointer"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDisconnect}
              className="cursor-pointer text-red-500 focus:text-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Connecting/signing state (outside modal)
  if (connecting || connectionPhase !== 'idle') {
    return (
      <Button
        variant="gold"
        size="sm"
        disabled
        className="flex items-center gap-2"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {getPhaseText() || 'Connecting...'}
      </Button>
    );
  }

  // NOT CONNECTED STATE: show "Log in" button
  return (
    <>
      <Button
        variant="gold"
        size="sm"
        onClick={openModal}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        Log in
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md bg-background border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-foreground">
              {connectionPhase === 'idle' ? 'Connect Wallet' : 'Verifying...'}
            </DialogTitle>
          </DialogHeader>
          
          {/* Show signing state */}
          {connectionPhase !== 'idle' && (
            <div className="py-8 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground text-center">
                {getPhaseText()}
              </p>
              {selectedWallet && (
                <p className="text-xs text-muted-foreground">
                  via {selectedWallet}
                </p>
              )}
            </div>
          )}

          {/* Show wallet list only when idle */}
          {connectionPhase === 'idle' && (
            <div className="mt-6 space-y-3">
              <AnimatePresence>
                {wallets.filter(w => w.readyState === 'Installed' || w.readyState === 'Loadable').length > 0 ? (
                  wallets
                    .filter(w => w.readyState === 'Installed' || w.readyState === 'Loadable')
                    .map((wallet, index) => (
                      <motion.button
                        key={wallet.adapter.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleWalletSelect(wallet.adapter.name)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-card/80 transition-all duration-200 group"
                      >
                        <img
                          src={wallet.adapter.icon}
                          alt={wallet.adapter.name}
                          className="w-10 h-10 rounded-lg"
                        />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {wallet.adapter.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {wallet.readyState === 'Installed' ? 'Detected' : 'Available'}
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-foreground font-medium mb-2">No Wallet Found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please install a Solana wallet to continue
                    </p>
                    <div className="flex flex-col gap-2">
                      <a
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Install Phantom →
                      </a>
                      <a
                        href="https://solflare.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Install Solflare →
                      </a>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {connectionPhase === 'idle' && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              A one-time signature will verify wallet ownership.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
