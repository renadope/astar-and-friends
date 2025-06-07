import { type ComponentPropsWithoutRef } from 'react';
import { useGridContext } from '~/state/context';
import { cn } from '~/lib/utils';
import { Edit3, RefreshCcw } from 'lucide-react';
import { gridSize } from '~/components/control-panel/control-panel';
import { toast } from 'sonner';
import { isNullOrUndefined } from '~/utils/helpers';

export function AlgoButtons({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const { state, dispatch } = useGridContext();
  return (
    <div
      className={cn('bg-white rounded-xl 2xs:p-1 w-full min-w-0 overflow-hidden', className)}
      {...props}
    >
      <div className="flex flex-wrap gap-2 2xs:gap-3 justify-start 2xl:justify-start min-w-0">
        <button
          disabled={isNullOrUndefined(state.aStarData)}
          className={`group px-2 2xs:px-3 sm:px-4 py-2 2xs:py-3 bg-gradient-to-br
                    from-pink-500 via-fuchsia-500 to-pink-600 hover:from-pink-600 hover:via-fuchsia-600 hover:to-pink-700
                    text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300
                     font-semibold xs:text-xs 2xs:text-sm transform 
                     hover:scale-105 hover:-translate-y-0.5 flex items-center justify-center flex-shrink-0
                     disabled:hover:scale-100 disabled:translate-y-0 
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     disabled:hover:border-transparent disabled:hover:bg-transparent
          `}
          onClick={() => {
            dispatch({ type: 'RESET_ASTAR_DATA' });
          }}
        >
          <Edit3 className="w-4 2xs:w-5 h-4 2xs:h-5 group-hover:scale-110 transition-transform duration-300" />
        </button>
        <button
          className="group px-2 2xs:px-3 sm:px-4 lg:px-6 py-2 2xs:py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-1 2xs:gap-1.5 font-semibold text-xs 2xs:text-sm transform hover:scale-105 hover:-translate-y-0.5 min-w-0 flex-shrink"
          onClick={() => {
            dispatch({ type: 'GENERATE_GRID', payload: gridSize });
          }}
        >
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          </div>
          <span className="hidden sm:inline truncate">Generate Grid</span>
          <span className="sm:hidden truncate">New Grid</span>
        </button>

        <button
          className={`group relative px-2 2xs:px-3 sm:px-4 lg:px-6 py-2 2xs:py-3 bg-gradient-to-r text-white rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-1 2xs:gap-1.5 font-bold text-xs 2xs:text-sm overflow-hidden min-w-0 flex-shrink ${
            state.configChanged
              ? 'from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 animate-pulse shadow-lime-500/25 shadow-2xl transform scale-105'
              : 'from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 hover:scale-105 hover:-translate-y-0.5'
          } hover:shadow-xl`}
          onClick={() => {
            dispatch({ type: 'RUN_ASTAR', payload: { options: { autoRun: true } } });
          }}
        >
          <div className="relative flex items-center gap-1 2xs:gap-1.5 min-w-0">
            <div className="relative flex-shrink-0">
              {state.configChanged && (
                <div className="absolute -inset-1 bg-white/30 rounded-full animate-ping"></div>
              )}
            </div>
            <span className="relative hidden sm:inline truncate">Run Algorithm</span>
            <span className="relative sm:hidden truncate">Run</span>
          </div>
        </button>

        <button
          className={`group relative px-2 2xs:px-3 sm:px-4 py-2 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5 2xs:gap-2 font-medium hover:scale-105 hover:-translate-y-0.5 hover:shadow-md min-w-0 flex-shrink ${
            state.configChanged
              ? 'border-2 border-blue-400 bg-blue-50 text-blue-700 shadow-blue-100'
              : ''
          }`}
          onClick={() => {
            dispatch({ type: 'RUN_ASTAR' });
            toast('✨AStar Data Loaded✨', {
              description: 'Data has been loaded, you can now manually scrub',
              position: 'top-center',
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 2xs:w-5 h-4 2xs:h-5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <div className="text-left min-w-0">
            <div className="text-xs 2xs:text-sm font-medium truncate">
              <span className="hidden lg:inline">Calculate Path</span>
              <span className="lg:hidden">Calculate</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
