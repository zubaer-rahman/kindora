import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from '@/components/ui/tooltip';
  import { ReactNode } from 'react';
  
  type TooltipProps = {
    children: ReactNode;
    visibleContent: ReactNode;
    align?: 'center' | 'end' | 'start' | undefined;
  };
  
  function SharedTooltip({
    children,
    visibleContent,
    align = 'center',
  }: TooltipProps) {
    return (
      <TooltipProvider >
        <Tooltip >
          <TooltipTrigger  asChild>{visibleContent}</TooltipTrigger>
          <TooltipContent  align={align} className="bg-white shadow-lg p-0">
            <div className="bg-white">{children}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  export default SharedTooltip;

  