import { FC } from 'react';
import { AlertTriangle, Wallet, Server, Zap, ArrowRight, Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CREATION_FEE_AXIS } from '@/config/constants';

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

  const formattedAxisFee = CREATION_FEE_AXIS.toLocaleString();

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
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Platform Fee</span>
              </div>
              <span className="font-mono font-medium text-primary">{formattedAxisFee} $AXIS</span>
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
            
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Token Fee</span>
                <span className="font-mono font-bold text-lg text-primary">{formattedAxisFee} $AXIS</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>+ SOL for rent/gas</span>
                <span className="font-mono">~0.024 SOL</span>
              </div>
            </div>
          </div>

          {/* Info about token transfer */}
          <div className="flex gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <Coins className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">
                Two transactions required
              </p>
              <p className="text-muted-foreground">
                First you'll approve the {formattedAxisFee} $AXIS transfer, then sign the oracle creation transaction.
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
