import { FC } from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Fee breakdown - no platform fee for now
export const FEES = {
  SWITCHBOARD_RENT_SOL: 0.022,          // Switchboard feed account rent (SOL)
  NETWORK_FEE_SOL: 0.002,               // Approximate Solana network fees (SOL)
} as const;

export const TOTAL_SOL_FEE = FEES.SWITCHBOARD_RENT_SOL + FEES.NETWORK_FEE_SOL;

export const FeeDisplay: FC = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="text-sm text-muted-foreground inline-flex items-center gap-1 cursor-help">
            Fee: <span className="text-primary font-semibold">~{TOTAL_SOL_FEE.toFixed(3)} SOL</span>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" collisionPadding={20} className="max-w-[300px] p-3 z-[100]">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Fee Breakdown:</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Oracle Account Rent</span>
                <span className="font-medium">{FEES.SWITCHBOARD_RENT_SOL} SOL</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Network Fees</span>
                <span className="font-medium">~{FEES.NETWORK_FEE_SOL} SOL</span>
              </div>
              <div className="border-t border-border pt-1.5 mt-1.5">
                <div className="flex justify-between gap-4 font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">~{TOTAL_SOL_FEE.toFixed(3)} SOL</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
