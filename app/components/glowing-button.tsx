import { Link, type LinkProps } from 'react-router';
import { cn } from '~/lib/utils';
import { BookIcon } from '~/components/icons/icons';
import type { ReactNode } from 'react';

type GlowingButtonProps = LinkProps & {
  icon?: ReactNode;
};

export function GlowingButton({
  className,
  children,
  icon = <BookIcon className={'size-6 text-pink-600 rotate-6 group-hover:rotate-12'} />,
  ...props
}: GlowingButtonProps) {
  return (
    <div className={'relative group'}>
      <div
        className={`absolute -inset-2.5 bg-gradient-to-r from-pink-600 to-purple-600 
         rounded-lg blur-lg opacity-90 group-hover:opacity-100
         transition duration-1000 group-hover:duration-200 animate-[tilt_3s_ease-in-out_infinite]`}
      ></div>
      <Link
        className={cn(
          'relative px-4 py-2 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600',
          className
        )}
        {...props}
      >
        <span className={'flex items-center space-x-5'}>
          {icon}
          <span className={'text-gray-100 pr-6 group-hover:text-gray-50 transition duration-200'}>
            {children}
          </span>
        </span>
      </Link>
    </div>
  );
}
