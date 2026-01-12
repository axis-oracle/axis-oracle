import { FC } from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Fee breakdown (in SOL)
export const FEES = {
  PLATFORM_FEE: 0.02,      // Goes to treasury
  SWITCHBOARD_RENT: 0.022, // Switchboard feed account rent
  NETWORK_FEE: 0.002,      // Approximate Solana network fees
  // Total: ~0.044 SOL
} as const;

export const TOTAL_FEE_SOL = FEES.PLATFORM_FEE + FEES.SWITCHBOARD_RENT + FEES.NETWORK_FEE;

export const FeeDisplay: FC = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="text-sm text-muted-foreground inline-flex items-center gap-1 cursor-help">
            Fee: <span className="text-primary font-semibold">~{TOTAL_FEE_SOL.toFixed(3)} SOL</span>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" collisionPadding={20} className="max-w-[280px] p-3 z-[100]">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Fee Breakdown:</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">{FEES.PLATFORM_FEE} SOL</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Oracle Account Rent</span>
                <span className="font-medium">{FEES.SWITCHBOARD_RENT} SOL</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Network Fees</span>
                <span className="font-medium">~{FEES.NETWORK_FEE} SOL</span>
              </div>
              <div className="border-t border-border pt-1.5 mt-1.5 flex justify-between gap-4 font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">~{TOTAL_FEE_SOL.toFixed(3)} SOL</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
