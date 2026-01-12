import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModuleCardProps {
  icon?: LucideIcon;
  iconImage?: string;
  title: string;
  description: string;
  accentColor?: string;
  children?: ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
  isBeta?: boolean;
  betaWarning?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  index?: number;
}

export const ModuleCard: FC<ModuleCardProps> = ({
  icon: Icon,
  iconImage,
  title,
  description,
  children,
  disabled = false,
  comingSoon = false,
  isBeta = false,
  betaWarning,
  isSelected = false,
  onSelect,
  index = 0,
}) => {
  const isClickable = !disabled && !comingSoon && onSelect;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Card
        onClick={isClickable ? onSelect : undefined}
        className={`relative bg-card shadow-card transition-all duration-300 h-full flex flex-col ${
          disabled 
            ? 'opacity-60 cursor-not-allowed border-primary/10' 
            : isSelected
              ? 'border-primary shadow-elevated ring-2 ring-primary/20'
              : isClickable
                ? 'border-primary/10 hover:-translate-y-1 hover:border-primary/25 hover:shadow-elevated cursor-pointer'
                : 'border-primary/10 hover:-translate-y-1 hover:border-primary/25 hover:shadow-elevated'
        }`}
      >
        {/* Top badges row */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isBeta && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold text-xs">
                      BETA
                    </Badge>
                    {betaWarning && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </TooltipTrigger>
                {betaWarning && (
                  <TooltipContent side="bottom" className="max-w-[250px] text-center">
                    <p className="text-xs">{betaWarning}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
          {comingSoon && (
            <span className="px-3 py-1.5 text-xs font-semibold bg-muted text-muted-foreground rounded-full tracking-wide uppercase">
              Coming Soon
            </span>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            {iconImage ? (
              <img src={iconImage} alt={title} className="h-12 w-12 object-contain shrink-0" />
            ) : Icon ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold shadow-gold shrink-0">
                <Icon className="h-6 w-6 text-white" />
              </div>
            ) : null}
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
              <CardDescription className="mt-0.5 font-medium">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        {children && (
          <CardContent className="pt-2 flex-1 flex flex-col">
            {children}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};