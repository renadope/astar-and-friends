import type { Route } from './+types/home';
import { GridProvider } from '~/state/context';
import Grid from '~/components/grid';
import ControlPanel from '~/components/control-panel/control-panel';
import { Link } from 'react-router';
import { GithubIcon, LinkedInIcon } from '~/components/icons/icons';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'aStar' }, { name: 'description', content: 'aStar Demo!' }];
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
      <footer className="text-center text-sm text-gray-500 mt-12 pb-4 border-t pt-4 border-gray-300">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-1">
            <p className="flex items-center space-x-1">
              <span>Built with ⚡️ by</span>
              <Link
                to="https://github.com/renadope"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-700 transition-colors"
              >
                <span
                  className={`bg-gradient-to-r
                           from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent
                           hover:from-pink-400 hover:via-fuchsia-400 hover:to-purple-400 transition-all duration-500`}
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
              <GithubIcon className={'size-5 hover:size-8 transition-all duration-300'} />
            </Link>
            <span>·</span>
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
