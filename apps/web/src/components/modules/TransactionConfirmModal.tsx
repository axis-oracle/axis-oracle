import { FC } from 'react';
import { AlertTriangle, Wallet, Server, Zap, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TransactionConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  feedTitle?: string;
}

export const TransactionConfirmModal: FC<TransactionConfirmModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  feedTitle,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Transaction Breakdown
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review the full cost before signing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Fee Breakdown */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">Platform Fee</span>
              </div>
              <span className="font-mono font-medium text-foreground">0.02 SOL</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Oracle Account Rent</span>
              </div>
              <span className="font-mono font-medium text-foreground">~0.022 SOL</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Network Fees</span>
              </div>
              <span className="font-mono font-medium text-foreground">~0.002 SOL</span>
            </div>
            
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-mono font-bold text-lg text-primary">~0.044 SOL</span>
              </div>
            </div>
          </div>

          {/* Warning about Phantom display */}
          <div className="flex gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                Phantom will show only 0.02 SOL
              </p>
              <p className="text-muted-foreground">
                The remaining ~0.024 SOL for oracle account creation is handled internally by Solana and won't appear in the wallet simulation.
              </p>
            </div>
          </div>

          {/* Feed Title Preview */}
          {feedTitle && (
            <div className="text-sm">
              <span className="text-muted-foreground">Creating: </span>
              <span className="font-medium text-foreground">{feedTitle}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="gold"
            onClick={handleConfirm}
          >
            Confirm & Sign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
