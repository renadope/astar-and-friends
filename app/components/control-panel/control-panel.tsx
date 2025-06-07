import { DEFAULT_PLAYBACK_SPEED_MS } from '~/state/constants';
import { useEffect } from 'react';
import { isNullOrUndefined } from '~/utils/helpers';
import { useGridContext } from '~/state/context';
import { getAlgorithmName } from '~/services/aStar';
import { CostWeightSliders } from '~/components/control-panel/cost-weight-sliders';
import { ToggleCell } from '~/components/control-panel/toggle-cell';
import { HeuristicPreset } from '~/components/control-panel/heuristic-preset';
import { WeightPreset } from '~/components/control-panel/weight-preset';
import { MultiVerse } from '~/components/control-panel/multi-verse';
import { ToggleDiagonal } from '~/components/control-panel/toggle-diagonal';
import { AlgoButtons } from '~/components/control-panel/algo-buttons';
import { PlaybackSpeedSlider } from '~/components/control-panel/playback-speed-slider';
import { PlaybackControls } from '~/components/control-panel/playback-controls';

export const gridSize = 8; //really need to remove this and add a selector/option for it

export default function ControlPanel() {
  const { state, dispatch } = useGridContext();
  const { aStarData, playbackSpeedFactor } = state;
  const algorithmName = getAlgorithmName(state.gwWeights.gWeight, state.gwWeights.hWeight);
  useEffect(() => {
    dispatch({
      type: 'GENERATE_GRID',
      payload: gridSize,
    });
  }, []);

  useEffect(() => {
    if (
      isNullOrUndefined(aStarData) ||
      state.weightGrid.length === 0 ||
      state.cellSelectionState !== 'inactive' ||
      !state.isPlaying
    ) {
      return;
    }

    const delay = Math.max(DEFAULT_PLAYBACK_SPEED_MS / playbackSpeedFactor, 50);

    let frameId: number;
    let lastTimestamp = performance.now();

    function animate(timestamp: number) {
      const elapsed = timestamp - lastTimestamp;
      if (elapsed >= delay) {
        lastTimestamp = timestamp;
        dispatch({ type: 'INCREMENT_INDEX' });
      }
      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [aStarData, state.weightGrid, state.cellSelectionState, state.isPlaying, playbackSpeedFactor]);

  return (
    <div
      className={`flex flex-col gap-3 2xs:gap-4 2xs:p-3 xs:p-4
             md:backdrop-blur-sm md:rounded-lg md:shadow md:border 2xs:border-t-4 md:border-t-0`}
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 2xs:p-3 sm:p-4 border border-blue-200">
        <div className="flex flex-col gap-2 2xs:gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2 text-xs 2xs:text-sm sm:text-base">
              📹 Playback Controls
            </h4>

            <div className="w-full lg:w-auto overflow-x-auto lg:overflow-visible">
              <div className="flex gap-1 min-w-max pb-1 lg:pb-0">
                <PlaybackSpeedSlider />
              </div>
            </div>
          </div>

          <div className="w-full">
            <PlaybackControls className="w-full" />
          </div>
        </div>
      </div>

      <div className={'flex flex-col gap-3'}>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg 2xs:text-xl sm:text-2xl md:text-3xl font-bold">{algorithmName}</h3>
          <p className="text-xs 2xs:text-sm text-gray-600">Configure and visualize pathfinding</p>
        </div>

        <div>
          <AlgoButtons />
        </div>
      </div>

      <div className={'flex flex-col lg:grid lg:grid-cols-2 gap-3 2xs:gap-4 lg:gap-6'}>
        <div className="bg-slate-200/90 rounded-md 2xs:rounded-lg p-2 2xs:p-3 sm:p-4 space-y-3 2xs:space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-xs 2xs:text-sm sm:text-base">
            🏗️ Grid Setup
          </h4>
          <ToggleCell />
          <CostWeightSliders />
        </div>

        <div className="bg-purple-50 rounded-md 2xs:rounded-lg p-2 2xs:p-3 sm:p-4 space-y-3 2xs:space-y-4">
          <h4 className="font-semibold text-purple-950 flex items-center gap-2 text-xs 2xs:text-sm sm:text-base">
            ⚙️ Algorithm Settings
          </h4>
          <ToggleDiagonal />
          <div className="grid grid-cols-1 gap-2 2xs:gap-3 sm:gap-4">
            <HeuristicPreset />
            <WeightPreset />
          </div>
          <MultiVerse />
        </div>
      </div>
    </div>
  );
}
