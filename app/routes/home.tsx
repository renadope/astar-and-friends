import type { Route } from './+types/home';
import { GridProvider } from '~/state/context';
import Grid from '~/components/grid';
import ControlPanel from '~/components/control-panel/control-panel';
import { Link } from 'react-router';
import { GithubIcon, LinkedInIcon } from '~/components/icons/icons';
import { GlowingButton } from '~/components/glowing-button';
import { SwordIcon } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'A* and Friends – Interactive Pathfinding Visualizer' },
    {
      name: 'description',
      content:
        'Interactive visualization of A*, Dijkstra, BFS, and Greedy BFS algorithms with advanced controls and step-by-step debugging.',
    },

    { name: 'theme-color', content: '#0f172a' },

    { property: 'og:title', content: 'A* and Friends – Interactive Pathfinding Visualizer' },
    {
      property: 'og:description',
      content:
        'Interactive visualization of A*, Dijkstra, BFS, and Greedy BFS algorithms with advanced controls and step-by-step debugging.',
    },
    { property: 'og:image', content: 'https://astarandfriends.io/preview.png' },
    { property: 'og:url', content: 'https://astarandfriends.io' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'A* and Friends' },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'A* and Friends – Interactive Pathfinding Visualizer' },
    {
      name: 'twitter:description',
      content:
        'Try A*, Dijkstra, BFS, and Greedy BFS algorithms in an interactive playground with animations and step-by-step visualization.',
    },
    { name: 'twitter:image', content: 'https://astarandfriends.io/preview.png' },
  ];
}

export function Main() {
  return (
    <div className="w-full max-w-[90%] mx-auto 2xs:p-0.5 sm:p-2 md:pt-10 pb-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col 3xl:flex-row gap-3 sm:gap-4 3xl:gap-6">
          <div className="3xl:flex-shrink-0 3xl:w-auto min-w-0">
            <Grid />
          </div>
          <div className="3xl:flex-1 3xl:min-w-[360px]">
            <ControlPanel />
          </div>
        </div>
      </div>
      <footer className="text-center text-lg text-gray-500 mt-12 pb-4 border-t pt-4 border-gray-200">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-1">
            <p className="flex items-center space-x-1">
              <Link to={'https://renado.cv'} target="_blank" rel="noopener noreferrer">
                <span
                  className="relative inline-block
                  bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 bg-[length:200%_100%]
                  bg-clip-text text-transparent
                  animate-[gradient-slide_4s_linear_infinite]
                  hover:animate-[gradient-slide_1.5s_linear_infinite]
                  hover:scale-[1.08] hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.45)]
                  transition-all duration-400
                  after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full
                  after:bg-gradient-to-r after:from-purple-500 after:via-fuchsia-500 after:to-pink-500
                  after:origin-left after:scale-x-0 hover:after:scale-x-100
                  after:transition-transform after:duration-400"
                >
                  Renado
                </span>
              </Link>
            </p>

            <span>·</span>

            <Link
              to="https://www.linkedin.com/in/renadope"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <LinkedInIcon className={'size-5 hover:size-7 transition-all duration-300'} />
            </Link>

            <span>·</span>

            <Link
              to="https://github.com/renadope/astar-and-friends"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
            >
              <GithubIcon
                className={
                  'size-5 hover:size-8 transition-all duration-300 animate-[wiggle_1s_ease-in-out_infinite]'
                }
              />
            </Link>
            <span>·</span>

            <GlowingButton
              to={'https://ktfo.gg/'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fight Picks"
              colorPreset={'neon'}
              renderIcon={({ className }) => <SwordIcon className={className} />}
            >
              ktfo.gg
            </GlowingButton>
          </div>

          <p className="text-xs">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <GridProvider>
      <Main />
    </GridProvider>
  );
}
