import { Link, type LinkProps } from 'react-router';
import { cn } from '~/lib/utils';
import { BookIcon } from '~/components/icons/icons';
import type { ReactNode } from 'react';
import { type ColorPreset, colorPresets } from '~/presets/glowing-button';

type GlowingButtonProps = LinkProps & {
  icon?: ReactNode;
  colorPreset?: ColorPreset;
};

export function GlowingButton({
  className,
  children,
  colorPreset = 'default',
  icon = <BookIcon className={'size-6 text-pink-600 rotate-6 group-hover:rotate-12'} />,
  ...props
}: GlowingButtonProps) {
  const colors = colorPresets[colorPreset];
  return (
    <div className={'relative group'}>
      <div
        className={`absolute -inset-4 bg-gradient-to-r ${colors.gradient}
         rounded-lg blur-lg opacity-80 group-hover:opacity-100
         transition duration-1000 group-hover:duration-200 animate-pulse`}
      ></div>
      <Link
        className={cn(
          `relative px-4 py-2 ${colors.background} rounded-lg leading-none flex items-center divide-x divide-gray-600`,
          className
        )}
        {...props}
      >
        <span className={'flex items-center space-x-5'}>
          {icon}
          <span
            className={`${colors.textColor} pr-6 group-hover:${colors.textColor} transition duration-200`}
          >
            {children}
          </span>
        </span>
      </Link>
    </div>
  );
}
