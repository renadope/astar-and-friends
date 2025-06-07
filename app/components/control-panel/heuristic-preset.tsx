import { useGridContext } from '~/state/context';
import { type ComponentPropsWithoutRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { capitalize } from '~/utils/helpers';
import { heuristicInfo } from '~/presets/heuristics';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import type { HeuristicName } from '~/utils/heuristics';
import { cn } from '~/lib/utils';

export function HeuristicPreset({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const { state, dispatch } = useGridContext();
  const [heuristicPopoverOpen, setHeuristicPopoverOpen] = useState(false);

  return (
    <div className={cn('space-y-2 flex flex-col', className)} {...props}>
      <label className="text-sm font-medium text-muted-foreground">Select Heuristic Function</label>
      <Popover open={heuristicPopoverOpen} onOpenChange={setHeuristicPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={heuristicPopoverOpen}
            className="w-full justify-between"
          >
            {capitalize(
              heuristicInfo.find((heuristic) => heuristic.value === state.heuristic.name)?.value ??
                'no selection'
            )}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-2/3">
          <Command>
            <CommandInput placeholder="Search heuristic..." />
            <CommandList>
              <CommandEmpty>No heuristic found.</CommandEmpty>
              <CommandGroup>
                {heuristicInfo.map((heuristicInfo) => (
                  <CommandItem
                    key={heuristicInfo.value}
                    value={heuristicInfo.value}
                    onSelect={(currentValue: string) => {
                      dispatch({
                        type: 'SET_HEURISTIC_FUNC',
                        payload: currentValue as HeuristicName,
                      });
                      setHeuristicPopoverOpen(false);
                    }}
                  >
                    {heuristicInfo.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        state.heuristic.name === heuristicInfo.value ? ' opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
