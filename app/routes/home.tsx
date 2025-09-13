import type { Route } from './+types/home';
import { GridProvider } from '~/state/context';
import Grid from '~/components/grid';
import ControlPanel from '~/components/control-panel/control-panel';
import { Link } from 'react-router';
import { GithubIcon, LinkedInIcon } from '~/components/icons/icons';
import { GlowingButton } from '~/components/glowing-button';

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
              <Link to="https://github.com/renadope" target="_blank" rel="noopener noreferrer">
                <span
                  className={`bg-gradient-to-r
                           from-purple-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent
                           hover:from-pink-600 hover:via-fuchsia-600 hover:to-purple-600 hover:text-2xl
                            transition-all duration-500`}
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
              to={'https://renado.gitbook.io/advanced-react-pathfinding'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Official Course"
            >
              Course
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
